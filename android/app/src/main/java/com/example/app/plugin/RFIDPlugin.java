package com.example.app.plugin;

import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;

import com.example.app.MainActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.zebra.rfid.api3.ACCESS_OPERATION_CODE;
import com.zebra.rfid.api3.ACCESS_OPERATION_STATUS;
import com.zebra.rfid.api3.Antennas;
import com.zebra.rfid.api3.ENUM_TRANSPORT;
import com.zebra.rfid.api3.ENUM_TRIGGER_MODE;
import com.zebra.rfid.api3.HANDHELD_TRIGGER_EVENT_TYPE;
import com.zebra.rfid.api3.INVENTORY_STATE;
import com.zebra.rfid.api3.InvalidUsageException;
import com.zebra.rfid.api3.OperationFailureException;
import com.zebra.rfid.api3.RFIDReader;
import com.zebra.rfid.api3.ReaderDevice;
import com.zebra.rfid.api3.Readers;
import com.zebra.rfid.api3.RfidEventsListener;
import com.zebra.rfid.api3.RfidReadEvents;
import com.zebra.rfid.api3.RfidStatusEvents;
import com.zebra.rfid.api3.SESSION;
import com.zebra.rfid.api3.SL_FLAG;
import com.zebra.rfid.api3.START_TRIGGER_TYPE;
import com.zebra.rfid.api3.STATUS_EVENT_TYPE;
import com.zebra.rfid.api3.STOP_TRIGGER_TYPE;
import com.zebra.rfid.api3.TagData;
import com.zebra.rfid.api3.TriggerInfo;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import Classes.Beeper;

@CapacitorPlugin(name = "RFID")
public class RFIDPlugin extends Plugin implements Readers.RFIDReaderEventHandler {

  final static String TAG = "RFID_SAMPLE";
  // Added for plugins
  MainActivity mainActivity;

  private static ArrayList<ReaderDevice> allReaders;
  // RFID Reader
  private static Readers readers;
  private static ArrayList<ReaderDevice> availableRFIDReaderList;
  private static ReaderDevice readerDevice;
  private static RFIDReader reader;
  private EventHandler eventHandler;
  private MainActivity context;
  private static Beeper beeper;

  // general
  private int MAX_POWER = 270;
  // In case of RFD8500 change reader name with intended device below from list of paired RFD8500 RFD8500123
  String readername = "TC22";

  String locateEPC = "";

  private final Object connLock = new Object();
  private volatile boolean sdkInitialized = false;
  private volatile boolean handlerAttached = false;
  private volatile boolean isConnecting = false;


  private final List<ConnectCallback> pendingConnectCallbacks = new CopyOnWriteArrayList<>();


  private int DEFAULT_BEEPER_VOLUME = 1;

  public void onCreate(MainActivity activity) {
    // application context
    context = activity;
    // SDK
    InitSDKOnce();
  }

  public String Test1() {
    // check reader connection
    if (!isReaderConnected())
      return "Not connected";
    // set antenna configurations - reducing power to 200
    try {
      Antennas.AntennaRfConfig config = null;
      config = reader.Config.Antennas.getAntennaRfConfig(1);
      config.setTransmitPowerIndex(100);
      config.setrfModeTableIndex(0);
      config.setTari(0);
      reader.Config.Antennas.setAntennaRfConfig(1, config);
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
      return e.getResults().toString() + " " + e.getVendorMessage();
    }
    return "Antenna power Set to 220";
  }

  private void ensureSdkReadyThenConnect(ConnectCallback cb) {
    // if SDK is ready, connect immediately
    if (readers != null) {
      connectAsync(cb);
      return;
    }

    // otherwise, queue it and make sure InitSDKOnce has started
    if (cb != null) pendingConnectCallbacks.add(cb);
    InitSDKOnce();
  }

  private void flushPendingConnectCallbacks() {
    if (pendingConnectCallbacks.isEmpty()) return;

    for (ConnectCallback cb : pendingConnectCallbacks) {
      connectAsync(cb);
    }
    pendingConnectCallbacks.clear();
  }


