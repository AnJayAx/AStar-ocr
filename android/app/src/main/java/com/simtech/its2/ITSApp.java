package com.simtech.its2;

import android.app.Application;
import android.content.Context;
import android.util.Log;
import android.widget.Button;

import java.util.Timer;
import java.util.TimerTask;

import Utility.AppPreferences;
import Utility.LogoutListener;


/**
* Created by chiayc on 07/30/2018.
*/

public class ITSApp extends Application {

   public static AppPreferences appPreferences;
   public static Context context;
   private LogoutListener listener;
   private Timer timer;

   @Override
   public void onCreate() {
       super.onCreate();

       context = getApplicationContext();
       appPreferences = new AppPreferences(this);
       if (appPreferences == null) {
           Log.e("appPreferences", "null");
       }
   }

   public void startUserSession() {
//        int defaultTimer = 900000;
//        int duration = 0;
//
//        int serverLogoutTimer = ITSApp.appPreferences.getLogoutTimer();
//
//        try{
//            if(serverLogoutTimer==-1)
//                duration = defaultTimer;
//            else
//                duration = serverLogoutTimer;
//
//            Log.d("timer: ", String.valueOf(duration));
//
//            cancelTimer();
//            timer = new Timer();
//            timer.schedule(new TimerTask() {
//                @Override
//                public void run() {
//                    listener.onSessionLogout();
//                }
//            }, duration);//id no response for 20 minutes, logout user
//        }
//        catch (Exception e){
//            e.getMessage();
//        }
   }

   private void cancelTimer() {
//        if (timer != null) {
//            timer.cancel();
//        }
   }

   public void registerSessionListener(LogoutListener listener) {
       //this.listener = listener;
   }

   public void onUserInteracted() {
       //startUserSession();
   }
}
