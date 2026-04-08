import { registerPlugin } from '@capacitor/core';
import { Plugin } from '@capacitor/core/types/definitions';

export interface MLKitTextLine {
  text: string;
  /** Normalised 0–1000 coordinate space, matching the canvas convention */
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MLKitOCRResult {
  lines: MLKitTextLine[];
}

export interface MLKitOCRPlugin extends Plugin {
  recognizeText(options: {
    imageBase64: string;
    /** Optional crop region in image pixels. When all four are provided and valid,
     *  ML Kit processes only this sub-region, which greatly improves accuracy. */
    cropX?: number;
    cropY?: number;
    cropW?: number;
    cropH?: number;
  }): Promise<MLKitOCRResult>;
}

const MLKitOCR = registerPlugin<MLKitOCRPlugin>('MLKitOCR');

export default MLKitOCR;
