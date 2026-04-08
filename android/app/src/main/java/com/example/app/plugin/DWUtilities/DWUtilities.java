package com.example.app.plugin.DWUtilities;

import android.widget.Toast;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.app.Activity;

public class DWUtilities {

  // private AppCompatActivity activity;
  private Activity activity;

  private String activeProfile;
  private String[] profileList;

  public DWUtilities(Activity activity) {
    this.activity = activity;
  }

  public String getCurrentActiveProfile() {
    registerReceivers();

    //Sending the intent
    Intent i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    this.activity.sendBroadcast(i);
    
    return activeProfile;
  }

  public String[] getCurrentProfileList() {
    registerReceivers();

    // Sending the intent
    Intent i = new Intent();
    i.setAction("com.symbol.datawedge.api.ACTION");
    i.putExtra("com.symbol.datawedge.api.GET_PROFILES_LIST", "");
    this.activity.sendBroadcast(i);

    return profileList;
  }

  //Receiving the result
  public final BroadcastReceiver myBroadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      // Toast.makeText(context, "DWUtilities broadcast receiver ---", Toast.LENGTH_SHORT).show();

      Bundle extras = intent.getExtras();

      if (intent.hasExtra("com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE")) {
        activeProfile = extras.getString("com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE");
        System.out.println("ACTIVE PROFILE" + activeProfile.toString());
      }

      if (intent.hasExtra("com.symbol.datawedge.api.RESULT_GET_PROFILES_LIST")) {
        // profileList = intent.getStringArrayExtra("com.symbol.datawedge.api.RESULT_GET_PROFILES_LIST");
        profileList = extras.getStringArray("com.symbol.datawedge.api.RESULT_GET_PROFILES_LIST");
        System.out.println("PROFILE LIST" + profileList.toString());
      }

    }
  };

  // Register/unregister broadcast receiver and filter results
  void registerReceivers() {
    IntentFilter filter = new IntentFilter();
    filter.addAction("com.symbol.datawedge.api.RESULT_ACTION");
    filter.addCategory("android.intent.category.DEFAULT");
    this.activity.registerReceiver(myBroadcastReceiver, filter);
  }

  void unRegisterReceivers(){
    this.activity.unregisterReceiver(myBroadcastReceiver);
  }

  // private void createProfile() {
  //   Bundle bMain = new Bundle();
  //   bMain.putString("PROFILE_NAME", "Profile0 (default)");
  //   bMain.putString("PROFILE_ENABLED", "true");
  //   bMain.putString("CONFIG_MODE", "CREATE_IF_NOT_EXIST");

  //   Bundle bConfig = new Bundle();
  //   bConfig.putString("PLUGIN_NAME", "INTENT");

  //   Bundle bParams = new Bundle();
  //   bParams.putString("intent_output_enabled", "true");
  //   bParams.putString("intent_action", "com.zebra.ssw");
  //   bParams.putString("intent_category", "android.intent.category.DEFAULT");
  //   bParams.putString("intent_delivery", "2");

  //   bConfig.putBundle("PARAM_LIST", bParams);
  //   bMain.putBundle("PLUGIN_CONFIG", bConfig);

  //   Intent i = new Intent();
  //   i.setAction("com.symbol.datawedge.api.ACTION");
  //   i.putExtra("com.symbol.datawedge.api.SET_CONFIG", bMain);
  //   i.putExtra("com.symbol.datawedge.api.GET_VERSION_INFO", "");

  //   this.activity.sendBroadcast(i);
  // }


}
