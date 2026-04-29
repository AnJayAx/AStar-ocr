import { Injectable } from '@angular/core';
import { Block, CornersPoints } from '@its/shared/interfaces/backend/Wheel';
import { MLKitTextLine } from '@its/shared/interfaces/plugins/MLKitOCRPlugin';

@Injectable({ providedIn: 'root' })
export class OcrService {
  // results
  public currSerialNo: string = '';
  public currPartNoList: string[] = [];

  public lastRoute: string = '';
  public requireServerCheck: boolean = true;
  public toOCRPage: boolean = true;
  public originalRegexFormat: RegExp | null = null;
  public regexFormat: string = '';

  /** Every text line detected in the last frame, shown in the UI regardless of match */
  public detectedLines: string[] = [];

  /** Candidate serial numbers extracted from the last frame (best-first). */
  public detectedSerialCandidates: string[] = [];

  /** Other number-like tokens extracted from the last frame (best-effort). */
  public detectedNumbers: string[] = [];

  constructor() {}

  // ── OCR processing ────────────────────────────────────────────────────────

  /**
   * Called with the lines array from a CameraXOCR "ocrResult" event.
   * Stores all detected lines for the UI and returns the first matched Block,
   * or null if nothing qualifies as the serial number.
   */
  processOcrLines(lines: MLKitTextLine[]): Block | null {
    this.detectedLines = lines.map((l) => l.text);
    this.detectedSerialCandidates = [];
    this.detectedNumbers = [];

    const seenSerial = new Set<string>();
    const seenNumbers = new Set<string>();

    type Scored = { text: string; score: number; line: MLKitTextLine };
    const scored: Scored[] = [];

    for (const line of lines) {
      const raw = (line.text ?? '').trim();
      if (!raw) continue;

      // Collect number-like tokens (includes serial-like alphanumerics).
      for (const token of this.extractNumberLikeTokens(raw)) {
        if (!seenNumbers.has(token)) {
          seenNumbers.add(token);
          this.detectedNumbers.push(token);
        }
      }

      // Collect serial candidates and score them.
      for (const candidate of this.extractSerialCandidates(raw)) {
        if (!candidate) continue;
        if (seenSerial.has(candidate)) continue;
        seenSerial.add(candidate);
        this.detectedSerialCandidates.push(candidate);
        scored.push({ text: candidate, score: this.scoreSerialCandidate(candidate, raw), line });
      }
    }

    if (scored.length === 0) return null;

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const cornerPoints: CornersPoints = {
      topLeft:     { x: best.line.left,  y: best.line.top    },
      topRight:    { x: best.line.right, y: best.line.top    },
      bottomRight: { x: best.line.right, y: best.line.bottom },
      bottomLeft:  { x: best.line.left,  y: best.line.bottom },
    };

    return { text: best.text, cornerPoints };
  }

  private extractSerialCandidates(rawText: string): string[] {
    const raw = (rawText ?? '').trim();
    if (!raw) return [];

    const out: string[] = [];

    // Candidate 1: full line, normalised.
    const full = this.normalizeToken(raw);
    const fullStripped = this.stripSerialPrefixes(full);
    if (this.isPlausibleSerial(fullStripped)) out.push(fullStripped);

    // Candidate 2+: token-level extraction (helps when line includes other words).
    const tokens = raw
      .toUpperCase()
      .replace(/[^A-Z0-9\/\s:.-]/g, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    for (const t of tokens) {
      const tok = this.stripSerialPrefixes(this.normalizeToken(t));
      if (this.isPlausibleSerial(tok)) out.push(tok);
    }

    // De-dup while preserving order.
    return Array.from(new Set(out));
  }

  private extractNumberLikeTokens(rawText: string): string[] {
    const raw = (rawText ?? '').toUpperCase();
    if (!raw) return [];

    // Pull out longer sequences that could be serials/part numbers.
    // Keep it permissive: alphanumerics length>=4 and contains at least one digit.
    const cleaned = raw.replace(/[^A-Z0-9]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    for (const t of tokens) {
      if (t.length < 4 || t.length > 32) continue;
      if (!/\d/.test(t)) continue;
      out.push(t);
    }
    return Array.from(new Set(out));
  }

  private normalizeToken(text: string): string {
    return (text ?? '')
      .trim()
      .toUpperCase()
      // Remove whitespace and most punctuation so matching is consistent.
      .replace(/\s+/g, '')
      .replace(/[^A-Z0-9\/]/g, '');
  }

  private stripSerialPrefixes(text: string): string {
    // Accept common variants: SN, S/N, PN, P/N, SERIALNO, etc.
    // Operates on an already-normalised (no spaces) token.
    return (text ?? '')
      .replace(/^(?:S\/N|SN|P\/N|PN|SERIALNO|SERIAL|PARTNO|PART)[:\-]*/i, '')
      .replace(/^[:\-]+/, '');
  }

  private isPlausibleSerial(token: string): boolean {
    if (!token) return false;
    if (token.length < 6 || token.length > 24) return false;
    if (!/\d/.test(token)) return false;
    if (!/^[A-Z0-9]+$/.test(token)) return false;

    // If a format regex exists, require it to match either token or a prefixed form.
    // (The regex may allow optional SN/PN prefix.)
    if (this.originalRegexFormat) {
      const r = this.originalRegexFormat;
      return r.test(token) || r.test(`SN${token}`) || r.test(`S/N${token}`) || r.test(`PN${token}`) || r.test(`P/N${token}`);
    }
    return true;
  }

  private scoreSerialCandidate(candidate: string, rawLine: string): number {
    let score = 0;
    const token = candidate ?? '';
    const raw = (rawLine ?? '').toUpperCase();

    if (this.originalRegexFormat) {
      const r = this.originalRegexFormat;
      if (r.test(token) || r.test(`SN${token}`) || r.test(`S/N${token}`) || r.test(`PN${token}`) || r.test(`P/N${token}`)) {
        score += 1000;
      }
    }

    if (/\bS\/?N\b|\bSN\b/.test(raw)) score += 40;
    if (/\bP\/?N\b|\bPN\b/.test(raw)) score += 30;

    // Prefer tokens that look like real identifiers.
    if (/\d/.test(token)) score += 80;
    if (/[A-Z]/.test(token)) score += 30;

    // Length heuristic: prefer 8–16-ish.
    const len = token.length;
    score += Math.max(0, 60 - Math.abs(12 - len) * 5);

    // Penalise obviously noisy strings.
    if (/^(\d)\1{5,}$/.test(token)) score -= 80; // repeated digits
    if (/^(.)\1{7,}$/.test(token)) score -= 80;

    return score;
  }

  setRegexFormat(format: RegExp) {
    this.originalRegexFormat = format;
    this.regexFormat = format.source;
  }
  removeRegexFormat() {
    this.regexFormat = '';
    this.originalRegexFormat = null;
  }

  // ── Serial no ─────────────────────────────────────────────────────────────
  setSerialNo(v: string) { this.currSerialNo = v; }
  getSerialNo() { return this.currSerialNo; }

  // ── Part no list ──────────────────────────────────────────────────────────
  setPartNoList(v: string[]) { this.currPartNoList = v; }
  getPartNoList() { return this.currPartNoList; }

  // ── Last route ────────────────────────────────────────────────────────────
  setLastRoute(v: string) { this.lastRoute = v; }
  getLastRoute() { return this.lastRoute; }

  // ── Navigation direction ──────────────────────────────────────────────────
  setToOCRPage(v: boolean) { this.toOCRPage = v; }
  getToOCRPage() { return this.toOCRPage; }
}
