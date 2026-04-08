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

  constructor() {}

  // ── OCR processing ────────────────────────────────────────────────────────

  /**
   * Called with the lines array from a CameraXOCR "ocrResult" event.
   * Stores all detected lines for the UI and returns the first matched Block,
   * or null if nothing qualifies as the serial number.
   */
  processOcrLines(lines: MLKitTextLine[]): Block | null {
    this.detectedLines = lines.map((l) => l.text);

    for (const line of lines) {
      const serialNo = this.extractSerialNo(line.text);
      if (!serialNo) continue;

      // Corner points stay in the 0–1000 space the plugin already produces.
      // The component divides by 1000 when mapping to canvas pixels.
      const cornerPoints: CornersPoints = {
        topLeft:     { x: line.left,  y: line.top    },
        topRight:    { x: line.right, y: line.top    },
        bottomRight: { x: line.right, y: line.bottom },
        bottomLeft:  { x: line.left,  y: line.bottom },
      };

      return { text: serialNo, cornerPoints };
    }

    return null;
  }

  /** Returns the first non-empty trimmed line — no prefix or regex required. */
  private extractSerialNo(rawText: string): string | null {
    if (!rawText) return null;
    return rawText.trim() || null;
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
