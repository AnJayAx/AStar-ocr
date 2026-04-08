package com.example.app.plugin.HelloWorld;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import android.content.res.Configuration;

@CapacitorPlugin(name = "HelloWorld")
public class HelloWorldPlugin extends Plugin {

  private HelloWorld implementation;

  @Override
  public void load() {
    // Initialize HelloWorld class instance with Capacitor bridge object
    implementation = new HelloWorld(getActivity());
  }

  @PluginMethod()
  public void getHelloWorld(PluginCall call) {
    JSObject ret = new JSObject();
    String helloWorld = implementation.getCurrentHelloWorld();
    ret.put("message", helloWorld);
    call.resolve(ret);
  }
}
