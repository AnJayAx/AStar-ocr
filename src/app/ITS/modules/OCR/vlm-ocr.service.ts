import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface VlmOcrResult {
  /** Cleaned/upper-cased serial number — only set when explicitly labeled (S/N, Serial). */
  serial: string;
  /** Cleaned/upper-cased part number — only set when explicitly labeled (P/N, Part). */
  partNumber: string;
  /** Other alphanumeric codes detected on the label that weren't labeled as S/N or P/N. */
  candidates: string[];
  /** Raw model JSON output (for debugging). */
  raw: string;
  /** Total request/response latency in ms (network + decode). */
  latencyMs: number;
  /** True iff the call was aborted by the latency budget. */
  timedOut: boolean;
}

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
}

/**
 * Sends a Base64 image to Gemini and returns structured serial + part number.
 * Either field may be empty if absent on the scanned label. Designed for the
 * Zebra TC22 OCR flow: tight latency budget, structured JSON output.
 */
@Injectable({ providedIn: 'root' })
export class VlmOcrService {
  private static readonly DEFAULT_LATENCY_BUDGET_MS = 3000;
  private static readonly DEFAULT_MAX_OUTPUT_TOKENS = 100;

  private static readonly SYSTEM_PROMPT =
    'You are an industrial label reader. Read every alphanumeric code on the label and classify each one.\n' +
    '\n' +
    'Return a JSON object with three keys:\n' +
    '- "serial": the value labeled with "S/N", "SN", "Serial", "Serial No." etc. Empty string "" if not explicitly labeled.\n' +
    '- "partNumber": the value labeled with "P/N", "PN", "Part", "Part No." etc. Empty string "" if not explicitly labeled.\n' +
    '- "candidates": an array of any OTHER alphanumeric codes visible on the label that are NOT labeled as serial or part number. Could be model codes, batch numbers, lot codes, etc. Empty array [] if none.\n' +
    '\n' +
    'Rules:\n' +
    '- Only assign a value to "serial" or "partNumber" if the label clearly prefixes it. If a code has no prefix, put it in "candidates" instead.\n' +
    '- Do not include the prefix (S/N, P/N, etc.) in the returned strings.\n' +
    '- Verify ambiguous characters (0 vs O, 1 vs I, 5 vs S, 8 vs B).\n' +
    '- Do not invent values. If unsure, omit.\n' +
    '- Ignore short text fragments under 4 characters and pure dictionary words.';

