import { registerPlugin } from '@capacitor/core';
import { Plugin } from '@capacitor/core/types/definitions';

import { MLKitOCRResult } from './MLKitOCRPlugin';

export interface PaddleOCRPlugin extends Plugin {
  /**
   * Recognize text in an image.
   *
   * Contract: returns the same shape as `MLKitOCR.recognizeText` so the UI can
   * share the same parsing + drawing logic.
   */
  recognizeText(options: {
    imageBase64: string;
  }): Promise<MLKitOCRResult>;
}

const PaddleOCR = registerPlugin<PaddleOCRPlugin>('PaddleOCR');

export default PaddleOCR;
