package com.example.app.plugin.MLKitOCR;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.concurrent.atomic.AtomicInteger;

@CapacitorPlugin(name = "MLKitOCR")
public class MLKitOCRPlugin extends Plugin {

    private static final String TAG = "MLKitOCRPlugin";

    /** Reuse a single recognizer instance across all calls (thread-safe). */
    private TextRecognizer recognizer;

    /** Ring-buffer counter so we overwrite old frames instead of growing forever. */
    private final AtomicInteger frameCounter = new AtomicInteger(0);
    private static final int MAX_SAVED_FRAMES = 20;
    private static final String DEBUG_DIR = "test-ocr";

    @Override
    public void load() {
        recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
        Log.d(TAG, "TextRecognizer initialised");
    }

    /**
     * Accepts a base64-encoded JPEG/PNG and returns all recognised text lines
     * with their bounding boxes normalised to a 0–1000 coordinate space.
     *
     * Input:
     *   imageBase64  – base64 string (data-URL prefix is stripped automatically)
     *   cropX, cropY, cropW, cropH  – optional crop region in image pixels;
     *                                  omit (or set to 0) to process the full frame
     *
     * Output: { lines: Array<{ text, left, top, right, bottom }>, imageWidth, imageHeight }
     *
     * Debug: every frame is saved to
     *   <app-external-files>/mlkit_debug/frame_NN.jpg   (ring buffer, 20 slots)
     * Pull with:  adb pull /sdcard/Android/data/com.example.app/files/mlkit_debug
     */
    @PluginMethod()
    public void recognizeText(PluginCall call) {
        String imageBase64 = call.getString("imageBase64");
        if (imageBase64 == null || imageBase64.isEmpty()) {
            call.reject("imageBase64 is required");
            return;
        }

        // Strip data-URL prefix if present (e.g. "data:image/jpeg;base64,")
        if (imageBase64.contains(",")) {
            imageBase64 = imageBase64.substring(imageBase64.indexOf(',') + 1);
        }

        byte[] decodedBytes;
        try {
            decodedBytes = Base64.decode(imageBase64, Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Failed to decode base64: " + e.getMessage());
            return;
        }

        Bitmap fullBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
        if (fullBitmap == null) {
            call.reject("Failed to decode image bitmap");
            return;
        }

        Log.d(TAG, "recognizeText | full frame " + fullBitmap.getWidth() + "x" + fullBitmap.getHeight());

        // Optional crop — caller can pass cropX/Y/W/H (all must be > 0)
        int cropX = call.getInt("cropX", 0);
        int cropY = call.getInt("cropY", 0);
        int cropW = call.getInt("cropW", 0);
        int cropH = call.getInt("cropH", 0);

        Bitmap bitmap;
        if (cropW > 0 && cropH > 0
                && cropX >= 0 && cropY >= 0
                && cropX + cropW <= fullBitmap.getWidth()
                && cropY + cropH <= fullBitmap.getHeight()) {
            bitmap = Bitmap.createBitmap(fullBitmap, cropX, cropY, cropW, cropH);
            Log.d(TAG, "recognizeText | cropped to " + cropW + "x" + cropH
                    + " at (" + cropX + "," + cropY + ")");
        } else {
            bitmap = fullBitmap;
        }

        final int imageWidth  = bitmap.getWidth();
        final int imageHeight = bitmap.getHeight();

        // Save debug frame (ring buffer – overwrites oldest)
        saveDebugFrame(bitmap);

        InputImage inputImage = InputImage.fromBitmap(bitmap, 0);

        recognizer.process(inputImage)
            .addOnSuccessListener(visionText -> {
                JSArray lines = new JSArray();

                for (Text.TextBlock block : visionText.getTextBlocks()) {
                    for (Text.Line line : block.getLines()) {
                        JSObject lineObj = new JSObject();
                        lineObj.put("text", line.getText());

                        android.graphics.Rect bbox = line.getBoundingBox();
                        if (bbox != null) {
                            lineObj.put("left",   (bbox.left   * 1000) / imageWidth);
                            lineObj.put("top",    (bbox.top    * 1000) / imageHeight);
                            lineObj.put("right",  (bbox.right  * 1000) / imageWidth);
                            lineObj.put("bottom", (bbox.bottom * 1000) / imageHeight);
                        } else {
                            lineObj.put("left",   0);
                            lineObj.put("top",    0);
                            lineObj.put("right",  1000);
                            lineObj.put("bottom", 1000);
                        }

                        Log.d(TAG, "  line: \"" + line.getText() + "\"");
                        lines.put(lineObj);
                    }
                }

                Log.d(TAG, "recognizeText | " + lines.length() + " lines in "
                        + imageWidth + "x" + imageHeight + " image");

                JSObject result = new JSObject();
                result.put("lines", lines);
                result.put("imageWidth",  imageWidth);
                result.put("imageHeight", imageHeight);
                call.resolve(result);
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "recognizeText | ML Kit error: " + e.getMessage());
                call.reject("Text recognition failed: " + e.getMessage());
            });
    }

