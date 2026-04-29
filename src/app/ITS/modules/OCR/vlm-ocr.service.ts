import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface VlmOcrResult {
  /** Cleaned/upper-cased serial number, or empty string if not present on the label. */
  serial: string;
  /** Cleaned/upper-cased part number, or empty string if not present on the label. */
  partNumber: string;
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
  /** Hard upper bound on a single round-trip. Gemini Flash-Lite from SEA
   *  typically lands at 1.2–2.5s; 3s gives headroom without hanging the UI. */
  private static readonly LATENCY_BUDGET_MS = 3000;

  private static readonly SYSTEM_PROMPT =
    'You are an industrial label reader. Extract the SERIAL NUMBER and PART NUMBER from the image. ' +
    'Labels often prefix them with "S/N", "SN", "Serial No.", "P/N", "PN", "Part No.". ' +
    'Verify ambiguous characters carefully (0 vs O, 1 vs I, 5 vs S, 8 vs B). ' +
    'Return ONLY a JSON object with keys "serial" and "partNumber". ' +
    'Use an empty string "" for any field that is not visibly present on the label. ' +
    'Do not invent values. Do not include the prefix in the returned strings.';

  private static readonly RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
      serial:     { type: 'string' },
      partNumber: { type: 'string' },
    },
    required: ['serial', 'partNumber'],
    propertyOrdering: ['serial', 'partNumber'],
  };

  /**
   * Run Gemini OCR on a Base64-encoded image of an industrial label.
   *
   * @param imageBase64 Either a raw Base64 payload or a `data:image/...;base64,...` URL.
   * @param mimeType    Defaults to 'image/jpeg'.
   */
  async extract(imageBase64: string, mimeType = 'image/jpeg'): Promise<VlmOcrResult> {
    const apiKey = (environment as any).GEMINI_API_KEY as string | undefined;
    const model  = ((environment as any).GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      throw new Error(
        'VlmOcrService: GEMINI_API_KEY is not configured in environment.*.ts. ' +
        'Add the rotated key to environment.mobile-dev.ts / environment.mobile-prod.ts.'
      );
    }

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
          parts: [
            { inline_data: { mime_type: mimeType, data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 100,
        responseMimeType: 'application/json',
        responseSchema: VlmOcrService.RESPONSE_SCHEMA,
        // Force non-thinking mode. No-op on Lite (already off); critical on Flash
        // where thinking is on by default and would blow the latency budget.
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), VlmOcrService.LATENCY_BUDGET_MS);

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
      const serial     = this.cleanToken(parsed.serial);
      const partNumber = this.cleanToken(parsed.partNumber);

      if (latencyMs > VlmOcrService.LATENCY_BUDGET_MS) {
        console.warn(`[VlmOcrService] Latency ${latencyMs}ms exceeded ${VlmOcrService.LATENCY_BUDGET_MS}ms budget.`);
      }
      console.log(`[VlmOcrService] ${latencyMs}ms — serial="${serial}" partNumber="${partNumber}"`);

      return { serial, partNumber, raw, latencyMs, timedOut: false };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startedAt);
      if (err?.name === 'AbortError') {
        console.warn(`[VlmOcrService] Aborted after ${latencyMs}ms (budget ${VlmOcrService.LATENCY_BUDGET_MS}ms).`);
        return { serial: '', partNumber: '', raw: '', latencyMs, timedOut: true };
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

  /**
   * Gemini in JSON mode returns a JSON string. Parse defensively — if the model
   * stutters and wraps it in code fences, strip those before parsing.
   */
  private parseStructured(raw: string): { serial?: string; partNumber?: string } {
    if (!raw) return {};
    let text = raw.trim();
    // Strip ``` fences just in case.
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    try {
      const obj = JSON.parse(text);
      return {
        serial:     typeof obj?.serial === 'string'     ? obj.serial     : '',
        partNumber: typeof obj?.partNumber === 'string' ? obj.partNumber : '',
      };
    } catch {
      console.warn('[VlmOcrService] Could not parse JSON output:', text);
      return {};
    }
  }

  /**
   * Defensive cleanup of an extracted token: uppercase, strip surrounding
   * quotes/whitespace, and remove any "S/N:"-style prefix the model may have
   * left in despite instructions.
   */
  private cleanToken(value: string | undefined): string {
    if (!value) return '';
    return value
      .toUpperCase()
      .replace(/^["'`\s]+|["'`\s.]+$/g, '')
      .replace(/^(?:S\/N|SN|P\/N|PN|SERIAL(?:\s*NO\.?)?|PART(?:\s*NO\.?)?)[\s:.-]*/i, '')
      .trim();
  }

  private async safeReadText(r: Response): Promise<string> {
    try { return (await r.text()).slice(0, 500); } catch { return ''; }
  }
}
