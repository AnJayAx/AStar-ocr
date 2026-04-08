package com.example.app.plugin.HelloWorld;

import androidx.appcompat.app.AppCompatActivity;

import androidx.annotation.Nullable;

public class HelloWorld {

  private AppCompatActivity activity;

  public HelloWorld(AppCompatActivity activity) {
    this.activity = activity;
  }

  public String getCurrentHelloWorld() {
    return "Hello World";
  }

}
