package com.example.app.plugin.PaddleOCR;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.baidu.paddle.lite.MobileConfig;
import com.baidu.paddle.lite.PaddlePredictor;
import com.baidu.paddle.lite.PowerMode;
import com.baidu.paddle.lite.Tensor;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "PaddleOCR")
public class PaddleOCRPlugin extends Plugin {

  private static final String ASSET_MODEL_PATH = "paddleocr/ppocrv5/rec.nb";
  private static final String ASSET_LABELS_PATH = "paddleocr/ppocrv5/rec_labels.txt";

  // Common PP-OCR mobile recognition input size
  private static final int REC_INPUT_W = 320;
  private static final int REC_INPUT_H = 48;

  private static final Object INIT_LOCK = new Object();
  private static final Object NATIVE_LOCK = new Object();
  private static volatile boolean isInitialized = false;
  private static volatile boolean isNativeLoaded = false;
  private static volatile PaddlePredictor predictor;
  private static volatile List<String> labels;

  @Override
  public void load() {
    super.load();
  }

  @PluginMethod
  public void recognizeText(PluginCall call) {
    String imageBase64 = call.getString("imageBase64");
    if (imageBase64 == null || imageBase64.isEmpty()) {
      call.reject("Missing imageBase64");
      return;
    }

    try {
      ensureInitialized();

      Bitmap bitmap = decodeBase64ToBitmap(imageBase64);
      if (bitmap == null) {
        call.reject("Failed to decode image");
        return;
      }

      String text = runRecognizer(bitmap);

      // Return a single line covering the ROI (the ROI crop is done in JS).
      JSObject line = new JSObject();
      line.put("text", text);
      line.put("left", 0);
      line.put("top", 0);
      line.put("right", 1000);
      line.put("bottom", 1000);

      JSArray linesArr = new JSArray();
      linesArr.put(line);

      JSObject ret = new JSObject();
      ret.put("lines", linesArr);
      call.resolve(ret);
    } catch (Throwable t) {
      call.reject(formatThrowable(t));
    }
  }

  private void ensureInitialized() throws IOException {
    if (isInitialized && predictor != null && labels != null) return;

    synchronized (INIT_LOCK) {
      if (isInitialized && predictor != null && labels != null) return;

      ensureNativeLoaded();

      Context ctx = getContext();
      if (ctx == null) throw new IOException("Android context unavailable");

      // Copy bundled assets to internal storage
      File modelFile = ensureAssetCopied(ctx, ASSET_MODEL_PATH, "paddleocr/ppocrv5/rec.nb");
      File labelsFile = ensureAssetCopied(ctx, ASSET_LABELS_PATH, "paddleocr/ppocrv5/rec_labels.txt");

      if (!modelFile.exists() || modelFile.length() == 0) {
        throw new IOException("Missing bundled PaddleOCR model: " + ASSET_MODEL_PATH);
      }
      if (!labelsFile.exists() || labelsFile.length() == 0) {
        throw new IOException("Missing bundled PaddleOCR labels: " + ASSET_LABELS_PATH);
      }

      labels = readLabels(labelsFile);
      if (labels.isEmpty()) {
        throw new IOException("PaddleOCR labels file is empty");
      }

      MobileConfig config = new MobileConfig();
      config.setModelFromFile(modelFile.getAbsolutePath());
      config.setPowerMode(PowerMode.LITE_POWER_NO_BIND);
      config.setThreads(2);
      predictor = PaddlePredictor.createPaddlePredictor(config);

      isInitialized = true;
    }
  }

  private void ensureNativeLoaded() throws IOException {
    if (isNativeLoaded) return;

    synchronized (NATIVE_LOCK) {
      if (isNativeLoaded) return;

      try {
        // Some Paddle Lite builds require this dependency to be loaded first.
        System.loadLibrary("paddle_light_api_shared");
      } catch (UnsatisfiedLinkError ignored) {
        // Not always present; we'll still try the JNI lib.
      }

      try {
        System.loadLibrary("paddle_lite_jni");
      } catch (UnsatisfiedLinkError e) {
        throw new IOException(
            "PaddleOCR native library failed to load (ABI mismatch is common on x86_64 emulators). " +
                "Missing libpaddle_lite_jni.so for this device CPU ABI. Root error: " + e,
            e);
      }

      isNativeLoaded = true;
    }
  }

  private static String formatThrowable(Throwable t) {
    if (t == null) return "PaddleOCR failed";

    // Build a compact causal chain so JS can match on 'UnsatisfiedLinkError', 'dlopen', etc.
    StringBuilder sb = new StringBuilder();
    Throwable cur = t;
    int depth = 0;
    while (cur != null && depth < 6) {
      if (depth > 0) sb.append(" | Caused by: ");
      sb.append(cur.getClass().getName());
      String msg = cur.getMessage();
      if (msg != null && !msg.isEmpty()) {
        sb.append(": ").append(msg);
      }
      cur = cur.getCause();
      depth++;
    }

    return sb.toString();
  }

