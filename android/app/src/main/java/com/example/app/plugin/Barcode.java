package com.example.app.plugin;

import android.os.Parcel;
import android.os.Parcelable;

import java.io.Serializable;

// TESTING
public class Barcode implements Parcelable, Serializable {

    public String barcodeData;
    public String barcodeType;
    private int isChecked = 1;

    public Barcode() {
    }

    public Barcode(String barcodeData, String barcodeType, int isChecked) {
        this.barcodeData = barcodeData;
        this.barcodeType = barcodeType;
        this.isChecked = isChecked;
    }

    protected Barcode(Parcel in) {
        barcodeData = in.readString();
        barcodeType = in.readString();
        isChecked = in.readInt();
    }

    public static final Creator<Barcode> CREATOR = new Creator<Barcode>() {
        @Override
        public Barcode createFromParcel(Parcel in) {
            return new Barcode(in);
        }

        @Override
        public Barcode[] newArray(int size) {
            return new Barcode[size];
        }
    };

    public String getBarcodeData() {
        return barcodeData;
    }

    public void setBarcodeData(String barcodeData) {
        this.barcodeData = barcodeData;
    }

    public String getBarcodeType() {
        return barcodeType;
    }

    public void setBarcodeType(String barcodeType) {
        this.barcodeType = barcodeType;
    }

    public int getIsChecked() {
        return isChecked;
    }

    public void setIsChecked(int isChecked) {
        this.isChecked = isChecked;
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(barcodeData);
        dest.writeString(barcodeType);
        dest.writeInt(isChecked);
    }

    public static Creator<Barcode> getCREATOR() {
        return CREATOR;
    }
}
