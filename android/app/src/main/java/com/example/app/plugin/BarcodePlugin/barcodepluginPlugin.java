package com.example.app.plugin.BarcodePlugin;

import static android.content.ContentValues.TAG;
import static android.content.Intent.ACTION_SCREEN_OFF;
import static android.content.Intent.ACTION_SCREEN_ON;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.example.app.plugin.Barcode;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "barcodeplugin")
public class barcodepluginPlugin extends Plugin {

  enum ReaderMode {
    RFID,
    BARCODE_SCANNER,
    NFC
  }
  public static String TAG = "Barcode Plugin";
  public Activity context;
  private barcodeplugin implementation = new barcodeplugin();
  public static final String ACTION = "com.symbol.datawedge.api.ACTION";
  public static final String NOTIFICATION_ACTION = "com.symbol.datawedge.api.NOTIFICATION_ACTION";
  public static final String NOTIFICATION_TYPE_SCANNER_STATUS = "SCANNER_STATUS";
  public static final String SCAN_STATUS_WAITING = "WAITING";
  public static final String NOTIFICATION_TYPE_PROFILE_SWITCH = "PROFILE_SWITCH";
  public static final String RESULT_ACTION = "com.symbol.datawedge.api.RESULT_ACTION";

  public static final String ACTION_EXTRA_REGISTER_FOR_NOTIFICATION = "com.symbol.datawedge.api.REGISTER_FOR_NOTIFICATION";
  public static final String ACTION_EXTRA_UNREGISTER_FOR_NOTIFICATION = "com.symbol.datawedge.api.UNREGISTER_FOR_NOTIFICATION";

  public final String enumeratedList = "com.symbol.datawedge.api.ACTION_ENUMERATEDSCANNERLIST";
  public final String SCAN_WRITE_ACTION = "com.zebra.ssw";
  public String enumerateScanners = "com.symbol.datawedge.api.ACTION_ENUMERATESCANNERS";
  String KEY_ENUMERATEDSCANNERLIST = "DWAPI_KEY_ENUMERATEDSCANNERLIST";
  public void onCreate(Activity activity) {
    context = activity;
  }
  public static ArrayList<String> scanner_list = new ArrayList<String>();
  private long scanTime;

  private static final long BEAM_TIMEOUT = 5000;
  public boolean isActivityResume = false;

  public static final String NOTIFICATION_TYPE_CONFIGURATION_UPDATE = "CONFIGURATION_UPDATE";

  protected Boolean barcodeScanned = false;
  private Boolean barcodeScannedStarted = false;

  private static final String DATA_STRING_TAG = "com.symbol.datawedge.data_string";
  private static final String LABEL_TYPE = "com.symbol.datawedge.label_type";

  private List<Barcode> mBarcodeList;
  private List<String> mEPCList;
  private Barcode scannedBarcode;

  String SOFT_SCAN_TRIGGER = "com.symbol.datawedge.api.ACTION";
  String EXTRA_DATA = "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER";

  PluginCall mCall;

  @PluginMethod
  public void echo(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);

    Activity mainActivity = getActivity();
    onCreate(mainActivity);

    mBarcodeList = new ArrayList<>();
    mEPCList = new ArrayList<>();
    this.onMC3300Scanner();

    JSObject ret = new JSObject();
    ret.put("value", "connected");
    mCall.resolve(ret);
  }

  @PluginMethod
  public void softScanToggle(PluginCall call) {
    mBarcodeList = new ArrayList<>();
    mEPCList = new ArrayList<>();
    Log.d(TAG, "softScanToggle mEPCList " + mEPCList);

    mCall = call;
    mCall.setKeepAlive(true);

    Activity mainActivity = getActivity();
    onCreate(mainActivity);

    this.scanToggle();
    // this.unRegisterForScannerStatus();
  }

  @PluginMethod
  public void suspendScanner(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);

    this.suspendScanner();

    boolean result = true;

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  @PluginMethod
  public void resumeScanner(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);

    this.resumeScanner();

    boolean result = true;

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  private void suspendScanner() {
    Intent i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.SCANNER_INPUT_PLUGIN", "SUSPEND_PLUGIN");
    i.putExtra("SEND_RESULT", "true");
    i.putExtra("COMMAND_IDENTIFIER", "MY_SUSPEND_SCANNER");  //Unique identifier
    if (this.context != null) {
      this.context.sendBroadcast(i);
    }
}

