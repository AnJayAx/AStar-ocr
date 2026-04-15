PP-OCRv5 Mobile (bundled assets)

This app expects a Paddle Lite *NaiveBuffer (.nb)* recognition model and a label file to be bundled as APK assets.

Place these files in this folder:

- rec.nb
  - Paddle Lite optimized NaiveBuffer model file for recognition.
  - Should take input shape [1,3,48,320] (CHW RGB float) or adjust the plugin code.

- rec_labels.txt
  - One label per line (character set). The plugin uses CTC greedy decode with blank index 0.

Notes:
- The Android plugin will copy these assets to internal storage on first use because Paddle Lite loads models from file paths.
- If these files are missing, the PaddleOCR engine will fail and the UI will fall back to ML Kit.
