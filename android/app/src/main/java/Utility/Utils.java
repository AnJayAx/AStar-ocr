package Utility;

// import static Utility.NetworkConnService.mServerConnStatus;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.Dialog;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.hardware.Camera;
import android.os.Build;
import android.os.Environment;
//import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import com.example.app.plugin.Barcode;
import com.simtech.its2.ITSApp;
//import com.simtech.its2.R;
// import com.thoughtworks.xstream.XStream;
// import com.thoughtworks.xstream.io.xml.DomDriver;
// import com.thoughtworks.xstream.io.xml.XmlFriendlyNameCoder;

// import org.ksoap2.SoapEnvelope;
// import org.ksoap2.serialization.SoapObject;
// import org.ksoap2.serialization.SoapSerializationEnvelope;
// import org.ksoap2.transport.HttpTransportSE;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.nio.channels.FileChannel;
import java.security.Key;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import Classes.APIConfig;
// import Classes.Asset;
// import Classes.AssetAuditHistorySync;
// import Classes.AssetFlowHistorySync;
// import Classes.AssetLocation;
// import Classes.AssetMROHistorySync;
// import Classes.AssetSync;
// import Classes.Barcode;
// import Classes.ImageTransaction;
// import Classes.PickedItemSync;
// import Classes.StockTakingHistorySync;
// import Classes.Verification;
import ReaderModel.Zebra.Inventory.InventoryListItem;

/**
 * Created by chiayc on 07/30/2018.
 */

public class Utils implements AppConstants {

    private Context mContext;
    public Dialog mDialog;

    //region SINGLETON
    private static Utils instance = new Utils();

    /* A private Constructor prevents any other class from instantiating.*/
    private Utils() {
    }

    /* Static 'instance' method */
    public static Utils getInstance() {
        if (instance == null) {
            instance = new Utils();
        }
        return instance;
    }


    public void init(Context context) {
        this.mContext = context.getApplicationContext();
    }
    //endregion

    //To check edit text is empty
    public boolean isEditTextEmpty(EditText editText) {
        if (editText.getText().toString().trim().length() > 0)
            return false;
        return true;
    }

    //To check string is empty or null
    public boolean isEmptyString(String value) {
        if (value != null || value.trim().length() > 0 || !value.equals("")) return false;
        return true;
    }

