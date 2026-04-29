import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core/types/definitions';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { NativeAudio } from '@capacitor-community/native-audio';

import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { Router } from '@angular/router';
import { OcrService } from '../../ocr.service';
import { VlmOcrService } from '../../vlm-ocr.service';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { Wheel, WheelFormat } from '@its/shared/interfaces/backend/Wheel';
import CameraXOCR, { CameraXOCRPreviewFrame } from '@its/shared/interfaces/plugins/CameraXOCRPlugin';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.scss'],
})
export class OCRComponent implements OnInit, AfterViewInit, OnDestroy {

  // ===== ROI =====
  cropCanvas: HTMLCanvasElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;
  previewCanvas: HTMLCanvasElement | null = null;
  roiRect: HTMLDivElement | null = null;

  private ocrInFlight = false;
  /** True between "trigger pressed" and "OCR call dispatched". */
  private triggerPending = false;
  private hwTriggerListener?: () => void;

  // ===== Camera / preview =====
  previewParent = 'camera-preview-host';
  previewContainer: HTMLDivElement | null = null;
  alertContainer: HTMLDivElement | null = null;
  cameraStarted = false;

  // ===== Scanning state =====
  ocrSwitchedOn = false;

  // ===== OCR Results =====
  wheelFormat: RegExp | null = null;
  resultsDisplayed = true;
  menuContainer: HTMLDivElement | null = null;
  resultsDetected = false;
  currRes = '';

  // ===== Gemini OCR result (driven by OCR Scan toggle) =====
  serialNo = '';
  partNo   = '';
  vlmStatus = '';
  /** True iff the returned serial passed the wheel-format regex (lock-in gate). */
  serialOk = false;

  // ===== Lights =====
  lightSwitchedOn = false;

  // ===== CameraX listener =====
  private previewListener: PluginListenerHandle | null = null;

  private previewCtx: CanvasRenderingContext2D | null = null;
  private previewDrawInFlight = false;
  private lastPreviewFrame: CameraXOCRPreviewFrame | null = null;

  constructor(
    private _customDialog: CustomDialogService,
    private router: Router,
    private _ocrService: OcrService,
    private _vlmOcrService: VlmOcrService,
    private _itsService: ItsServiceService,
  ) {}


  // ================= ROI helpers =================
  private getRoiRectInPreviewCanvasPixels(): { x: number; y: number; w: number; h: number } | null {
    if (!this.previewCanvas || !this.roiRect) return null;

    const previewCss = this.previewCanvas.getBoundingClientRect();
    const roiCss = this.roiRect.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // ROI coords relative to the preview canvas (CSS px → canvas backing px)
    const x = Math.round((roiCss.left - previewCss.left) * dpr);
    const y = Math.round((roiCss.top - previewCss.top) * dpr);
    const w = Math.round(roiCss.width * dpr);
    const h = Math.round(roiCss.height * dpr);

    // Clamp to canvas bounds
    const maxW = this.previewCanvas.width;
    const maxH = this.previewCanvas.height;
    const cx = Math.max(0, Math.min(x, maxW - 1));
    const cy = Math.max(0, Math.min(y, maxH - 1));
    const cw = Math.max(1, Math.min(w, maxW - cx));
    const ch = Math.max(1, Math.min(h, maxH - cy));

    return { x: cx, y: cy, w: cw, h: ch };
  }

  // ================= Camera (CameraX) =================
  async startOcrCamera(): Promise<void> {
    if (this.cameraStarted) return;
    try {
      // Ensure the container has been laid out; otherwise CameraX may start with a 0-sized surface.
      let rect = this.previewContainer.getBoundingClientRect();
      for (let i = 0; i < 5 && (rect.width < 2 || rect.height < 2); i++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        rect = this.previewContainer.getBoundingClientRect();
      }

      await CameraXOCR.startCamera({
        // Native overlay coordinates should be viewport-based (no page scroll offsets)
        x:      Math.round(rect.left),
        y:      Math.round(rect.top),
        width:  Math.round(rect.width),
        height: Math.round(rect.height),
      });
      this.cameraStarted = true;

      console.log('startOcrCamera | CameraX started');
    } catch (e) {
      const details = (e && (e?.message || e?.error || e?.toString?.())) ? String(e?.message || e?.error || e?.toString?.()) : '';
      console.error('startOcrCamera | error', e);
      this._customDialog
        .message(
          'Error',
          details ? `Failed to start camera\n${details}` : 'Failed to start camera',
          [{ text: 'Close', primary: true }],
          'error'
        )
        .subscribe();
    }
  }

  async stopOcrCamera(): Promise<void> {
    if (!this.cameraStarted) return;
    try {
      if (this.previewListener) {
        await this.previewListener.remove();
        this.previewListener = null;
      }
      await CameraXOCR.stopCamera();
      this.cameraStarted = false;
    } catch (e) {
      console.error('stopOcrCamera | error', e);
    }
  }