  private static readonly RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
      serial: { type: 'string' },
      partNumber: { type: 'string' },
      candidates: { type: 'array', items: { type: 'string' } },
    },
    required: ['serial', 'partNumber', 'candidates'],
    propertyOrdering: ['serial', 'partNumber', 'candidates'],
  };

  /**
   * Run Gemini OCR on a Base64-encoded image of an industrial label.
   *
   * @param imageBase64 Either a raw Base64 payload or a `data:image/...;base64,...` URL.
   * @param mimeType    Defaults to 'image/jpeg'.
   */
  async extract(imageBase64: string, mimeType = 'image/jpeg'): Promise<VlmOcrResult> {
    const apiKey = (environment as any).GEMINI_API_KEY as string | undefined;
    const model = ((environment as any).GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      throw new Error(
        'VlmOcrService: GEMINI_API_KEY is not configured in environment.*.ts. ' +
          'Add the rotated key to environment.mobile-dev.ts / environment.mobile-prod.ts.'
      );
    }

    const latencyBudgetMs = this.coercePositiveInt(
      (environment as any).GEMINI_LATENCY_BUDGET_MS as number | string | undefined,
      VlmOcrService.DEFAULT_LATENCY_BUDGET_MS,
      1_000,
      30_000
    );

    const maxOutputTokens = this.coercePositiveInt(
      (environment as any).GEMINI_MAX_OUTPUT_TOKENS as number | string | undefined,
      VlmOcrService.DEFAULT_MAX_OUTPUT_TOKENS,
      20,
      512
    );

    const data = this.stripDataUrlPrefix(imageBase64);
    if (!data) throw new Error('VlmOcrService: empty image payload');

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(apiKey)}`;

    const body = {
      system_instruction: { parts: [{ text: VlmOcrService.SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [{ inline_data: { mime_type: mimeType, data } }],
        },
      ],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens,
        responseMimeType: 'application/json',
        responseSchema: VlmOcrService.RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), latencyBudgetMs);
    const startedAt = performance.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
        keepalive: true,
      });

      if (!response.ok) {
        const errText = await this.safeReadText(response);
        throw new Error(`VlmOcrService: Gemini ${response.status} ${response.statusText} — ${errText}`);
      }

      const json = (await response.json()) as GeminiResponse;
      const latencyMs = Math.round(performance.now() - startedAt);

      if (json.error) {
        throw new Error(`VlmOcrService: Gemini error ${json.error.status ?? json.error.code} — ${json.error.message ?? ''}`);
      }
      if (json.promptFeedback?.blockReason) {
        throw new Error(`VlmOcrService: prompt blocked — ${json.promptFeedback.blockReason}`);
      }

      const raw = this.firstText(json).trim();
      const parsed = this.parseStructured(raw);
      const serial = this.cleanToken(parsed.serial);
      const partNumber = this.cleanToken(parsed.partNumber);
      const candidates = (parsed.candidates ?? [])
        .map((c) => this.cleanToken(c))
        .filter((c) => c.length >= 4)
        .filter((c) => c !== serial && c !== partNumber);

      if (latencyMs > latencyBudgetMs) {
        console.warn(`[VlmOcrService] Latency ${latencyMs}ms exceeded ${latencyBudgetMs}ms budget.`);
      }

      console.log(
        `[VlmOcrService] ${latencyMs}ms — serial="${serial}" partNumber="${partNumber}" candidates=[${candidates.join(', ')}]`
      );

      return { serial, partNumber, candidates, raw, latencyMs, timedOut: false };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startedAt);
      if (err?.name === 'AbortError') {
        console.warn(`[VlmOcrService] Aborted after ${latencyMs}ms (budget ${latencyBudgetMs}ms).`);
        return { serial: '', partNumber: '', candidates: [], raw: '', latencyMs, timedOut: true };
      }
      throw err;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private stripDataUrlPrefix(input: string): string {
    if (!input) return '';
    const idx = input.indexOf('base64,');
    return idx >= 0 ? input.slice(idx + 'base64,'.length) : input;
  }

  private firstText(json: GeminiResponse): string {
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (typeof p.text === 'string' && p.text.length > 0) return p.text;
    }
    return '';
  }

  private parseStructured(raw: string): { serial?: string; partNumber?: string; candidates?: string[] } {
    if (!raw) return {};
    let text = raw.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    try {
      const obj = JSON.parse(text);
      const candidates = Array.isArray(obj?.candidates)
        ? obj.candidates.filter((c: any): c is string => typeof c === 'string')
        : [];
      return {
        serial: typeof obj?.serial === 'string' ? obj.serial : '',
        partNumber: typeof obj?.partNumber === 'string' ? obj.partNumber : '',
        candidates,
      };
    } catch {
      console.warn('[VlmOcrService] Could not parse JSON output:', text);
      return {};
    }
  }

  private cleanToken(value: string | undefined): string {
    if (!value) return '';
    return value
      .toUpperCase()
      .replace(/^["'`\s]+|["'`\s.]+$/g, '')
      .replace(/^(?:S\/N|SN|P\/N|PN|SERIAL(?:\s*NO\.?)*|PART(?:\s*NO\.?)?)[\s:.-]*/i, '')
      .trim();
  }

  private async safeReadText(r: Response): Promise<string> {
    try {
      return (await r.text()).slice(0, 500);
    } catch {
      return '';
    }
  }

  private coercePositiveInt(value: number | string | undefined, fallback: number, min: number, max: number): number {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? parseInt(value, 10) : NaN;
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }
}