    //To create folder named Event and write event log based on device's today date
    public void writeEventLogFile(String message) {

        try {
            //ITS
            String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH;
            File root = new File(rootPath);
            if (!root.exists()) {
                root.mkdir();
            }

            File eventFolder = new File(Environment.getExternalStorageDirectory(), FILE_PATH + EVENT_FILE);

            if (!eventFolder.exists()) {
                eventFolder.mkdirs();
            }

            File eventLog = new File(eventFolder + "/" + getCurrentDate() + "_" + EVENT_LOG);
            if (!eventLog.exists()) {
                eventLog.createNewFile();
            }
            try {
                BufferedWriter buf = new BufferedWriter(new FileWriter(eventLog, true));
                buf.append(getCurrentTimeStamp() + " " + message + "\n\r");
                buf.append("\n\r");
                buf.newLine();
                buf.close();
            } catch (IOException e) {
                writeErrorLogFile(METHOD + new Object() {
                }.getClass().getEnclosingMethod().getName() + "\n" + IOEXCEPTION + e.getMessage());
            }
        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
    }

    //To create folder named Error and write error log based on device's today date
    public void writeErrorLogFile(String message) {

        try {

            //ITS
            String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH;
            File root = new File(rootPath);
            if (!root.exists()) {
                root.mkdir();
            }

            File errorFolder = new File(Environment.getExternalStorageDirectory(), FILE_PATH + ERROR_FILE);
            if (!errorFolder.exists()) {
                errorFolder.mkdirs();
            }

            File errorLog = new File(errorFolder + "/" + getCurrentDate() + "_" + ERROR_LOG);
            if (!errorLog.exists()) {
                errorLog.createNewFile();
            }

            try {
                BufferedWriter buf = new BufferedWriter(new FileWriter(errorLog, true));
                buf.append(getCurrentTimeStamp() + " " + message + "\n\r");
                buf.append("\n\r");
                buf.newLine();
                buf.close();
            } catch (IOException e) {
                writeErrorLogFile(METHOD + new Object() {
                }.getClass().getEnclosingMethod().getName() + "\n" + IOEXCEPTION + e.getMessage());
            }

            Log.d("ITS error:", message);
        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
    }

    //To create app root folder named ITS
    public void createITSFolderExternalStorage(Context mContext) {

        try {

            //ITS
            String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH;
            File root = new File(rootPath);
            if (!root.exists()) {
                root.mkdirs();
            }

            copyConfigFromAssetsFile(mContext);
            readConfigFile();

        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n rootPath" + EXCEPTION + e.getMessage());
        }
    }

    //To copy default configuration file from app's Assets folder
    public void copyConfigFromAssetsFile(Context mContext) {

        try {
            String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH + CONFIG_FILE;
            File toPath = new File(rootPath);
            if (!toPath.exists()) {
                toPath.mkdirs();
            }

            InputStream inStream = mContext.getAssets().open(CONFIG_XML);
            BufferedReader br = new BufferedReader(new InputStreamReader(inStream));

            String filePath = rootPath + "/" + CONFIG_XML;
            File tempPath = new File(filePath);
            if (!tempPath.exists()) {
                File toFile = new File(toPath, CONFIG_XML);
                copyAssetFile(br, toFile);
            }
        } catch (IOException e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
    }

    //Edited on 20201117
    public APIConfig readConfigFile() {

        APIConfig apiConfig = null;
        try {
            String filePath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH + CONFIG_FILE + "/" + CONFIG_XML;
            File file = new File(filePath);
            if (!file.exists())
                copyConfigFromAssetsFile(mContext);

            String test = getXml(filePath);

            if (test != null) {
                DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
                DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
                Document doc = dBuilder.parse(new InputSource(new StringReader(test)));

                Element element = doc.getDocumentElement();
                element.normalize();

                NodeList nList = doc.getElementsByTagName(CONFIGURATION);

                for (int i = 0; i < nList.getLength(); i++) {
                    Node node = nList.item(i);
                    apiConfig = new APIConfig();
                    if (node.getNodeType() == Node.ELEMENT_NODE) {
                        Element element2 = (Element) node;
                        apiConfig.set_appdirectory(getValue(APP_DIRECTORY, element2));
                        apiConfig.set_databasename(getValue(DATABASE_NAME, element2));
                        apiConfig.set_ip(getValue(IP, element2));
                        apiConfig.set_port(getValue(PORT, element2));
                        apiConfig.set_soap_address(getValue(SOAP_ADDRESS, element2));
                        apiConfig.set_url(apiConfig.get_ip() + ":" + apiConfig.get_port() + "/" + apiConfig.get_soap_address());
                        apiConfig.set_urlsvc(getValue(URLSVC, element2));
                        apiConfig.set_namespace(getValue(NAMESPACE, element2));
                        apiConfig.set_soap_action(getValue(SOAP_ACTION, element2));
                        apiConfig.set_epcid(getValue(EPCIDSTARTWITH, element2));
                        apiConfig.set_readermodelname(getValue(READERMODELNAME, element2));
                        apiConfig.set_appmode(Integer.parseInt(getValue(APPMODE, element2)));
                        apiConfig.set_imgpath(getValue(IMGPATH, element2));
                        apiConfig.set_language(getValue(LANGUAGE, element2));
                        apiConfig.set_epcidmode(getValue(EPCIDMODE, element2));
                        apiConfig.set_cioautofillqtymode(getValue(CIOAUTOFILLQTYMODE, element2));
                        apiConfig.set_stautofillqtymode(getValue(STAUTOFILLQTYMODE, element2));
                        apiConfig.set_logfilelimit(getValue(LOGFILELIMIT, element2));
                        apiConfig.set_stprevbal_visible(getValue(STPREVBALVISIBLE, element2));
                        ITSApp.appPreferences.setAPI(apiConfig);
                    }
                }

            }
        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
        return apiConfig;
    }

    public List<InventoryListItem> filterTagIDPrefix(List<InventoryListItem> inventoryListItems) {

        List<InventoryListItem> tagList = new ArrayList<>();

        try {

            String defaultTagIDPrefix = ITSApp.appPreferences.getAPI().get_epcid();

            if (inventoryListItems.size() > 0) {
                for (InventoryListItem inventoryListItem : inventoryListItems) {
                    String tagIDPrefix = inventoryListItem.getTagID().substring(0, 4);

                    if (ITSApp.appPreferences.getAPI().get_epcidmode().equals("True")) {
                        if (defaultTagIDPrefix.contains(tagIDPrefix)) {
                            tagList.add(inventoryListItem);
                        }
                    } else {
                        tagList.add(inventoryListItem);
                    }
                }
            }

        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
        return tagList;
    }

    public List<Barcode> filterBarcodePrefix(List<Barcode> barcodeList) {

        List<Barcode> tagList = new ArrayList<>();

        try {
            String defaultTagIDPrefix = ITSApp.appPreferences.getAPI().get_epcid();

            if (barcodeList.size() > 0) {
                for (Barcode barcode : barcodeList) {
                    String tagIDPrefix = barcode.getBarcodeData().substring(0, 4);
                    if (ITSApp.appPreferences.getAPI().get_epcidmode().equals("True")) {
                        if (defaultTagIDPrefix.contains(tagIDPrefix)) {
                            tagList.add(barcode);
                        }
                    } else
                        tagList.add(barcode);
                }
            }

        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
        return tagList;
    }

    //To get the xml value based on key
    private String getValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag).item(0).getChildNodes();
        Node node = nodeList.item(0);
        return node.getNodeValue();
    }

    //Edited on 20201117
    public String getXml(String fileName) {
        String xmlString = null;
        try {
            FileInputStream is = new FileInputStream(fileName);

            int length = is.available();
            byte[] data = new byte[length];
            is.read(data);
            xmlString = new String(data);
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        return xmlString;
    }

    //Edited on 20201117
    public void updateConfigFile(APIConfig apiConfig) {
        try {

            if (!apiConfig.get_databasename().isEmpty()) {
                String filePath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH + CONFIG_FILE + "/" + CONFIG_XML;
                File file = new File(filePath);
                DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
                DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
                Document doc = docBuilder.parse(file);

                // Change the content of node
                Node nodes = doc.getElementsByTagName(IP).item(0);
                nodes.setTextContent(apiConfig.get_ip());

                Node nodesReaderModelName = doc.getElementsByTagName(READERMODELNAME).item(0);
                nodesReaderModelName.setTextContent(apiConfig.get_readermodelname());

                Node nodesAppMode = doc.getElementsByTagName(APPMODE).item(0);
                nodesAppMode.setTextContent(String.valueOf(apiConfig.get_appmode()));

                Node nodesLanguage = doc.getElementsByTagName(LANGUAGE).item(0);
                nodesLanguage.setTextContent(String.valueOf(apiConfig.get_language()));

                Node nodesPort = doc.getElementsByTagName(PORT).item(0);
                nodesPort.setTextContent(String.valueOf(apiConfig.get_port()));

                Node nodesEPCID = doc.getElementsByTagName(EPCIDSTARTWITH).item(0);
                nodesEPCID.setTextContent(String.valueOf(apiConfig.get_epcid()));

                Node nodesEPCIDMODE = doc.getElementsByTagName(EPCIDMODE).item(0);
                nodesEPCIDMODE.setTextContent(String.valueOf(apiConfig.get_epcidmode()));

                Node nodesCIOAutoFillQty = doc.getElementsByTagName(CIOAUTOFILLQTYMODE).item(0);
                nodesCIOAutoFillQty.setTextContent(String.valueOf(apiConfig.get_cioautofillqtymode()));

                Node nodesSTAutoFillQty = doc.getElementsByTagName(STAUTOFILLQTYMODE).item(0);
                nodesSTAutoFillQty.setTextContent(String.valueOf(apiConfig.get_stautofillqtymode()));

                Transformer transformer = TransformerFactory.newInstance().newTransformer();
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");

                // initialize StreamResult with File object to save to file
                StreamResult result = new StreamResult(file);
                DOMSource source = new DOMSource(doc);
                transformer.transform(source, result);

                readConfigFile();
            }

        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }
    }


    public void copyAssetFile(BufferedReader br, File toFile) throws IOException {
        BufferedWriter bw = null;
        try {
            bw = new BufferedWriter(new FileWriter(toFile));

            int in;
            while ((in = br.read()) != -1) {
                bw.write(in);
            }
        } finally {
            if (bw != null) {
                bw.close();
            }
            br.close();
        }
    }

    public String getCurrentTimeStamp() {

        String result = "";

        try {
            SimpleDateFormat s = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            result = s.format(new Date());
        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }

        return result;
    }

    //Get today date format
    public String getCurrentDate() {

        String result = "";

        try {
            SimpleDateFormat s = new SimpleDateFormat("yyyy-MM-dd");
            result = s.format(new Date());
        } catch (Exception e) {
            writeErrorLogFile(METHOD + new Object() {
            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        }

        return result;
    }

    //region BACKGROUND SERVICE
    //To identify background service is running
    public boolean isServiceRunning(Class<?> serviceClass, Context mContext) {
        ActivityManager manager = (ActivityManager) mContext.getSystemService(Context
                .ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    //To start background service for checking internet connection and sync local database
    public void startService(Context mContext) {

        // try {
        //     if (!Utils.getInstance().isServiceRunning(NetworkConnService.class, mContext)) {
        //         Intent startIntent = new Intent(mContext, NetworkConnService.class);
        //         mContext.startService(startIntent);
        //         writeEventLogFile(EVENT + mContext.getString(R.string.event_start_service));
        //     }
        // } catch (Exception e) {
        //     writeErrorLogFile(METHOD + new Object() {
        //     }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        // }
    }

    //To stop background service for checking internet connection and sync local database
    public void stopServices(Context mContext) {

        // try {

        //     Intent stopIntent = new Intent(mContext, NetworkConnService.class);
        //     mContext.stopService(stopIntent);

        //     NotificationManager notificationManager = (NotificationManager) mContext
        //             .getSystemService(Context.NOTIFICATION_SERVICE);
        //     notificationManager.cancel(0);
        //     writeEventLogFile(EVENT + mContext.getString(R.string.event_stop_service));
        // } catch (Exception e) {
        //     writeErrorLogFile(METHOD + new Object() {
        //     }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
        // }
    }
//    //endregion

    public boolean isRFD8500() {
//        if (Application.mConnectedReader != null && Application.mConnectedReader.ReaderCapabilities.getModelName() != null &&
//                Application.mConnectedReader.ReaderCapabilities.getModelName().contains(RFD8500))
//            return true;
//        else
//            return false;
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(RFD8500))
            return true;
        else
            return false;
    }

    public boolean isMC3300() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(MC33))
            return true;
        else
            return false;
    }

    public boolean isCilico() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(CILICO_AHT))
            return true;
        else
            return false;
    }

    public boolean isATS100() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(ATS100))
            return true;
        else
            return false;
    }

    public boolean isTC256() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(TC25) || ITSApp.appPreferences.getAPI().get_readermodelname().contains(TC26) ||
                ITSApp.appPreferences.getAPI().get_readermodelname().contains(TC21))
            return true;
        else
            return false;
    }

