package com.example.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.example.app.plugin.RFIDPlugin;
import com.getcapacitor.BridgeActivity;

import com.example.app.plugin.HelloWorld.HelloWorldPlugin;

import com.example.app.plugin.DWUtilities.DWUtilitiesPlugin;

import com.example.app.plugin.BarcodePlugin.barcodepluginPlugin;
import com.example.app.plugin.MLKitOCR.MLKitOCRPlugin;
import com.example.app.plugin.CameraXOCR.CameraXOCRPlugin;

public class MainActivity extends BridgeActivity {

  final static String TAG = "RFID_SAMPLE";
  final static int REQUEST_CODE = 1;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // IMPORTANT: register plugins before BridgeActivity initializes.
    // If called after super.onCreate(), the JS layer may report
    // "plugin is not implemented on android".
    registerPlugin(RFIDPlugin.class);
    registerPlugin(HelloWorldPlugin.class);
    registerPlugin(DWUtilitiesPlugin.class);
    registerPlugin(barcodepluginPlugin.class);
    registerPlugin(MLKitOCRPlugin.class);
    registerPlugin(CameraXOCRPlugin.class);

    super.onCreate(savedInstanceState);

    if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, REQUEST_CODE);
    }
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.BLUETOOTH_CONNECT}, REQUEST_CODE);
    }
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.BLUETOOTH_SCAN}, REQUEST_CODE);
    }
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.BLUETOOTH}, REQUEST_CODE);
    }
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_ADMIN) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.BLUETOOTH_ADMIN}, REQUEST_CODE);
    }

  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == REQUEST_CODE) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        // Permission granted
      } else {
        // Permission denied
      }
    }
  }

  /**
   * Forwards Zebra TC2x hardware trigger presses to the WebView as a JS
   * 'ocrHardwareTrigger' event. The OCR component listens for this event and
   * runs a single Gemini call when the OCR Scan toggle is on.
   *
   * We always pass the event to super so DataWedge / barcode plugin still see it.
   * If your TC2205 trigger keycode differs, watch logcat for the line below
   * and add the keycode to TRIGGER_KEYCODES.
   */
  private static final int[] TRIGGER_KEYCODES = new int[] {
    KeyEvent.KEYCODE_FOCUS,        // 80
    KeyEvent.KEYCODE_BUTTON_L1,    // 102 — Zebra left scan key (TC2x default)
    KeyEvent.KEYCODE_BUTTON_R1,    // 103 — Zebra right scan key
    280, 287, 293                  // common Zebra programmable trigger codes
  };

  @Override
  public boolean dispatchKeyEvent(KeyEvent event) {
    if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
      int code = event.getKeyCode();
      Log.d(TAG, "dispatchKeyEvent: keycode=" + code + " (" + KeyEvent.keyCodeToString(code) + ")");

      for (int trigger : TRIGGER_KEYCODES) {
        if (code == trigger) {
          dispatchOcrTrigger();
          break;
        }
      }
    }
    return super.dispatchKeyEvent(event);
  }

  private void dispatchOcrTrigger() {
    if (getBridge() == null || getBridge().getWebView() == null) return;
    getBridge().getWebView().post(() ->
      getBridge().getWebView().evaluateJavascript(
        "window.dispatchEvent(new CustomEvent('ocrHardwareTrigger'))", null
      )
    );
  }
}
