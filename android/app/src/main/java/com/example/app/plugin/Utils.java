package com.example.app.plugin;

import android.content.Context;
import android.app.Activity;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraManager;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;


public class Utils extends AppCompatActivity {

    public static String TAG = "Barcode Plugin";
    public Activity activity;
    CameraManager manager;

    public Utils(Activity activity) {
        this.activity = activity;
    }

    @Override
    protected void onCreate(Bundle savedInstance) {
        super.onCreate(savedInstance);
        activity = this;
    }

    public Boolean isCameraValid() {
        manager = (CameraManager) activity.getSystemService(Context.CAMERA_SERVICE);
        Boolean isValid = false;

        try {

            String[] idList = manager.getCameraIdList();
            int numCameras = idList.length;
            if (numCameras > 0) {
                isValid = true;
            } else {
                isValid = false;
            }
            
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }

        return isValid;
    }
}