private void resumeScanner() {
    Intent i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.SCANNER_INPUT_PLUGIN", "RESUME_PLUGIN");
    i.putExtra("SEND_RESULT", "true");
    i.putExtra("COMMAND_IDENTIFIER", "MY_RESUME_SCANNER");  //Unique identifier
    if (this.context != null) {
      this.context.sendBroadcast(i);
    }
}
  public android.content.BroadcastReceiver BroadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, final Intent intent) {
      String action = intent.getAction();
      // Toast.makeText(context, "receive broadcast ---", Toast.LENGTH_SHORT).show();
      Bundle b;
      switch (action) {

        case ACTION_SCREEN_OFF:
          break;

        case ACTION_SCREEN_ON:
          break;

        case "com.symbol.datawedge.scanner_status":
          String command2 = intent.getStringExtra("COMMAND");
          String commandidentifier2 = intent.getStringExtra("COMMAND_IDENTIFIER");
          String result2 = intent.getStringExtra("RESULT");

          Bundle bundle2 = new Bundle();
          String resultInfo2 = "";
          if (intent.hasExtra("RESULT_INFO")) {
            bundle2 = intent.getBundleExtra("RESULT_INFO");
            Set<String> keys = bundle2.keySet();
            for (String key : keys) {
              resultInfo2 += key + ": " + bundle2.getString(key) + "\n";
            }
          }

          String text = "Command: " + command2 + "\n" +
            "Result: " + result2 + "\n" +
            "Result Info: " + resultInfo2 + "\n" +
            "CID:" + commandidentifier2;
          Log.d(TAG, "scanner_status: " + text);

          Toast.makeText(context, text, Toast.LENGTH_LONG).show();

          break;

        case enumeratedList:
          Log.d(TAG, "SSW-APP Action: " + action);
          b = intent.getExtras();
          String[] scanner_list1 = b.getStringArray(KEY_ENUMERATEDSCANNERLIST);
          Collections.addAll(scanner_list, scanner_list1);
          break;

        case SCAN_WRITE_ACTION:
          final PendingResult pendingResult = goAsync();
          AsyncTask<String, Integer, String> asyncTask = new AsyncTask<String, Integer, String>() {
            @Override
            protected String doInBackground(String... params) {
              StringBuilder sb = new StringBuilder();
              sb.append("Action: " + intent.getAction() + "\n");
              String log = sb.toString();
              Log.d(TAG, log);

              handleDecodeData(intent);

              // Must call finish() so the BroadcastReceiver can be recycled.
              pendingResult.finish();
              return null;
            }

            @Override
            protected void onPostExecute(String s) {
              super.onPostExecute(s);
              // handleDecodeData(intent);
            }
          };
          asyncTask.execute();
          break;

        case NOTIFICATION_ACTION:
          if (intent.hasExtra("com.symbol.datawedge.api.NOTIFICATION")) {
            b = intent.getBundleExtra("com.symbol.datawedge.api.NOTIFICATION");
            String NOTIFICATION_TYPE = b.getString("NOTIFICATION_TYPE");

            if (NOTIFICATION_TYPE != null) {
              switch (NOTIFICATION_TYPE) {

                case NOTIFICATION_TYPE_SCANNER_STATUS:
                  Log.d(TAG, "SCANNER_STATUS: status: " + b.getString("STATUS") + ", profileName: " + b.getString("PROFILE_NAME"));
                  String scanner_status = b.getString("STATUS");

                  if (scanner_status.equalsIgnoreCase("IDLE")) {
                    barcodeScannedStarted = false;
                  }

                  if (scanner_status.equalsIgnoreCase("WAITING")) {
                    // check if barcode scan was started and timed out
                    if (!barcodeScanned && barcodeScannedStarted && (System.currentTimeMillis() - scanTime >= BEAM_TIMEOUT) && isActivityResume) {
                      Toast.makeText(context, "SCAN TIMEOUT", Toast.LENGTH_SHORT).show();
                    }
                    barcodeScannedStarted = false;
                  }
                  if (scanner_status.equalsIgnoreCase("SCANNING")) {
                    barcodeScanned = false;
                    barcodeScannedStarted = true;
                    scanTime = System.currentTimeMillis();
                  }
                  break;

                case NOTIFICATION_TYPE_PROFILE_SWITCH:
                  Log.d(TAG, "PROFILE_SWITCH: profileName: " + b.getString("PROFILE_NAME") + ", profileEnabled: " + b.getBoolean("PROFILE_ENABLED"));
                  break;

                case NOTIFICATION_TYPE_CONFIGURATION_UPDATE:
                  break;
              }

              JSObject ret = new JSObject();
              String scanStarted = Boolean.toString(barcodeScannedStarted);
              ret.put("value", scanStarted);
              notifyListeners("scannerStatusChangedEvent", ret);
              Log.d(TAG, "scannedStatusChanged " + scanStarted);
            }
          }
          break;

        case RESULT_ACTION:
          Bundle extras = intent.getExtras();
          if (extras != null) {
            //user specified ID
            String cmdID = extras.getString("COMMAND_IDENTIFIER");
            if ("MY_RESUME_SCANNER".equals(cmdID) || "MY_SUSPEND_SCANNER".equals(cmdID)) {
              //success or failure
              String result = extras.getString("RESULT");
              //Original command
              String command = extras.getString("COMMAND");
              if ("FAILURE".equals(result)) {
                Bundle info = extras.getBundle("RESULT_INFO");
                String errorCode = "";

                if (info != null) {
                  errorCode = info.getString("RESULT_CODE");
                }
                Log.d(TAG, " Command:" + command + ":" + cmdID + ":" + result + ",Code:" + errorCode);
              }
              else {
                Log.d(TAG, " Command:" + command + ":" + cmdID + ":" + result);
              }
            }
          }
      }
    }
  };

  private void handleDecodeData(Intent i) {
    String data = i.getStringExtra(DATA_STRING_TAG);
    String type = i.getStringExtra(LABEL_TYPE);
    EventBarcode(data.getBytes(), type, 1);
    Log.d(TAG, data + ' ' + type);

    JSObject ret = new JSObject();
    List<String> epcData = implementation.getNoDupEPCList(mEPCList);
    Log.d(TAG, "handleDecodeData epcData: " + epcData);

    ret.put("value", epcData.toString());
    notifyListeners("incomingBarcodeEvent", ret);
    mCall.resolve(ret);

    mBarcodeList = new ArrayList<>();
    mEPCList = new ArrayList<>();
  }

  public void EventBarcode(final byte[] barcodeData, final String barcodeType,
                           final int fromScannerID) {
//      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      barcodeReceived(barcodeData, 0, fromScannerID);
//      }
  }

  @RequiresApi(api = Build.VERSION_CODES.Q)
  public void barcodeReceived(final byte[] barcodeData, int barcodeType, int fromScannerID) {
    try {
      String epc = new String(barcodeData);
      Log.d(TAG, "barcodeReceived epc " + epc );
      scannedBarcode = new Barcode();
      scannedBarcode.setBarcodeData(epc);

      mBarcodeList.add(scannedBarcode);
      mEPCList.add(epc);

      Log.d(TAG, "barcodeReceived mBarcodeList " + mBarcodeList);
      Log.d(TAG, "barcodeReceived mEPCList " + mEPCList);

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void onMC3300Scanner() {
    try {
      // Create a filter for the broadcast intent
      IntentFilter filter = new IntentFilter();
      filter.addAction(enumeratedList);
      filter.addAction(SCAN_WRITE_ACTION);
      filter.addAction(NOTIFICATION_ACTION); // SCANNER_STATUS
      filter.addCategory("android.intent.category.DEFAULT");
      this.context.registerReceiver(BroadcastReceiver, filter);

      // create the intent
      Intent i = new Intent();
      // set the action to perform
      i.setAction(enumerateScanners);
      // send the intent to DataWedge
      this.context.sendBroadcast(i);
      createProfile();

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void createProfile() {
    Bundle bMain = new Bundle();
    bMain.putString("PROFILE_NAME", "Profile0 (default)");
    bMain.putString("PROFILE_ENABLED", "true");
    bMain.putString("CONFIG_MODE", "CREATE_IF_NOT_EXIST");

    Bundle bConfig = new Bundle();
    bConfig.putString("PLUGIN_NAME", "BARCODE"); // bConfig.putString("PLUGIN_NAME", "INTENT");
    bConfig.putString("RESET_CONFIG","true");

    Bundle bParams = new Bundle();
    bParams.putString("scanner_selection", "auto");
    bParams.putString("scanner_input_enabled", "true");
    // bParams.putString("scanning_mode", "3");  // 3 - MultiBarcode
    bParams.putString("aim_type", "5"); // 5 - Continuous read
    // bParams.putString("multi_barcode_count", "10");

    bParams.putString("intent_output_enabled", "true");
    bParams.putString("intent_action", "com.zebra.ssw");
    bParams.putString("intent_category", "android.intent.category.DEFAULT");
    bParams.putString("intent_delivery", "2");

    // NOTE: The "current-device-id" varies by device; it depends on the number of
    // supported scanners (internal and/or external) installed and/or connected to
    // the device at the time the index is generated.
    //PUT bParams into bConfig
    bConfig.putBundle("PARAM_LIST", bParams);

    //PUT bConfig into bMain
    bMain.putBundle("PLUGIN_CONFIG", bConfig);
    Intent i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.SET_CONFIG", bMain);
    i.putExtra("com.symbol.datawedge.api.GET_VERSION_INFO", "");

    this.context.sendBroadcast(i);

    // Register for notifications - SCANNER_STATUS
    Bundle b = new Bundle();
    b.putString("com.symbol.datawedge.api.APPLICATION_NAME", "com.example.intenttest");
    b.putString("com.symbol.datawedge.api.NOTIFICATION_TYPE", "SCANNER_STATUS");
    i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.REGISTER_FOR_NOTIFICATION", b);//(1)
    this.context.sendBroadcast(i);
  }

  private void unRegisterForScannerStatus() {
    Bundle b = new Bundle();
    b.putString("com.symbol.datawedge.api.APPLICATION_NAME", "com.dwapi.dwnotifiation");
    b.putString("com.symbol.datawedge.api.NOTIFICATION_TYPE", NOTIFICATION_TYPE_SCANNER_STATUS);
    Intent i = new Intent();
    i.setAction(ACTION);
    i.putExtra(ACTION_EXTRA_UNREGISTER_FOR_NOTIFICATION, b);
    this.context.sendBroadcast(i);
  }

  public void scanToggle(){
    Intent i = new Intent();
    i.setAction(ACTION);
    i.putExtra("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER","TOGGLE_SCANNING");
    this.context.sendBroadcast(i);
    // this.handleDecodeData(i);
  }

}
