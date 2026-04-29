package com.example.app.plugin.CameraXOCR;

import android.Manifest;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.media.Image;
import android.util.Log;
import android.util.Size;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.util.Base64;

import java.io.ByteArrayOutputStream;

import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ExperimentalGetImage;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.core.resolutionselector.ResolutionSelector;
import androidx.camera.core.resolutionselector.ResolutionStrategy;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

@CapacitorPlugin(
    name = "CameraXOCR",
    permissions = {
        @Permission(strings = { Manifest.permission.CAMERA }, alias = "camera")
    }
)
public class CameraXOCRPlugin extends Plugin {

    private static final String TAG = "CameraXOCRPlugin";
    private static final String DEBUG_DIR = "test-ocr";

    /**
     * Ring-buffer size: only the last MAX_SAVED_FRAMES frames are kept on disk.
     * Each JPEG is ~50-150 KB, so 20 frames ≈ 1-3 MB of disk space.
     */
    private static final int MAX_SAVED_FRAMES = 20;

    // Camera
    private ProcessCameraProvider cameraProvider;
    private Camera camera;
    private PreviewView previewView;

    // ML Kit
    private TextRecognizer recognizer;
    private ExecutorService analysisExecutor;

    // State
    private volatile boolean analysisEnabled = false;
    private volatile boolean previewFramesEnabled = true;

    // Preview throttling
    private final AtomicInteger previewCounter = new AtomicInteger(0);

    // Frame counter — every frame is saved (ring-buffered to MAX_SAVED_FRAMES slots)
    private final AtomicInteger frameCounter = new AtomicInteger(0);

    // ── Lifecycle ────────────────────────────────────────────────────────────

    @Override
    public void load() {
        recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
        analysisExecutor = Executors.newSingleThreadExecutor();

        // Log the debug directory path once so it's easy to find in Device Explorer
        File debugDir = new File(getContext().getFilesDir(), DEBUG_DIR);
        Log.d(TAG, "CameraXOCRPlugin loaded — debug frames → " + debugDir.getAbsolutePath());
    }

    // ── Plugin methods ───────────────────────────────────────────────────────