  public String setRFIDPowerLevel(int powerLevel) {
    if (!isReaderConnected()) {
      return "Not connected";
    }
    Log.d(TAG, "setRFIDPowerLevel :"+powerLevel);

    if (reader == null || reader.Config == null || reader.Config.Antennas == null) {
      Log.w(TAG, "setRFIDPowerLevel: reader config not ready (Config/Antenna is null)");
      return "RFID reader config not ready";
    }

    try {
      Antennas.AntennaRfConfig config = null;
      config = reader.Config.Antennas.getAntennaRfConfig(1);
      if (config == null) {
        Log.w(TAG, "setRFIDPowerLevel: getAntennaRfConfig(1) returned null");
        return "RFID antenna config not ready";
      }
      config.setTransmitPowerIndex(powerLevel);
      // config.setrfModeTableIndex(0);
      // config.setTari(0);
      reader.Config.Antennas.setAntennaRfConfig(1, config);

    } catch (InvalidUsageException e) {
      Log.d(TAG, "setRFIDPowerLevel | InvalidUsageException"+e.toString());
      e.printStackTrace();
    } catch (OperationFailureException e) {
      Log.d(TAG, "setRFIDPowerLevel | OperationFailureException"+e.toString());
      e.printStackTrace();
      return e.getResults().toString() + " " + e.getVendorMessage();
    }

    return "Antenna power set to " + powerLevel;
  }

  public String getRFIDPowerLevel() {

    if (reader == null || reader.Config == null || reader.Config.Antennas == null) {
      Log.w(TAG, "getRFIDPowerLevel: reader config not ready (Config/Antenna is null)");
      return "";
    }

    try {
      Antennas.AntennaRfConfig config = reader.Config.Antennas.getAntennaRfConfig(1);
      if (config == null) {
        Log.w(TAG, "getRFIDPowerLevel: getAntennaRfConfig(1) returned null");
        return "";
      }
      Integer powerLevel = config.getTransmitPowerIndex();
      return powerLevel != null ? Integer.toString(powerLevel) : "";

    } catch (InvalidUsageException e) {
      Log.e(TAG, "getRFIDPowerLevel | InvalidUsageException", e);
    } catch (OperationFailureException e) {
      Log.e(TAG, "getRFIDPowerLevel | OperationFailureException", e);
    } catch (RuntimeException e) {
      // Defensive: prevent a plugin call from taking down the app.
      Log.e(TAG, "getRFIDPowerLevel | RuntimeException", e);
    }

    return "";
  }


  public String Test2() {
    // check reader connection
    if (!isReaderConnected())
      return "Not connected";
    // Set the singulation control to S2 which will read each tag once only
    try {
      Antennas.SingulationControl s1_singulationControl = reader.Config.Antennas.getSingulationControl(1);
      s1_singulationControl.setSession(SESSION.SESSION_S2);
      s1_singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_A);
      s1_singulationControl.Action.setSLFlag(SL_FLAG.SL_ALL);
      reader.Config.Antennas.setSingulationControl(1, s1_singulationControl);
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
      return e.getResults().toString() + " " + e.getVendorMessage();
    }
    return "Session set to S2";
  }

  public boolean isReaderConnected() {
    if (reader != null && reader.isConnected()) {
      Log.d(TAG, "Reader connected.");
      return true;
    } else {
      Log.d(TAG, "Reader is not connected");
      return false;
    }
  }

  //
  //  Activity life cycle behavior
  //

  // String onResume() {
  //   return connect();
  // }

  // void onPause() {
  //   disconnect();
  // }

  void onDestroy() {
    dispose();
  }


  //
  // RFID SDK
  //
  private void InitSDKOnce() {
    synchronized (connLock) {
      if (sdkInitialized) return;
      sdkInitialized = true;
    }
    Log.d(TAG, "InitSDKOnce");
    new CreateInstanceTask().executeOnExecutor(AsyncTask.SERIAL_EXECUTOR);
  }

  // private void InitSDK() {
  //   Log.d(TAG, "InitSDK");
  //   String s = Build.DEVICE;
  //   if (readers == null) {
  //     new CreateInstanceTask().execute();
  //   } else
  //     new ConnectionTask().execute();
  // }

  private void ensureAttached() {
    if (readers == null) return;
    synchronized (connLock) {
      if (handlerAttached) return;
      readers.attach(this);
      handlerAttached = true;
      Log.d(TAG, "Attached reader event handler (once)");
    }
  }

  // private void connectAsync() {
  //   synchronized (connLock) {
  //     if (isConnecting) {
  //       Log.d(TAG, "connectAsync: already connecting, skip");
  //       return;
  //     }
  //     if (reader != null && reader.isConnected()) {
  //       Log.d(TAG, "connectAsync: already connected, skip");
  //       return;
  //     }
  //     isConnecting = true;
  //   }

  //   new AsyncTask<Void, Void, String>() {
  //     @Override protected String doInBackground(Void... voids) {
  //       try {
  //         GetAvailableReader();     // (this should NOT call attach repeatedly now)
  //         if (reader == null) return "No reader";
  //         return connect();         // your existing connect()
  //       } finally {
  //         synchronized (connLock) { isConnecting = false; }
  //       }
  //     }
  //   }.executeOnExecutor(AsyncTask.SERIAL_EXECUTOR);
  // }