    // -------------------------------------------------------------------------
    // Debug helpers
    // -------------------------------------------------------------------------

    /**
     * Saves the bitmap for debugging.
     *
     * Android 10+ (API 29+): writes to MediaStore → Pictures/test-ocr/
     *   Visible in Device File Explorer at:  /sdcard/Pictures/test-ocr/
     *
     * Android 9 and below: writes to the public Pictures directory.
     *   Requires WRITE_EXTERNAL_STORAGE permission (declared in AndroidManifest).
     *
     * Ring-buffer: MAX_SAVED_FRAMES slots (frame_00 … frame_19) are reused so
     * storage never grows unbounded.
     */
    private void saveDebugFrame(Bitmap bitmap) {
        try {
            int slot = frameCounter.getAndIncrement() % MAX_SAVED_FRAMES;
            String filename = String.format("frame_%02d.jpg", slot);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // ── Android 10+ ── MediaStore (no extra permission needed) ──────────
                // Delete the old entry for this slot if it exists
                String selection = MediaStore.Images.Media.DISPLAY_NAME + "=? AND "
                        + MediaStore.Images.Media.RELATIVE_PATH + "=?";
                String[] selectionArgs = { filename, "Pictures/" + DEBUG_DIR + "/" };
                getContext().getContentResolver().delete(
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI, selection, selectionArgs);

                // Insert the new frame
                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/" + DEBUG_DIR + "/");
                values.put(MediaStore.Images.Media.IS_PENDING, 1);

                Uri uri = getContext().getContentResolver()
                        .insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);

                if (uri == null) {
                    Log.w(TAG, "saveDebugFrame | MediaStore insert returned null URI");
                    return;
                }

                try (OutputStream os = getContext().getContentResolver().openOutputStream(uri)) {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 85, os);
                }

                values.clear();
                values.put(MediaStore.Images.Media.IS_PENDING, 0);
                getContext().getContentResolver().update(uri, values, null, null);

                Log.d(TAG, "saveDebugFrame | saved → Pictures/" + DEBUG_DIR + "/" + filename);

            } else {
                // ── Android 9 and below ──────────────────────────────────────────────
                File dir = new File(
                        android.os.Environment.getExternalStoragePublicDirectory(
                                android.os.Environment.DIRECTORY_PICTURES),
                        DEBUG_DIR);
                if (!dir.exists()) dir.mkdirs();
                File outFile = new File(dir, filename);
                try (FileOutputStream fos = new FileOutputStream(outFile)) {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos);
                }
                Log.d(TAG, "saveDebugFrame | saved → " + outFile.getAbsolutePath());
            }

        } catch (Exception e) {
            Log.w(TAG, "saveDebugFrame | failed: " + e.getMessage(), e);
        }
    }
}