    @PluginMethod()
    public void startCamera(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestAllPermissions(call, "cameraPermCallback");
            return;
        }
        startCameraInternal(call);
    }

    @PermissionCallback
    private void cameraPermCallback(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            startCameraInternal(call);
        } else {
            call.reject("Camera permission denied");
        }
    }

    @PluginMethod()
    public void stopCamera(PluginCall call) {
        analysisEnabled = false;
        previewFramesEnabled = false;
        getActivity().runOnUiThread(() -> {
            if (cameraProvider != null) {
                cameraProvider.unbindAll();
                cameraProvider = null;
                camera = null;
            }
            if (previewView != null && previewView.getParent() != null) {
                ((ViewGroup) previewView.getParent()).removeView(previewView);
                previewView = null;
            }
            // Restore WebView defaults
            try {
                getBridge().getWebView().setLayerType(View.LAYER_TYPE_HARDWARE, null);
            } catch (Exception ignored) {
            }
            getBridge().getWebView().setBackgroundColor(Color.WHITE);
            Log.d(TAG, "Camera stopped");
            call.resolve();
        });
    }

    @PluginMethod()
    public void setAnalysisEnabled(PluginCall call) {
        analysisEnabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        Log.d(TAG, "analysisEnabled = " + analysisEnabled);
        call.resolve();
    }

    @PluginMethod()
    public void setPreviewEnabled(PluginCall call) {
        previewFramesEnabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        Log.d(TAG, "previewFramesEnabled = " + previewFramesEnabled);
        call.resolve();
    }

    @PluginMethod()
    public void setFlashMode(PluginCall call) {
        String mode = call.getString("mode", "off");
        if (camera != null) {
            camera.getCameraControl().enableTorch("torch".equals(mode));
        }
        call.resolve();
    }

    // ── Camera setup ─────────────────────────────────────────────────────────

    private void startCameraInternal(PluginCall call) {
        int x      = call.getInt("x",      0);
        int y      = call.getInt("y",      0);
        int width  = call.getInt("width",  800);
        int height = call.getInt("height", 600);

        getActivity().runOnUiThread(() -> {
            try {
                // Remove any existing preview
                if (previewView != null && previewView.getParent() != null) {
                    ((ViewGroup) previewView.getParent()).removeView(previewView);
                }

                // Make WebView transparent so the PreviewView behind it shows through.
                // LAYER_TYPE_HARDWARE supports alpha/transparency and keeps GPU acceleration.
                // LAYER_TYPE_SOFTWARE is very slow and can render black on emulators.
                try {
                    getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
                    getBridge().getWebView().setLayerType(View.LAYER_TYPE_HARDWARE, null);
                    if (getBridge().getWebView().getBackground() != null) {
                        getBridge().getWebView().getBackground().setAlpha(0);
                    }
                } catch (Exception ignored) {
                }

                // CSS pixels → physical device pixels
                float density = getContext().getResources().getDisplayMetrics().density;
                int xPx = Math.round(x      * density);
                int yPx = Math.round(y      * density);
                int wPx = Math.round(width  * density);
                int hPx = Math.round(height * density);

                // Web coordinates are relative to the WebView viewport.
                // Layout params are relative to the WebView's parent.
                int webLeft = getBridge().getWebView().getLeft();
                int webTop  = getBridge().getWebView().getTop();

                // Create PreviewView and place it behind the WebView
                previewView = new PreviewView(getContext());
                previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
                // Use TextureView-backed preview for better composition behind WebView.
                // SurfaceView-backed preview often shows as black when layered behind a WebView.
                previewView.setImplementationMode(PreviewView.ImplementationMode.COMPATIBLE);
                previewView.setBackgroundColor(Color.TRANSPARENT);

                ViewGroup parent = (ViewGroup) getBridge().getWebView().getParent();
                ViewGroup.LayoutParams params;
                if (parent instanceof CoordinatorLayout) {
                    params = new CoordinatorLayout.LayoutParams(wPx, hPx);
                } else if (parent instanceof FrameLayout) {
                    params = new FrameLayout.LayoutParams(wPx, hPx);
                } else {
                    params = new ViewGroup.LayoutParams(wPx, hPx);
                }

                if (params instanceof ViewGroup.MarginLayoutParams) {
                    ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) params;
                    mlp.leftMargin = webLeft + xPx;
                    mlp.topMargin = webTop + yPx;
                } else {
                    // Fallback for LayoutParams that don't support margins
                    previewView.setX(webLeft + xPx);
                    previewView.setY(webTop + yPx);
                }

                parent.addView(previewView, 0, params);   // index 0 = behind WebView

                getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);

                // Bind CameraX use cases
                ListenableFuture<ProcessCameraProvider> future =
                        ProcessCameraProvider.getInstance(getContext());

                future.addListener(() -> {
                    try {
                        cameraProvider = future.get();
                        cameraProvider.unbindAll();

                        // Preview
                        Preview preview = new Preview.Builder().build();
                        preview.setSurfaceProvider(previewView.getSurfaceProvider());

                        // ImageAnalysis — YUV (default) so we can use fromMediaImage()
                        // Target 1280×720 for good text recognition quality
                        ImageAnalysis analysis = new ImageAnalysis.Builder()
                                .setResolutionSelector(new ResolutionSelector.Builder()
                                        .setResolutionStrategy(new ResolutionStrategy(
                                                new Size(1280, 720),
                                                ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER))
                                        .build())
                                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                .build();

                        analysis.setAnalyzer(analysisExecutor, this::analyzeFrame);

                        camera = cameraProvider.bindToLifecycle(
                                (LifecycleOwner) getActivity(),
                                CameraSelector.DEFAULT_BACK_CAMERA,
                                preview,
                                analysis);

                        Log.d(TAG, "Camera bound successfully");
                        previewFramesEnabled = true;
                        call.resolve();

                    } catch (Exception e) {
                        Log.e(TAG, "bindToLifecycle failed", e);
                        call.reject("Failed to start camera: " + e);
                    }
                }, ContextCompat.getMainExecutor(getContext()));

            } catch (Exception e) {
                Log.e(TAG, "startCameraInternal error", e);
                call.reject("Camera setup error: " + e);
            }
        });
    }

    // ── Frame analysis ───────────────────────────────────────────────────────

    /**
     * Called on every camera frame by the ImageAnalysis use case.
     *
     * Uses InputImage.fromMediaImage() — the recommended path for CameraX + ML Kit.
     * This feeds the raw YUV data directly to ML Kit, skipping the YUV→RGBA→Bitmap
     * conversion that degrades quality.
     *
     * The imageProxy is closed INSIDE the ML Kit callbacks, not before, because
     * fromMediaImage() holds a reference to the underlying Image object.
     */
    @ExperimentalGetImage
    private void analyzeFrame(ImageProxy imageProxy) {
        final boolean doOcr = analysisEnabled;
        final boolean doPreview = previewFramesEnabled;
        if (!doOcr && !doPreview) {
            imageProxy.close();
            return;
        }

        Image mediaImage = imageProxy.getImage();
        if (mediaImage == null) {
            Log.w(TAG, "analyzeFrame | getImage() returned null");
            imageProxy.close();
            return;
        }

        int rotation = imageProxy.getImageInfo().getRotationDegrees();

        // Effective dimensions in the upright (rotated) orientation
        int rawW = mediaImage.getWidth();
        int rawH = mediaImage.getHeight();
        final int imgW = (rotation == 90 || rotation == 270) ? rawH : rawW;
        final int imgH = (rotation == 90 || rotation == 270) ? rawW : rawH;

        Log.d(TAG, "analyzeFrame | raw=" + rawW + "x" + rawH
                + " upright=" + imgW + "x" + imgH + " rot=" + rotation);

        // Optional: send preview frames to the web layer (throttled)
        if (doPreview) {
            int n = previewCounter.incrementAndGet();
            // ~10fps if analyzer gets ~30fps
            if (n % 3 == 0) {
                Bitmap bmp = null;
                Bitmap rotated = null;
                Bitmap scaled = null;
                try {
                    bmp = imageProxy.toBitmap();
                    if (bmp != null) {
                        rotated = rotateBitmapSafe(bmp, rotation);
                        if (rotated != null) {
                            // Keep preview payload small to avoid memory churn.
                            scaled = scaleToMax(rotated, 640);
                            String jpegB64 = bitmapToJpegBase64(scaled, 60);

                            JSObject frame = new JSObject();
                            frame.put("jpegBase64", jpegB64);
                            frame.put("width", scaled.getWidth());
                            frame.put("height", scaled.getHeight());
                            notifyListeners("previewFrame", frame);
                        }
                    }
                } catch (OutOfMemoryError oom) {
                    Log.w(TAG, "previewFrame OOM; skipping frame");
                } catch (Exception e) {
                    Log.w(TAG, "previewFrame failed: " + e.getMessage());
                } finally {
                    // Recycle temporary bitmaps to avoid leaks/churn on emulator.
                    if (scaled != null && scaled != rotated && !scaled.isRecycled()) {
                        scaled.recycle();
                    }
                    if (rotated != null && rotated != bmp && !rotated.isRecycled()) {
                        rotated.recycle();
                    }
                    if (bmp != null && !bmp.isRecycled()) {
                        bmp.recycle();
                    }
                }
            }
        }

        if (!doOcr) {
            imageProxy.close();
            return;
        }

        // Feed directly to ML Kit — no bitmap conversion needed
        InputImage input = InputImage.fromMediaImage(mediaImage, rotation);

        recognizer.process(input)
            .addOnSuccessListener(visionText -> {
                imageProxy.close();   // ← close AFTER ML Kit is done

                String fullText = visionText.getText();
                Log.d(TAG, "analyzeFrame | full detected text: \""
                        + fullText.replace("\n", "\\n") + "\"");

                JSArray lines = new JSArray();
                for (Text.TextBlock block : visionText.getTextBlocks()) {
                    for (Text.Line line : block.getLines()) {
                        JSObject obj = new JSObject();
                        obj.put("text", line.getText());

                        Rect bbox = line.getBoundingBox();
                        if (bbox != null) {
                            obj.put("left",   (bbox.left   * 1000) / imgW);
                            obj.put("top",    (bbox.top    * 1000) / imgH);
                            obj.put("right",  (bbox.right  * 1000) / imgW);
                            obj.put("bottom", (bbox.bottom * 1000) / imgH);
                        } else {
                            obj.put("left", 0);  obj.put("top", 0);
                            obj.put("right", 1000); obj.put("bottom", 1000);
                        }

                        Log.d(TAG, "  line: \"" + line.getText() + "\"");
                        lines.put(obj);
                    }
                }

                Log.d(TAG, "analyzeFrame | " + lines.length() + " lines detected");
                JSObject result = new JSObject();
                result.put("lines", lines);
                notifyListeners("ocrResult", result);
            })
            .addOnFailureListener(e -> {
                imageProxy.close();
                Log.e(TAG, "ML Kit error: " + e.getMessage());
            });
    }

    private static Bitmap scaleToMax(Bitmap bitmap, int maxSize) {
        int w = bitmap.getWidth();
        int h = bitmap.getHeight();
        int max = Math.max(w, h);
        if (max <= maxSize) return bitmap;
        float scale = (float) maxSize / (float) max;
        int nw = Math.round(w * scale);
        int nh = Math.round(h * scale);
        return Bitmap.createScaledBitmap(bitmap, nw, nh, true);
    }

    private static String bitmapToJpegBase64(Bitmap bitmap, int quality) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, baos);
        byte[] bytes = baos.toByteArray();
        return Base64.encodeToString(bytes, Base64.NO_WRAP);
    }

    private static Bitmap rotateBitmapSafe(Bitmap bitmap, int degrees) {
        if (bitmap == null) return null;
        if (degrees == 0) return bitmap;
        try {
            Matrix matrix = new Matrix();
            matrix.postRotate(degrees);
            return Bitmap.createBitmap(
                    bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
        } catch (OutOfMemoryError oom) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // ── Debug frame saving ───────────────────────────────────────────────────

    /**
     * Saves a JPEG to the app's internal files directory:
     *   /data/data/com.example.app/files/test-ocr/frame_NN.jpg
     *
     * Accessible in Android Studio Device Explorer:
     *   data → data → com.example.app → files → test-ocr
     *
     * No external storage or WRITE_EXTERNAL_STORAGE permission needed.
     * Files are ring-buffered: slot = frameIndex % MAX_SAVED_FRAMES.
     */
    private void saveDebugFrame(Bitmap bitmap, int slot) {
        try {
            File dir = new File(getContext().getFilesDir(), DEBUG_DIR);
            if (!dir.exists()) dir.mkdirs();

            File out = new File(dir, String.format("frame_%02d.jpg", slot));
            try (FileOutputStream fos = new FileOutputStream(out)) {
                bitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos);
            }

            Log.d(TAG, "debug frame saved → " + out.getAbsolutePath());

        } catch (Exception e) {
            Log.w(TAG, "saveDebugFrame failed: " + e.getMessage());
        }
    }
}