  private static Bitmap decodeBase64ToBitmap(String dataUrlOrBase64) {
    String b64 = dataUrlOrBase64;
    int comma = b64.indexOf(',');
    if (comma >= 0) {
      b64 = b64.substring(comma + 1);
    }

    byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
    return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
  }

  private static File ensureAssetCopied(Context ctx, String assetPath, String outRelativePath) throws IOException {
    File outFile = new File(ctx.getFilesDir(), outRelativePath);
    File parent = outFile.getParentFile();
    if (parent != null && !parent.exists()) parent.mkdirs();

    if (outFile.exists() && outFile.length() > 0) return outFile;

    try (InputStream in = ctx.getAssets().open(assetPath);
         FileOutputStream out = new FileOutputStream(outFile)) {
      byte[] buf = new byte[16 * 1024];
      int r;
      while ((r = in.read(buf)) != -1) {
        out.write(buf, 0, r);
      }
      out.flush();
    }

    return outFile;
  }

  private static List<String> readLabels(File labelsFile) throws IOException {
    List<String> result = new ArrayList<>();
    try (BufferedReader br = new BufferedReader(new InputStreamReader(new java.io.FileInputStream(labelsFile), StandardCharsets.UTF_8))) {
      String line;
      while ((line = br.readLine()) != null) {
        // Keep even empty labels? Usually not needed.
        if (!line.isEmpty()) result.add(line);
      }
    }
    return result;
  }

  private static String runRecognizer(Bitmap src) throws IOException {
    if (predictor == null) throw new IOException("Predictor not initialized");

    Bitmap bitmap = Bitmap.createScaledBitmap(src, REC_INPUT_W, REC_INPUT_H, true);

    float[] chw = bitmapToChwFloat(bitmap);
    Tensor input = predictor.getInput(0);
    input.resize(new long[]{1, 3, REC_INPUT_H, REC_INPUT_W});
    input.setData(chw);

    boolean ok = predictor.run();
    if (!ok) throw new IOException("Paddle predictor.run() returned false");

    Tensor output = predictor.getOutput(0);
    long[] shape = output.shape();
    float[] probs = output.getFloatData();
    return ctcGreedyDecode(probs, shape);
  }

  private static float[] bitmapToChwFloat(Bitmap bitmap) {
    int w = bitmap.getWidth();
    int h = bitmap.getHeight();

    int[] pixels = new int[w * h];
    bitmap.getPixels(pixels, 0, w, 0, 0, w, h);

    float[] chw = new float[3 * w * h];
    int hw = w * h;

    // Normalization commonly used for PaddleOCR rec models.
    // If your model expects different preprocessing, adjust here.
    for (int i = 0; i < hw; i++) {
      int p = pixels[i];
      float r = ((p >> 16) & 0xFF) / 255.0f;
      float g = ((p >> 8) & 0xFF) / 255.0f;
      float b = (p & 0xFF) / 255.0f;

      r = (r - 0.5f) / 0.5f;
      g = (g - 0.5f) / 0.5f;
      b = (b - 0.5f) / 0.5f;

      chw[i] = r;
      chw[hw + i] = g;
      chw[2 * hw + i] = b;
    }
    return chw;
  }

  private static String ctcGreedyDecode(float[] probs, long[] shape) throws IOException {
    if (labels == null) throw new IOException("Labels not loaded");
    if (shape == null || shape.length < 2) throw new IOException("Unexpected output shape");

    int timeSteps;
    int classes;
    int offset;

    if (shape.length == 3) {
      // [1, T, C]
      timeSteps = (int) shape[1];
      classes = (int) shape[2];
      offset = 0;
    } else if (shape.length == 2) {
      // [T, C]
      timeSteps = (int) shape[0];
      classes = (int) shape[1];
      offset = 0;
    } else {
      // Some builds might produce [1, T, 1, C] etc; keep it explicit for now.
      throw new IOException("Unsupported output shape length: " + shape.length);
    }

    StringBuilder sb = new StringBuilder();
    int prevIdx = -1;

    for (int t = 0; t < timeSteps; t++) {
      int bestIdx = 0;
      float best = -Float.MAX_VALUE;
      int base = offset + (t * classes);
      for (int c = 0; c < classes; c++) {
        float v = probs[base + c];
        if (v > best) {
          best = v;
          bestIdx = c;
        }
      }

      // CTC: 0 = blank
      if (bestIdx != 0 && bestIdx != prevIdx) {
        int labelIdx = bestIdx - 1;
        if (labelIdx >= 0 && labelIdx < labels.size()) {
          sb.append(labels.get(labelIdx));
        }
      }
      prevIdx = bestIdx;
    }

    return sb.toString().trim();
  }
}
