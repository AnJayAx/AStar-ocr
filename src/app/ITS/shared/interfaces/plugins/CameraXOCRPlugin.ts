import { registerPlugin } from '@capacitor/core';
import { Plugin, PluginListenerHandle } from '@capacitor/core/types/definitions';
import { MLKitTextLine } from './MLKitOCRPlugin';

export interface CameraXOCRStartOptions {
  /** Position and size of the preview, in CSS pixels */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CameraXOCRResult {
  lines: MLKitTextLine[];
}

export interface CameraXOCRPreviewFrame {
  jpegBase64: string;
  width: number;
  height: number;
}

export interface CameraXOCRPlugin extends Plugin {
  /** Start the camera preview and bind image analysis. */
  startCamera(options: CameraXOCRStartOptions): Promise<void>;

  /** Stop the camera and remove the native preview view. */
  stopCamera(): Promise<void>;

  /** Enable or disable per-frame ML Kit analysis without stopping the preview. */
  setAnalysisEnabled(options: { enabled: boolean }): Promise<void>;

  /** Enable or disable streaming preview frames to the web layer (canvas fallback). */
  setPreviewEnabled(options: { enabled: boolean }): Promise<void>;

  /** Control the torch.  mode: "torch" | "off" */
  setFlashMode(options: { mode: 'torch' | 'off' }): Promise<void>;

  /**
   * Fired on every frame that ML Kit successfully analyses.
   * Always emitted even when no text is found (lines will be empty).
   */
  addListener(
    eventName: 'ocrResult',
    listenerFunc: (result: CameraXOCRResult) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'previewFrame',
    listenerFunc: (frame: CameraXOCRPreviewFrame) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}

const CameraXOCR = registerPlugin<CameraXOCRPlugin>('CameraXOCR');

export default CameraXOCR;