    public boolean isCW() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(CHAINWAY_C72E) || ITSApp.appPreferences.getAPI().get_readermodelname().contains(CHAINWAY_C66))
            return true;
        else
            return false;
    }

    public boolean isCipherLab() {
        if (ITSApp.appPreferences.getAPI().get_readermodelname().contains(CIPHERLAB))
            return true;
        else
            return false;
    }

    public void hideKeyboard(View view) {
        try {
            InputMethodManager imm = (InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        } catch (Exception ignored) {
        }
    }

    public List<String> getExistTagCount(String result) {

        String filteredStr = result.replace(RESULT_EXIST, "");
        filteredStr = filteredStr.replace("'", "");
        filteredStr = filteredStr.replace(",)", "");
        return new ArrayList<String>(Arrays.asList(filteredStr.split(",")));

    }

    //region UPLOAD OFFLINE DATA IN XML
//    public String convertAssetListToXml(List<AssetSync> mAssetList) {
//
//        String result = "";
//
//        try {
//            if (mAssetList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(AssetSync.Entry.TABLE_NAME, AssetSync.class);
//                xStream.aliasPackage(XML_DATA_ASSET, String.valueOf(mAssetList));
//                result = xStream.toXML(mAssetList);
//            } else {
//                result = "<list></list>";
//            }
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String convertAFHListToXml(List<AssetFlowHistorySync> mAFHList) {
//
//        String result = "";
//
//        try {
//            if (mAFHList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(AssetFlowHistorySync.Entry.TABLE_NAME, AssetFlowHistorySync.class);
//                xStream.aliasPackage(XML_DATA_ASSET_FH, String.valueOf(mAFHList));
//                result = xStream.toXML(mAFHList);
//            } else {
//                result = "<list></list>";
//            }
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String convertAuditListToXml(List<AssetAuditHistorySync> mAHList) {
//
//        String result = "";
//
//        try {
//            if (mAHList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(AssetAuditHistorySync.Entry.TABLE_NAME, AssetAuditHistorySync.class);
//                xStream.aliasPackage(XML_DATA_ASSET_AUDIT, String.valueOf(mAHList));
//                result = xStream.toXML(mAHList);
//            } else {
//                result = "<list></list>";
//            }
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String convertMROHListToXml(List<AssetMROHistorySync> mMROHList) {
//
//        String result = "";
//
//        try {
//
//            if (mMROHList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(AssetMROHistorySync.Entry.TABLE_NAME, AssetMROHistorySync.class);
//                xStream.aliasPackage(XML_DATA_ASSET_MRO, String.valueOf(mMROHList));
//                result = xStream.toXML(mMROHList);
//            } else {
//                result = "<list></list>";
//            }
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String convertSTHListToXml(List<StockTakingHistorySync> mSTHList) {
//
//        String result = "";
//
//        try {
//            if (mSTHList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(StockTakingHistorySync.Entry.TABLE_NAME, StockTakingHistorySync.class);
//                xStream.aliasPackage(XML_DATA_ASSET_ST, String.valueOf(mSTHList));
//                result = xStream.toXML(mSTHList);
//            } else {
//                result = "<list></list>";
//            }
//
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String converPIListToXml(List<PickedItemSync> mPIList) {
//
//        String result = "";
//
//        try {
//            if (mPIList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(PickedItemSync.Entry.TABLE_NAME, PickedItemSync.class);
//                xStream.aliasPackage(XML_DATA_ASSET_PI, String.valueOf(mPIList));
//                result = xStream.toXML(mPIList);
//            } else {
//                result = "<list></list>";
//            }
//
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + "\n" + EXCEPTION + e.getMessage());
//        }
//
//        return result;
//    }

//    public String converVListToXml(List<Verification> mVList) {
//
//        String result = "";
//
//        try {
//            if (mVList.size() > 0) {
//                XStream xStream = new XStream(new DomDriver("UTF-8", new XmlFriendlyNameCoder("_-", "_")));
//                xStream.alias(Verification.Entry.TABLE_NAME, Verification.class);
//                xStream.aliasPackage(XML_DATA_ASSET_VERIFICATION, String.valueOf(mVList));
//                result = xStream.toXML(mVList);
//            } else {
//                result = "<list></list>";
//            }
//
//        } catch (Exception e) {
//            writeErrorLogFile(METHOD + new Object() {
//            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
//        }
//
//        return result;
//    }
    //endregion

//    public static final SoapSerializationEnvelope getSoapSerializationEnvelope(SoapObject request) {
//        SoapSerializationEnvelope envelope = new SoapSerializationEnvelope(SoapEnvelope.VER11);
//        envelope.dotNet = true;
//        envelope.implicitTypes = true;
//        envelope.setAddAdornments(false);
//        envelope.setOutputSoapObject(request);
//
//        return envelope;
//    }

//    public static final HttpTransportSE getHttpTransportSE(String URL) {
//        HttpTransportSE ht = new HttpTransportSE(URL);
//        ht.debug = true;
//        ht.setXmlVersionTag("<!--?xml version=\"1.0\" encoding= \"UTF-8\" ?-->");
//        return ht;
//    }

    public void saveImage(Bitmap imageToSave, String fileName, String module) {

        File direct = new File(Environment.getExternalStorageDirectory() + "/ITS/Images/" + module);

        if (!direct.exists()) {
            File wallpaperDirectory = new File("/sdcard/ITS/Images/" + module);
            wallpaperDirectory.mkdirs();
        }

        File file = new File(new File("/sdcard/ITS/Images/" + module), fileName);
        if (file.exists()) {
            file.delete();
        }

        try {
            FileOutputStream out = new FileOutputStream(file);
            imageToSave.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
    }

    public void manageImage(String fileName, String module, String newFilename, Bitmap newImage) {

        //If, filename is exist, delete
        //Then, save new image to file

//        File file = new File("/sdcard/ITS/Images/" + module + "/" + fileName);
//        if (file.exists()) {
//            file.delete();
//        }

        File fileModule = new File("/sdcard/ITS/Images/" + module + "/");
        if (!fileModule.exists()) {
            fileModule.mkdirs();
        }

        File newfile = new File(new File("/sdcard/ITS/Images/" + module), newFilename);

        try {
            FileOutputStream out = new FileOutputStream(newfile);
            newImage.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
    }

    public void saveFolderInImage(Bitmap imageToSave, String foldername, String fileName, String module) {
        File direct = new File(Environment.getExternalStorageDirectory() + "/ITS/Images/" + module);

        if (!direct.exists()) {
            File wallpaperDirectory = new File("/sdcard/ITS/Images/" + module);
            wallpaperDirectory.mkdirs();
        }

        File fileInFolder = new File(direct + "/" + foldername);
        if (!fileInFolder.exists()) {
            fileInFolder.mkdirs();
        }

        File file = new File(new File("/sdcard/ITS/Images/" + module + "/" + foldername), fileName);
        try {
            FileOutputStream out = new FileOutputStream(file);
            imageToSave.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
    }

//    public void deleteImage(ImageTransaction imageTransaction) {
//
//        try {
//            if (!imageTransaction.getPhoto_Name().isEmpty()) {
//                File file = new File("/sdcard/ITS/Images/" + imageTransaction.getTrans_Type() + "/" + imageTransaction.getTrans_Name() + "/" + imageTransaction.getPhoto_Name());
//                if (file.exists()) {
//                    file.delete();
//                }
//            }
//
//            if (!imageTransaction.getSignature_Name().isEmpty()) {
//                File fileSign = new File("/sdcard/ITS/Images/" + imageTransaction.getTrans_Type() + "/" + imageTransaction.getTrans_Name() + "/" + imageTransaction.getSignature_Name());
//                if (fileSign.exists()) {
//                    fileSign.delete();
//                }
//            }
//
//            File folderFile = new File("/sdcard/ITS/Images/" + imageTransaction.getTrans_Type() + "/" + imageTransaction.getTrans_Name() + "/");
//            File[] list = folderFile.listFiles();
//            if (list.length == 0) {
//                folderFile.delete();
//            }
//        } catch (Exception e) {
//            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
//            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
//        }
//
//    }

    public void deleteAssetImage(String imageName) {

        try {
            if (!imageName.isEmpty()) {
                File file = new File("/sdcard/ITS/Images/" + F_REGISTRATION + "/" + imageName);
                if (file.exists()) {
                    file.delete();
                }
            }

        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }

    }

//    public boolean isAppPermOnline() {
//        try {
//            if (mServerConnStatus == MODE_ONLINE && Integer.parseInt(ITSApp.appPreferences.getAppMode()) == MODE_ONLINE)
//                return true;
//        } catch (Exception e) {
//            writeErrorLogFile(EXCEPTION + new Object() {
//            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
//        }
//
//        return false;
//    }

    //Once user clicked 'FULL OFFLINE', no data will be upload ONLINE.
//    public boolean isAppPermOffline() {
//        try {
//            DatabaseHelper databaseHelper = new DatabaseHelper(mContext);
////            if ((mServerConnStatus == MODE_ONLINE && ITSApp.appPreferences.getAPI().get_appmode() == MODE_OFFLINE) ||
////                    (mServerConnStatus == MODE_OFFLINE && ITSApp.appPreferences.getAPI().get_appmode() == MODE_OFFLINE)){
////                if(databaseHelper.countTableSize(AssetLocation.Entry.TABLE_NAME) > 0)
////                    return true;
////            }
//
//            if (Integer.parseInt(ITSApp.appPreferences.getAppMode()) == MODE_OFFLINE) {
//                if (databaseHelper.countTableSize(AssetLocation.Entry.TABLE_NAME) > 0)
//                    return true;
//            }
//
//        } catch (Exception e) {
//            writeErrorLogFile(EXCEPTION + new Object() {
//            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
//        }
//
//        return false;
//    }

    //Edited on 20181127 by Janice
    public boolean copyLocalDbtoITSFolder(String packageName) {

        boolean isSuccess = false;

        try {
            String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH;

            File sd = new File(rootPath);
            File data = Environment.getDataDirectory();

            if (sd.canWrite()) {
                String currentDBPath = "//data//" + packageName + "//databases//" + ITSApp.appPreferences.getAPI().get_databasename() + "";
                File currentDB = new File(data, currentDBPath);

                //change offline file name to NBS_data_20181127.db
                int getStrCount = ITSApp.appPreferences.getAPI().get_databasename().length();
                StringBuilder stringBuilder = new StringBuilder(ITSApp.appPreferences.getAPI().get_databasename());
                //remove database file start with name "NBS_data"
                File backupDB = new File(sd, stringBuilder.toString());

                if (currentDB.exists()) {

                    if (backupDB.exists()) {
                        backupDB.delete();
                    }

                    FileChannel src = new FileInputStream(currentDB).getChannel();
                    FileChannel dst = new FileOutputStream(backupDB).getChannel();
                    dst.transferFrom(src, 0, src.size());

                    src.close();
                    dst.close();
                    isSuccess = true;
                }
            }
        } catch (Exception e) {
            writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
        return isSuccess;
    }

    public void checkLocalData() {

//        if (Utils.getInstance().isAppPermOnline()) {
//            DatabaseHelper databaseHelper = new DatabaseHelper(mContext);
//
//
//            if (databaseHelper.countTableSize(Asset.Entry.TABLE_NAME) == 0) {
//                databaseHelper.clearAllData();
//            } else {
//                if (databaseHelper.getRowCount(databaseHelper.getNewAssetCount) == 0 &&
//                        databaseHelper.getRowCount(databaseHelper.getUpdateAssetCount) == 0 &&
//                        databaseHelper.getRowCount(databaseHelper.getPackingCount) == 0) {
//                    databaseHelper.clearAllData();
//                } else {
//                    ITSDialog.getInstance().uploadOfflineDataDialog();
//                }
//            }
//        }
    }

    public void setStatusBarColor(Activity activity, View view) {

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
//            if (isAppPermOnline()) {
//                activity.getWindow().setStatusBarColor(ContextCompat.getColor(activity, R.color.colorPrimary));
//                view.setBackgroundColor(ContextCompat.getColor(activity, R.color.colorPrimary));
//            } else {
//                view.setBackgroundColor(ContextCompat.getColor(activity, R.color.colorOffline));
//                activity.getWindow().setStatusBarColor(ContextCompat.getColor(activity, R.color.colorOffline));
//            }
//        }
    }

    public InventoryListItem createInventoryItem(String epcID) {

        InventoryListItem inventoryListItem = new InventoryListItem(STR_EMPTY, 0, STR_EMPTY, STR_EMPTY, STR_EMPTY, STR_EMPTY, STR_EMPTY, STR_EMPTY);
        try {
            inventoryListItem.setText(epcID);
        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
        return inventoryListItem;
    }

    public void deleteLogList() {
        try {
            int logFileLimit = 0;
            logFileLimit = Integer.valueOf(ITSApp.appPreferences.getAPI().get_logfilelimit());

            String pathEvent = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH + EVENT_FILE;
            File directoryEvent = new File(pathEvent);
            File[] fileEvent = directoryEvent.listFiles();

            // Sort files by name
            Arrays.sort(fileEvent, new Comparator() {
                @Override
                public int compare(Object f1, Object f2) {
                    return ((File) f2).getName().compareTo(((File) f1).getName());
                }
            });

            int countDelete = 0;
            if (fileEvent.length > logFileLimit) {

                for (int i = 0; i < fileEvent.length; i++) {
                    if (countDelete == logFileLimit) {
                        fileEvent[i].delete();
                        writeEventLogFile("Delete " + fileEvent[i].getName());
                    }
                    countDelete++;
                }
            }

            String pathError = Environment.getExternalStorageDirectory().getAbsolutePath() + FILE_PATH + ERROR_FILE;
            File directoryError = new File(pathError);
            File[] fileError = directoryError.listFiles();

            // Sort files by name
            Arrays.sort(fileError, new Comparator() {
                @Override
                public int compare(Object f1, Object f2) {
                    return ((File) f2).getName().compareTo(((File) f1).getName());
                }
            });

            int countDeleteError = 0;
            if (fileError.length > logFileLimit) {

                for (int i = 0; i < fileError.length; i++) {
                    if (countDeleteError == logFileLimit) {
                        fileError[i].delete();
                        writeEventLogFile("Delete " + fileError[i].getName());
                    }
                    countDeleteError++;
                }
            }

        } catch (Exception e) {
            Utils.getInstance().writeErrorLogFile(EXCEPTION + new Object() {
            }.getClass().getEnclosingMethod().getName() + DASH + e.getMessage());
        }
    }

    public String setupEPCID(String string) {
        try {

            String asterisk = "***";

            if (string.length() > 6) {
                string = string.substring(string.length() - 6);
                string = asterisk + string;
            } else if (string.length() == 0) {
                string = DASH;
            }

        } catch (Exception e) {
            e.getMessage();
        }
        return string;
    }

    public String setupAssetNo(String assetNo, String type) {
        try {

            switch (type) {
                case IS_INDIVIDUAL:
//                    assetNo = mContext.getString(R.string.lbl_single_) + assetNo;
                    break;

                case IS_NOT_INDIVIDUAL:
//                    assetNo = mContext.getString(R.string.lbl_multiple_) + assetNo;
                    break;

                case IS_CONTAINER:
//                    assetNo = mContext.getString(R.string.lbl_container_) + assetNo;
                    break;
            }

        } catch (Exception e) {
            e.getMessage();
        }
        return assetNo;
    }

    public static String key = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    //public static byte[] key_Array = Base64.getDecoder().decode(key);
    public static byte[] key_Array;

    public static String encrypt(String strToEncrypt) {
        try {
            //Cipher _Cipher = Cipher.getInstance("AES");
            //Cipher _Cipher = Cipher.getInstance("AES/ECB/PKCS5PADDING");
            Cipher _Cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");

            // Initialization vector.
            // It could be any value or generated using a random number generator.
            byte[] iv = {1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 7, 7, 7, 7};
            IvParameterSpec ivspec = new IvParameterSpec(iv);

            if (Build.VERSION.SDK_INT >= 26) {
                key_Array = Base64.getDecoder().decode(key);
            } else {
                key_Array = android.util.Base64.decode(key, 0);
            }

            key_Array = Arrays.copyOf(key_Array, 32);

            Key SecretKey = new SecretKeySpec(key_Array, "AES");
            _Cipher.init(Cipher.ENCRYPT_MODE, SecretKey, ivspec);

            if (Build.VERSION.SDK_INT >= 26) {
                return Base64.getEncoder().encodeToString(_Cipher.doFinal(strToEncrypt.getBytes()));
            } else {
                return android.util.Base64.encodeToString(_Cipher.doFinal(strToEncrypt.getBytes()), 0);
            }

        } catch (Exception e) {
            System.out.println("[Exception]:" + e.getMessage());
        }
        return null;
    }

//    public org.kxml2.kdom.Element buildAuthHeader(String username, String password) {
//
////        String Uname = "";
////        try {
////            Uname = encrypt(username);
////        } catch (Exception e) {
////            e.printStackTrace();
////        }
////
////        String Upass = password;
////        try {
////            Upass = encrypt(password);
////        } catch (Exception e) {
////            e.printStackTrace();
////        }
//
//        org.kxml2.kdom.Element h = new org.kxml2.kdom.Element().createElement(ITSApp.appPreferences.getAPI().get_namespace(), AUTHSOAPHD);
//        org.kxml2.kdom.Element first = new org.kxml2.kdom.Element().createElement(ITSApp.appPreferences.getAPI().get_namespace(), CRYPTUSERNAME);
//        first.addChild(org.kxml2.kdom.Node.TEXT, username);
//        h.addChild(org.kxml2.kdom.Node.ELEMENT, first);
//
//        org.kxml2.kdom.Element second = new org.kxml2.kdom.Element().createElement(ITSApp.appPreferences.getAPI().get_namespace(), CRYPTPASSWORD);
//        second.addChild(org.kxml2.kdom.Node.TEXT, password);
//        h.addChild(org.kxml2.kdom.Node.ELEMENT, second);
//        return h;
//    }

    public boolean isScanButtonVisible() {
        String deviceModel = Build.MODEL;

        if (deviceModel.contains(MC33)) {
            return false;
        } else if (deviceModel.contains(RFD8500)) {
            return true;
        } else if (deviceModel.contains(ATS100)) {
            return true;
        } else if (Build.DEVICE.contains(CHAINWAY_C72E) || ITSApp.appPreferences.getAPI().get_readermodelname().contains(CHAINWAY_C72E)) {
            return false;
        } else if (Build.DEVICE.contains(CHAINWAY_C66) || ITSApp.appPreferences.getAPI().get_readermodelname().contains(CHAINWAY_C66)) {
            return false;
        } else if (Build.DEVICE.contains(CIPHERLAB) || ITSApp.appPreferences.getAPI().get_readermodelname().contains(CIPHERLAB)) {
            return false;
        } else {
            return true;
        }
    }

    public static boolean deleteDirectory(File path) {
        if (path.exists()) {
            File[] files = path.listFiles();
            if (files == null) {
                return true;
            }
            for (int i = 0; i < files.length; i++) {
                if (files[i].isDirectory()) {
                    deleteDirectory(files[i]);
                } else {
                    files[i].delete();
                }
            }
        }
        return (path.delete());
    }

    public Boolean isCameraValid() {
        int numCameras = Camera.getNumberOfCameras();
        if (numCameras > 0) {
            return true;
        } else {
            return false;
        }
    }
}
