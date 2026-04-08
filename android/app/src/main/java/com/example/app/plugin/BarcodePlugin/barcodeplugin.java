package com.example.app.plugin.BarcodePlugin;

import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.Set;
import java.util.HashSet;

import com.example.app.plugin.Barcode;

public class barcodeplugin {

    public static String TAG = "Barcode Plugin";

    // public String echo(String value) {
    //     Log.i("Echo", value);
    //     return value;
    // }

    public List<String> addToBarcodeList(List<String> bcList, String bc) {
        ArrayList<String> list = new ArrayList<>(bcList);
        list.add(bc);

        Set<String> noDup = new HashSet<>(list);
        return new ArrayList<>(noDup);
    }

    public List<String> getNoDupEPCListFromBarcodeList(List<Barcode> bcList) {
        ListIterator<Barcode> bcItrbl = new ArrayList<>(bcList).listIterator();
        HashSet<String> epcList = new HashSet<>();
        while (bcItrbl.hasNext()) {
            String epc = bcItrbl.next().barcodeData;
            epcList.add("\""+ epc + "\"");
        }
        Log.d(TAG, "EPC list: " + epcList);
        return new ArrayList<>(epcList);
    }

    public List<String> getNoDupEPCList(List<String> epcList) {
        HashSet<String> noDupList = new HashSet<>();
        for (int i=0; i<epcList.size(); i++) {
            noDupList.add(epcList.get(i));
        }
        return new ArrayList<>(noDupList);
    }

}