  private schedulePreviewDraw(frame: CameraXOCRPreviewFrame): void {
    this.lastPreviewFrame = frame;
    if (this.previewDrawInFlight) return;
    this.previewDrawInFlight = true;

    requestAnimationFrame(async () => {
      try {
        const f = this.lastPreviewFrame;
        if (!f || !this.previewCanvas || !this.previewCtx) return;

        const bytes = Uint8Array.from(atob(f.jpegBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        const bmp = await createImageBitmap(blob);

        // Match canvas backing store to its displayed size
        const rect = this.previewCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.round(rect.width * dpr));
        const h = Math.max(1, Math.round(rect.height * dpr));
        if (this.previewCanvas.width !== w || this.previewCanvas.height !== h) {
          this.previewCanvas.width = w;
          this.previewCanvas.height = h;
        }

        // Cover fit (like CSS background-size: cover)
        const scale = Math.max(w / bmp.width, h / bmp.height);
        const dw = bmp.width * scale;
        const dh = bmp.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;

        this.previewCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.previewCtx.clearRect(0, 0, w, h);
        this.previewCtx.drawImage(bmp, dx, dy, dw, dh);

        // Run OCR only within the ROI box (throttled) without blocking preview rendering
        void this.maybeRunOcrFromPreviewCanvas();
      } catch (err) {
        // keep preview best-effort
      } finally {
        this.previewDrawInFlight = false;
        if (this.lastPreviewFrame) {
          // If a newer frame arrived while drawing, schedule another draw
          // (we compare by object identity; sufficient for our use)
          const pending = this.lastPreviewFrame;
          this.lastPreviewFrame = null;
          if (pending) this.schedulePreviewDraw(pending);
        }
      }
    });
  }

  private async maybeRunOcrFromPreviewCanvas(): Promise<void> {
    if (!this.ocrSwitchedOn) return;
    if (this.ocrInFlight) return;
    if (!this.triggerPending) return;          // press-to-scan: only run on hardware trigger
    if (!this.previewCanvas || !this.canvasElement) return;

    const roi = this.getRoiRectInPreviewCanvasPixels();
    if (!roi) return;

    const pipelineStart = performance.now();
    try {
      this.ocrInFlight = true;
      this.triggerPending = false;             // consume the trigger

      // Crop the ROI region from the preview canvas into an offscreen canvas
      if (!this.cropCanvas) this.cropCanvas = document.createElement('canvas');
      this.cropCanvas.width = roi.w;
      this.cropCanvas.height = roi.h;
      const cropCtx = this.cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCtx.setTransform(1, 0, 0, 1, 0, 0);
      cropCtx.clearRect(0, 0, roi.w, roi.h);
      cropCtx.drawImage(this.previewCanvas, roi.x, roi.y, roi.w, roi.h, 0, 0, roi.w, roi.h);

      const cropDoneAt = performance.now();
      const jpegDataUrl = this.cropCanvas.toDataURL('image/jpeg', 0.85);
      const encodeDoneAt = performance.now();

      const result = await this._vlmOcrService.extract(jpegDataUrl, 'image/jpeg');

      const cropMs   = Math.round(cropDoneAt   - pipelineStart);
      const encodeMs = Math.round(encodeDoneAt - cropDoneAt);
      const totalMs  = Math.round(performance.now() - pipelineStart);
      this.handleVlmResult(result, { totalMs, cropMs, encodeMs });
    } catch (e) {
      console.warn('Gemini OCR call failed for frame:', e);
    } finally {
      this.ocrInFlight = false;
    }
  }

  // ================= Gemini result handler (ROI only) =================
  private handleVlmResult(
    result: { serial: string; partNumber: string; raw: string; latencyMs: number; timedOut: boolean },
    timing: { totalMs: number; cropMs: number; encodeMs: number },
  ): void {
    if (this.alertContainer) this.alertContainer.hidden = false;

    const apiMs = result.latencyMs;
    const overheadMs = Math.max(0, timing.totalMs - apiMs);
    const timingLabel = `total ${timing.totalMs}ms · api ${apiMs}ms · prep ${overheadMs}ms (crop ${timing.cropMs}, encode ${timing.encodeMs})`;
    console.log(`[OCR pipeline] ${timingLabel}`);

    // Aborted / nothing useful detected — keep scanning.
    if (result.timedOut || (!result.serial && !result.partNumber)) {
      this.resultsDetected = false;
      this.vlmStatus = result.timedOut
        ? `Timed out · ${timing.totalMs}ms`
        : `${timing.totalMs}ms — nothing detected`;
      setTimeout(() => { if (this.alertContainer) this.alertContainer.hidden = true; }, 1500);
      return;
    }

    this.serialNo = result.serial;
    this.partNo   = result.partNumber;

    // Lock-in gate: if a serial was returned, it must satisfy the wheel-format
    // regex (when loaded). If only a part number was returned, trust Gemini.
    const wheelRegex = this._ocrService.originalRegexFormat;
    const serialPresent = !!result.serial;
    const serialPasses  = serialPresent && (wheelRegex ? wheelRegex.test(result.serial) : true);

    this.serialOk = serialPasses;

    const lockIn = serialPasses || (!serialPresent && !!result.partNumber);

    const status = `${timing.totalMs}ms total · api ${apiMs}ms`;

    if (lockIn) {
      NativeAudio.play({ assetId: 'ocr-scan' });
      this.currRes = result.serial || result.partNumber; // submit flow keys off currRes (serial)
      this.resultsDetected = true;
      this.vlmStatus = status;
      this.stopScanningAfterMatch();
    } else {
      // Show what we got but keep scanning for a clean read.
      this.resultsDetected = false;
      this.vlmStatus = `${status} — verify manually`;
    }

    setTimeout(() => { if (this.alertContainer) this.alertContainer.hidden = true; }, 1500);
  }

  private stopScanningAfterMatch() {
    this.ocrSwitchedOn = false;
    // Ensure native analysis stays off; we OCR from ROI-cropped preview frames.
    CameraXOCR.setAnalysisEnabled({ enabled: false });
  }

  // ================= OCR toggle =================
  async onOCRToggleChange(isToggled: boolean) {
    this.ocrSwitchedOn = isToggled;

    if (isToggled) {
      // Clear previous result canvas
      const outCtx = this.canvasElement?.getContext('2d');
      if (outCtx) outCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.alertContainer.hidden = true;
      this.resultsDetected = false;
      this.serialNo = '';
      this.partNo   = '';
      this.vlmStatus = 'Aim and press trigger to scan';
      this.serialOk = false;
      this.triggerPending = false;
    } else {
      this.vlmStatus = '';
      this.triggerPending = false;
    }

    // Native analysis is intentionally disabled; OCR runs from the ROI crop.
    await CameraXOCR.setAnalysisEnabled({ enabled: false });
  }

  initialiseROI() {
    this.cropCanvas     = document.createElement('canvas');
    this.alertContainer = document.getElementById('alert-notif') as HTMLDivElement;
    this.alertContainer.hidden = true;
    this.canvasElement  = document.getElementById('camera-canvas') as HTMLCanvasElement;
    this.previewCanvas  = document.getElementById('camera-preview-canvas') as HTMLCanvasElement;
    this.previewCtx     = this.previewCanvas?.getContext('2d') || null;
    this.previewContainer = document.getElementById(this.previewParent) as HTMLDivElement;
    this.roiRect        = document.getElementById('roiRect') as HTMLDivElement;
  }

  // ================= Formats =================
  regexGenerator(formatList) {
    let allExpressions = [];
    for (let formatNo = 0; formatNo < formatList.length; formatNo++) {
      let isWildcard = formatList[formatNo][0] === '#';
      let expressions = [];
      let consecutiveWildcards = 0;
      let substring = '';
      for (let idx = 0; idx < formatList[formatNo].length; idx++) {
        const currChar = formatList[formatNo][idx];
        const isCurrWildcard = currChar === '#';
        if (isCurrWildcard) {
          if (isWildcard) { consecutiveWildcards += 1; }
          else {
            if (substring.length > 0) { expressions.push(substring); substring = ''; }
            consecutiveWildcards = 1;
          }
        } else {
          if (isWildcard) {
            if (consecutiveWildcards > 0) { expressions.push(`\\d{${consecutiveWildcards}}`); consecutiveWildcards = 0; }
            substring = currChar;
          } else { substring += currChar; }
        }
        isWildcard = isCurrWildcard;
      }
      if (isWildcard) { if (consecutiveWildcards > 0) expressions.push(`\\d{${consecutiveWildcards}}`); }
      else { if (substring.length > 0) expressions.push(substring); }
      if (expressions.length > 0) allExpressions.push(expressions.join(''));
    }
    return new RegExp(`^(?:(?:S\\/N|SN|P\\/N|PN)\\s*:?\\s*)?(?:${allExpressions.join('|')})$`);
  }

  loadWheelFormats() {
    this._itsService.getWheelFormats().subscribe({
      next: (res: WheelFormat[]) => {
        const formatSet = new Set<string>();
        res.forEach(({ SNFormat1, SNFormat2 }) => {
          formatSet.add(SNFormat1.replace(/\s+/g, ''));
          if (SNFormat2 !== '') {
            SNFormat2.replace(/\s+/g, '').split('/').forEach((s) => formatSet.add(s));
          }
        });
        this.wheelFormat = this.regexGenerator(Array.from(formatSet)) || null;
        this._ocrService.setRegexFormat(this.wheelFormat);
      },
    });
  }

  // ================= Lights =================
  async switchOffLights() {
    await CameraXOCR.setFlashMode({ mode: 'off' });
    this.lightSwitchedOn = false;
  }

  async onLightsToggleChange(isToggled: boolean) {
    this.lightSwitchedOn = isToggled;
    await CameraXOCR.setFlashMode({ mode: isToggled ? 'torch' : 'off' });
  }

  // ================= Results =================
  checkResultsWithServer = async () => {
    const wheelSets: Wheel[] = await this._itsService
      .getWheelBySerialNo(this.currRes).toPromise();
    const partNoList = wheelSets.map((w) => w.PartNo);
    this._ocrService.setPartNoList(partNoList);
    return this._ocrService.getPartNoList().length > 0;
  };

  async submitResultsToComponent() {
    if (!this.currRes) {
      this._customDialog
        .message('Error', 'Please select a result', [{ text: 'Close', primary: true }], 'error')
        .subscribe();
      return;
    }

    const navigate = () => {
      this._ocrService.setSerialNo(this.currRes);
      this._ocrService.setToOCRPage(false);
      this.router.navigate([this._ocrService.getLastRoute() || '/mainmenunew']);
    };

    const matchingWheelsExist = await this.checkResultsWithServer();

    if (!matchingWheelsExist) {
      this._customDialog.confirm().subscribe((res) => {
        if (res.primary) {
          this._customDialog
            .message('Success', 'Wheel hub successfully sent!', [{ text: 'Close', primary: true }], 'success')
            .subscribe({ next: navigate });
        }
      });
      return;
    }

    this._customDialog
      .message('Success', 'Wheel hub successfully sent!', [{ text: 'Close', primary: true }], 'success')
      .subscribe({ next: navigate });
  }

  // ================= Lifecycle =================
  async ngOnInit(): Promise<void> {
    // The global stylesheet sets body { background-color: #F8F7FD !important }.
    // The native CameraX PreviewView sits behind the WebView; for it to be visible
    // the HTML body must also be transparent while this page is active.
    document.body.style.setProperty('background-color', 'transparent', 'important');
    document.documentElement.style.setProperty('background-color', 'transparent', 'important');

    const awakeSupported = await KeepAwake.isSupported();
    if (awakeSupported) await KeepAwake.keepAwake();

    NativeAudio.preload({
      assetId: 'ocr-scan',
      assetPath: 'public/assets/sounds/ocr-scan.mp3',
      audioChannelNum: 1,
      volume: 0.6,
      isUrl: false,
    });

    this.loadWheelFormats();
  }

  async ngAfterViewInit(): Promise<void> {
    this.menuContainer = document.getElementById('ocr-menu-container') as HTMLDivElement;
    this.initialiseROI();
    await this.startOcrCamera();

    // Enable preview frame streaming fallback (renders into #camera-preview-canvas)
    try {
      await CameraXOCR.setPreviewEnabled({ enabled: true });
      this.previewListener = await CameraXOCR.addListener('previewFrame', (frame: CameraXOCRPreviewFrame) => {
        this.schedulePreviewDraw(frame);
      });
    } catch (e) {
      // best-effort; OCR can still function without a preview
    }

    // Listen for the TC2205 hardware trigger. MainActivity.dispatchKeyEvent
    // forwards trigger key presses as a window CustomEvent.
    this.hwTriggerListener = () => this.onHardwareTrigger();
    window.addEventListener('ocrHardwareTrigger', this.hwTriggerListener);
  }

  /**
   * Called when the TC2205 hardware trigger is pressed. If the OCR Scan toggle
   * is on and no call is in flight, arm the next preview frame to run Gemini.
   */
  private onHardwareTrigger(): void {
    if (!this.ocrSwitchedOn) return;
    if (this.ocrInFlight) return;
    this.triggerPending = true;
    this.vlmStatus = 'Scanning…';
    // The next previewFrame tick will call maybeRunOcrFromPreviewCanvas and
    // consume the pending flag.
  }

  async ngOnDestroy(): Promise<void> {
    // Restore body background so other pages are unaffected
    document.body.style.removeProperty('background-color');
    document.documentElement.style.removeProperty('background-color');

    if (this.hwTriggerListener) {
      window.removeEventListener('ocrHardwareTrigger', this.hwTriggerListener);
      this.hwTriggerListener = undefined;
    }

    NativeAudio.unload({ assetId: 'ocr-scan' });
    this.currRes = '';
    await KeepAwake.allowSleep();
    await this.switchOffLights();
    await this.stopOcrCamera();
  }
}
