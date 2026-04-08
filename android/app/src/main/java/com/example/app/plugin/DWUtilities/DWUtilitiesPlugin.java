package com.example.app.plugin.DWUtilities;

import android.app.Activity;
import android.util.Log;

import com.example.app.plugin.Utils;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.content.Context;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraManager;

@CapacitorPlugin(name = "DWUtilities")
public class DWUtilitiesPlugin extends Plugin {

  public static String TAG = "DW Barcode Plugin";
  private DWUtilities implementation;
  private PluginCall mCall;
  private Activity context;
  private Utils utils;
  Boolean isValid;

  @Override
  public void load() {
    implementation = new DWUtilities(getActivity());
    utils = new Utils(getActivity());
  }

  @PluginMethod()
  public void isCameraValid(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);
    isValid = utils.isCameraValid();
    JSObject ret = new JSObject();
    String valid = Boolean.toString(isValid);
    Log.d(TAG, "isCameraValid " + valid);
    ret.put("value", valid);
    mCall.resolve(ret);
  }

  @PluginMethod()
  public void getActiveProfile(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);
    JSObject ret = new JSObject();
    String ap = implementation.getCurrentActiveProfile();
    ret.put("value", ap);
    mCall.resolve(ret);
  }

  @PluginMethod()
  public void getProfileList(PluginCall call) {
    mCall = call;
    mCall.setKeepAlive(true);
    JSObject ret = new JSObject();
    String[] pl = implementation.getCurrentProfileList();
    ret.put("value", pl);
    mCall.resolve(ret);
  }

}