private interface ConnectCallback {
  void onDone(boolean ok, String message);
}

private void connectAsync(ConnectCallback cb) {
  synchronized (connLock) {
    if (isConnecting) {
      if (cb != null) cb.onDone(false, "Already connecting");
      return;
    }
    if (reader != null && reader.isConnected()) {
      if (cb != null) cb.onDone(true, "Already connected");
      return;
    }
    isConnecting = true;
  }

    new AsyncTask<Void, Void, String>() {
      @Override protected String doInBackground(Void... voids) {
        try {
          GetAvailableReader();
          if (reader == null) return "No reader";
          return connect();  // calls reader.connect() + ConfigureReader()
        } finally {
          synchronized (connLock) { isConnecting = false; }
        }
      }

      @Override protected void onPostExecute(String result) {
        boolean ok = (reader != null && reader.isConnected());
        if (cb != null) cb.onDone(ok, result);
      }
    }.executeOnExecutor(AsyncTask.SERIAL_EXECUTOR);
  }


  // Enumerates SDK based on host device
  private class CreateInstanceTask extends AsyncTask<Void, Void, Void> {
    @Override
    protected Void doInBackground(Void... voids) {
      Log.d(TAG, "CreateInstanceTask");
      // Based on support available on host device choose the reader type
      InvalidUsageException invalidUsageException = null;
      readers = new Readers(context, ENUM_TRANSPORT.ALL);
      try {
        availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
      } catch (Exception e){
        Log.d(TAG, "[CreateInstanceTask] exception: "+e.toString());
        e.printStackTrace();
      }
      if (invalidUsageException != null) {
        readers.Dispose();
        readers = null;
        if (readers == null) {
          readers = new Readers(context, ENUM_TRANSPORT.BLUETOOTH);
        }
      }
      return null;
    }

    @Override
    protected void onPostExecute(Void aVoid) {
      super.onPostExecute(aVoid);
      flushPendingConnectCallbacks();
    }
  }

  // private class ConnectionTask extends AsyncTask<Void, Void, String> {
  //   @Override
  //   protected String doInBackground(Void... voids) {
  //     Log.d(TAG, "ConnectionTask");
  //     GetAvailableReader();
  //     if (reader != null)
  //       return connect();
  //     return "Failed to find or connect reader";
  //   }

  //   @Override
  //   protected void onPostExecute(String result) {
  //     super.onPostExecute(result);
  //     // textView.setText(result);
  //   }
  // }

  private synchronized void GetAvailableReader() {
    Log.d(TAG, "GetAvailableReader");
    if (readers == null) return;

    ensureAttached();

    try {
      availableRFIDReaderList = readers.GetAvailableRFIDReaderList();
      Log.d(TAG, "availableRFIDReaderList: " + availableRFIDReaderList);

      if (availableRFIDReaderList != null && !availableRFIDReaderList.isEmpty()) {
        // Prefer matching by startsWith since your log shows "TC22R" but you store "TC22"
        ReaderDevice picked = availableRFIDReaderList.get(0);
        for (ReaderDevice d : availableRFIDReaderList) {
          if (d.getName() != null && d.getName().startsWith(readername)) {
            picked = d;
            break;
          }
        }
        readerDevice = picked;
        reader = readerDevice.getRFIDReader();
      }
    } catch (Exception e) {
      Log.d(TAG, "GetAvailableReader error: " + e);
    }
  }


  // handler for receiving reader appearance events
  @Override
  public void RFIDReaderAppeared(ReaderDevice readerDevice) {
    Log.d(TAG, "RFIDReaderAppeared " + readerDevice.getName());
    connectAsync(null);
  }

  @Override
  public void RFIDReaderDisappeared(ReaderDevice readerDevice) {
    Log.d(TAG, "RFIDReaderDisappeared " + readerDevice.getName());
    if (readerDevice.getName().equals(reader.getHostName()))
      disconnect();
  }


  private synchronized String connect() {
    if (reader != null) {
      Log.d(TAG, "connect " + reader.getHostName());
      try {
        if (!reader.isConnected()) {
          // Establish connection to the RFID Reader
          reader.connect();
          ConfigureReader();
          return "Connected";
        } else {
          Log.d(TAG, "Already connected");
        }
      } catch (InvalidUsageException e) {
        e.printStackTrace();
      } catch (OperationFailureException e) {
        e.printStackTrace();
        Log.d(TAG, "OperationFailureException " + e.getVendorMessage());
        String des = e.getResults().toString();
        return "Connection failed" + e.getVendorMessage() + " " + des;
      }
    }
    return "";
  }

  private void ConfigureReader() {
    Log.d(TAG, "ConfigureReader " + reader.getHostName());
    if (reader.isConnected()) {
      Log.d(TAG, "Reader connected");
      TriggerInfo triggerInfo = new TriggerInfo();
      triggerInfo.StartTrigger.setTriggerType(START_TRIGGER_TYPE.START_TRIGGER_TYPE_IMMEDIATE);
      triggerInfo.StopTrigger.setTriggerType(STOP_TRIGGER_TYPE.STOP_TRIGGER_TYPE_IMMEDIATE);
      try {
        // receive events from reader
        if (eventHandler == null)
          eventHandler = new EventHandler();

        reader.Events.addEventsListener(eventHandler);
        // HH event
        reader.Events.setHandheldEvent(true);
        // tag event with tag data
        reader.Events.setTagReadEvent(true);
        reader.Events.setAttachTagDataWithReadEvent(false);
        // set trigger mode as rfid so scanner beam will not come
        reader.Config.setTriggerMode(ENUM_TRIGGER_MODE.RFID_MODE, true);
        // set start and stop triggers
        reader.Config.setStartTrigger(triggerInfo.StartTrigger);
        reader.Config.setStopTrigger(triggerInfo.StopTrigger);
        // power levels are index based so maximum power supported get the last one
        MAX_POWER = reader.ReaderCapabilities.getTransmitPowerLevelValues().length - 1;
        Log.d(TAG, "MAX_POWER " + MAX_POWER);
        // set antenna configurations
        Antennas.AntennaRfConfig config = reader.Config.Antennas.getAntennaRfConfig(1);
        config.setTransmitPowerIndex(MAX_POWER);
        config.setrfModeTableIndex(0);
        config.setTari(0);
        reader.Config.Antennas.setAntennaRfConfig(1, config);
        // Set the singulation control
        Antennas.SingulationControl s1_singulationControl = reader.Config.Antennas.getSingulationControl(1);
        s1_singulationControl.setSession(SESSION.SESSION_S0);
        s1_singulationControl.Action.setInventoryState(INVENTORY_STATE.INVENTORY_STATE_A);
        s1_singulationControl.Action.setSLFlag(SL_FLAG.SL_ALL);
       reader.Config.Antennas.setSingulationControl(1, s1_singulationControl);
        // delete any prefilters
       reader.Actions.PreFilters.deleteAll();

        // Beeper configuaration
        // beeper.setBeeperSettings(DEFAULT_BEEPER_VOLUME);

      } catch (InvalidUsageException | OperationFailureException e) {
        e.printStackTrace();

    } catch (Exception e) {
      e.printStackTrace();
    }
    }
  }

  private synchronized void disconnect() {
    Log.d(TAG, "(synchronized) disconnect " + reader);
    try {
      // and if connected
      if (reader != null && reader.isConnected()) {
        reader.Events.removeEventsListener(eventHandler);
        reader.disconnect();
        context.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            // textView.setText("Disconnected");
          }
        });
      }
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private synchronized void dispose() {
    try {
      if (readers != null) {
        reader = null;
        readers.Dispose();
        readers = null;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  synchronized void performInventory() {
    // check reader connection
    if (!isReaderConnected())
      return;
    try {
      reader.Actions.Inventory.perform();
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
    }
  }

  synchronized void performLocationing(String epcID) {
    try {
      reader.Actions.TagLocationing.Perform(epcID, null, null);
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
    }
  }

  synchronized void stopInventory() {
    // check reader connection
    if (!isReaderConnected())
      return;
    try {
      reader.Actions.Inventory.stop();
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
    }
  }

  synchronized void stopLocationing() {
    try {
      reader.Actions.TagLocationing.Stop();
    } catch (InvalidUsageException e) {
      e.printStackTrace();
    } catch (OperationFailureException e) {
      e.printStackTrace();
    }
  }

  // Read/Status Notify handler
  // Implement the RfidEventsLister class to receive event notifications

  public class EventHandler implements RfidEventsListener {
    // Read Event Notification
    public void eventReadNotify(RfidReadEvents e) {
      // Recommended to use new method getReadTagsEx for better performance in case of large tag population
      TagData[] myTags = reader.Actions.getReadTags(100);

      if (myTags != null) {
        for (int index = 0; index < myTags.length; index++) {
          Log.d(TAG, "Tag ID " + myTags[index].getTagID());

          if (locateEPC.length() > 0) {
            if (myTags[index].isContainsLocationInfo()) {
              Log.d(TAG, "locatingTag location info: " + myTags[index].LocationInfo);
              short dist = myTags[index].LocationInfo.getRelativeDistance();
              Log.d(TAG, "Tag relative distance " + dist);
              String distance = String.valueOf(dist);
              new AsyncDistDataUpdate().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, distance);

              int tagProximityPercent = Integer.parseInt(distance);
              Beeper.startLocateBeeping(tagProximityPercent);
            }
          }
          else {
            if (myTags[index].getOpCode() == ACCESS_OPERATION_CODE.ACCESS_OPERATION_READ &&
              myTags[index].getOpStatus() == ACCESS_OPERATION_STATUS.ACCESS_SUCCESS) {
              if (myTags[index].getMemoryBankData().length() > 0) {
                Log.d(TAG, " Mem Bank Data " + myTags[index].getMemoryBankData());
              }
            }
            // Beep on each tag read
            beeper.startBeepingTimer();
            new AsyncTagDataUpdate().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, myTags);
          }
        }
        // possibly if operation was invoked from async tasks and still busy
        // handle tag data responses on parallel thread thus THREAD_POOL_EXECUTOR
        // new AsyncDataUpdate().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, myTags);
      }
    }

    // Status Event Notification
    public void eventStatusNotify(RfidStatusEvents rfidStatusEvents) {
      Log.d(TAG, "Status Notification: " + rfidStatusEvents.StatusEventData.getStatusEventType());
      Log.d(TAG, "[eventStatusNotify] rfidStatusEvents.StatusEventData.HandheldTriggerEventData.getHandheldEvent().toString() " + rfidStatusEvents.StatusEventData.HandheldTriggerEventData.getHandheldEvent().toString());
      Log.d(TAG, "[eventStatusNotify]  rfidStatusEvents.StatusEventData.getStatusEventType().toString()" + rfidStatusEvents.StatusEventData.getStatusEventType().toString());

      if (rfidStatusEvents.StatusEventData.getStatusEventType() == STATUS_EVENT_TYPE.HANDHELD_TRIGGER_EVENT) {
        if (rfidStatusEvents.StatusEventData.HandheldTriggerEventData.getHandheldEvent() == HANDHELD_TRIGGER_EVENT_TYPE.HANDHELD_TRIGGER_PRESSED) {
          new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
//              StaticHandler.handleTriggerPress(true, context);
              JSObject ret = new JSObject();

              // If there are items found, return item names
              // else return null message
              ret.put("isPress",  true);
              notifyListeners("triggerPressEvent", ret);
              Log.d(TAG, "eventStatusNotify locateTag " + locateEPC);

              if (locateEPC.length() > 0) {
                performLocationing(locateEPC);
              } else {
                performInventory();
              }

              return null;
            }
          }.execute();
        }

        if (rfidStatusEvents.StatusEventData.HandheldTriggerEventData.getHandheldEvent() == HANDHELD_TRIGGER_EVENT_TYPE.HANDHELD_TRIGGER_RELEASED) {
          new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
              stopInventory();

              JSObject ret = new JSObject();
              // If there are items found, return item names
              // else return null message
              ret.put("isPress",  false);
              notifyListeners("triggerPressEvent", ret);

              if (locateEPC.length() > 0) {
                stopLocationing();
                Beeper.stopLocateBeeping();
              }
              return null;
            }
          }.execute();
        }
      }
    }
  }

//  private class AsyncDataUpdate extends AsyncTask<TagData[], Void, Void> {
//    @Override
//    protected Void doInBackground(TagData[]... params) {
//      final StringBuilder sb = new StringBuilder();
//      List tagArray = new ArrayList();
//      for (int index = 0; index < params[0].length; index++) {
////        sb.append(params[0][index].getTagID() + "\n");
//        tagArray.add(params[0][index].getTagID());
//      }
//
//      JSObject ret = new JSObject();
//      ret.put("result",  tagArray);
//      notifyListeners("handleTagData", ret);
//
//      return null;
//    }
//  }

  private class AsyncTagDataUpdate extends AsyncTask<TagData[], Void, Void> {
    @Override
    protected Void doInBackground(TagData[]... params) {
      final StringBuilder sb = new StringBuilder();
      List tagArray = new ArrayList();
      for (int index = 0; index < params[0].length; index++) {
//        sb.append(params[0][index].getTagID() + "\n");
        tagArray.add(params[0][index].getTagID());
      }

      JSObject ret = new JSObject();
      ret.put("result",  tagArray);
      notifyListeners("handleTagData", ret);

      return null;
    }
  }

  private class AsyncDistDataUpdate extends AsyncTask<String, Void, Void> {
    @Override
    protected Void doInBackground(String... distance) {
      List distanceArray = new ArrayList<>();
      for (int index = 0; index < distance.length; index++) {
        distanceArray.add(distance[index]);
      }

      JSObject ret = new JSObject();
      Log.d(TAG, "AsyncDistDataUpdated " + distanceArray);
      ret.put("result", distanceArray);
      notifyListeners("handleDistanceData", ret);

      return null;
    }
  }


  // plugin methods
  @PluginMethod()
  public void connect(PluginCall call) {
    mainActivity = (MainActivity) getActivity();
    context = mainActivity;

    InitSDKOnce();
    // connectAsync();

    // JSObject ret = new JSObject();
    // ret.put("value", String.valueOf(isReaderConnected()));
    // call.resolve(ret);
    ensureSdkReadyThenConnect((ok, message) -> {
      JSObject ret = new JSObject();
      ret.put("ok", ok);
      ret.put("message", message);
      call.resolve(ret);
    });

  }

  @PluginMethod()
  public void disconnect(PluginCall call) {
    // mainActivity = (MainActivity) getActivity();
    Log.d(TAG, "plugin method disconnect ");

    // onCreate(mainActivity);
    this.disconnect();

    boolean result = isReaderConnected();

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  @PluginMethod()
  public void test1(PluginCall call) {

    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    String result = Test1();

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  @PluginMethod()
  public void setBeeperVolume(PluginCall call) {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    Log.d(TAG, "beeperVolume " + call.getString("volume"));
    int volume = Integer.parseInt(call.getString("volume"));
    int result = Beeper.setBeeperSettings(volume);

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  @PluginMethod()
  public void getBeeperVolume(PluginCall call) {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

//    if (!Beeper.getBeeperVolume()) {
//      JSObject ret = new JSObject();
//      ret.put("value", String.valueOf("Failed to retrieve beeper volume"));
//      call.resolve(ret);
//      return;
//    }

    int beeperVolume = Beeper.getBeeperVolume();
    Log.d(TAG, "getBeeperVolume " + beeperVolume);

    JSObject ret = new JSObject();
    ret.put("value" , String.valueOf(beeperVolume));
    call.resolve(ret);
  }

  @PluginMethod()
  public void setRFIDPowerLevel(PluginCall call) {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    Log.d(TAG, "powerLevel " + call.getString("level"));
    int powerLevel = Integer.parseInt(call.getString("level"));
    Log.d(TAG, "setPowerLevel " + powerLevel);
    String result = setRFIDPowerLevel(powerLevel);

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);
  }

  @PluginMethod()
  public void getRFIDPowerLevel(PluginCall call) {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    String levelStr = getRFIDPowerLevel();
    if (levelStr == null || levelStr.trim().length() == 0) {
      JSObject ret = new JSObject();
      ret.put("value", String.valueOf("Failed to retrieve RFID power level"));
      call.resolve(ret);
      return;
    }

    try {
      int powerLevel = Integer.parseInt(levelStr.trim());
      Log.d(TAG, "getPowerLevel " + powerLevel);

      JSObject ret = new JSObject();
      ret.put("value", String.valueOf(powerLevel));
      call.resolve(ret);
    } catch (NumberFormatException nfe) {
      Log.w(TAG, "getRFIDPowerLevel: Non-numeric response: " + levelStr);
      JSObject ret = new JSObject();
      ret.put("value", levelStr);
      call.resolve(ret);
    }
  }

  @PluginMethod()
  public void test2(PluginCall call) {

    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    String result = Test2();

    JSObject ret = new JSObject();
    ret.put("value", String.valueOf(result));
    call.resolve(ret);

  }

  @PluginMethod()
  public void performScan(PluginCall call)  {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    performInventory();  // perform simple inventory

    JSObject ret = new JSObject();
    ret.put("value", "performInventory");
    call.resolve(ret);
  }

  @PluginMethod()
  public void stopScan(PluginCall call) {
    if (!isReaderConnected()) {
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    // stop the inventory
    stopInventory();

    JSObject ret = new JSObject();
    ret.put("value", "stopInventory");
    call.resolve(ret);
}

  // For trigger-based locationing scan
  @PluginMethod()
  public void setLocationingID(PluginCall call) {
    locateEPC = call.getString("tagID");
    Log.d(TAG, "setLocationingID: " + locateEPC);

    JSObject ret = new JSObject();
    ret.put("value", "set Locationing ID: " + locateEPC);
    call.resolve(ret);
  }

  @PluginMethod()
  public void removeLocationingID(PluginCall call) {
    locateEPC = "";
    Log.d(TAG, "removeLocationingID: " + locateEPC);

    JSObject ret = new JSObject();
    ret.put("value", "remove Locationing ID: " + locateEPC);
    call.resolve(ret);
  }

  @PluginMethod()
  public void performLocationingScan(PluginCall call) {
    if (!isReaderConnected()) {
      Log.d(TAG, "performLocationingScan -- RFID not connected");
      JSObject ret = new JSObject();
      ret.put("value", "RFID is not connected");
      call.resolve(ret);
      return;
    }

    locateEPC = call.getString("tagID");
    performLocationing(locateEPC);

    JSObject ret = new JSObject();
    ret.put("value", "performLocationing for: " + locateEPC);
    call.resolve(ret);
  }

  @PluginMethod()
  public void stopLocationingScan(PluginCall call) {
    stopLocationing();

    JSObject ret = new JSObject();
    ret.put("value", "Stop locationing");
    call.resolve(ret);
  }

  // @PluginMethod()
  // public void setTriggerMode(PluginCall call) {
  // if (!isReaderConnected()) {
  //   JSObject ret = new JSObject();
  //   ret.put("ok", false);
  //   ret.put("message", "RFID is not connected");
  //   call.resolve(ret);
  //   return;
  // }

  // String mode = call.getString("mode", "RFID"); // "RFID" or "BARCODE"
  // try {
  //   ENUM_TRIGGER_MODE triggerMode =
  //     "BARCODE".equalsIgnoreCase(mode)
  //       ? ENUM_TRIGGER_MODE.BARCODE_MODE
  //       : ENUM_TRIGGER_MODE.RFID_MODE;

  //   reader.Config.setTriggerMode(triggerMode, true);

  //   JSObject ret = new JSObject();
  //   ret.put("ok", true);
  //   ret.put("mode", mode);
  //   call.resolve(ret);
  // } catch (Exception e) {
  //   JSObject ret = new JSObject();
  //   ret.put("ok", false);
  //   ret.put("message", e.toString());
  //   call.resolve(ret);
  // }
  // }

}
