package Utility;

import com.simtech.its2.ITSApp;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

public interface AppConstants {

   //file
   int DATABASE_VERSION = 1;
   String FILE_PATH = "/ITS/";
   String STRDATABASE_NAME = "ITS_data.db";
   int PERMISSION_REQUEST = 112;
   long SERVICE_REPEAT_TIME = 1000 * 5;
   long SERVICE_SYNC_REPEAT_TIME = 1000 * 10;
   int SERVICE_SYNC_REPEAT_TIME2 = 1000 * 10;
   String BROADCAST_COUNT = "broadcastCount";

   //region READER COMMON VALUE
   int READER_MIN_POWER = 0;
   int READER_POWER_120 = 1;
   int READER_POWER_180 = 2;
   int READER_POWER_270 = 3;
   int READER_MAX_POWER = 4;
   //endregion

   //region ZEBRA reader
   int ZEBRA_MIN_POWER = 100;
   int ZEBRA_POWER_120 = 120;
   int ZEBRA_POWER_180 = 180;
   int ZEBRA_POWER_270 = 270;
   int ZEBRA_MAX_POWER = 300;
   //endregion

   //region CHAINWAY reader
   int CW_MIN_POWER = 5;
   int CW_POWER_120 = 12;
   int CW_POWER_180 = 18;
   int CW_POWER_270 = 27;
   int CW_MAX_POWER = 30;
   //endregion

   //region CILICO reader
   int CL_MIN_POWER = 1500;
   int CL_POWER_120 = 1700;
   int CL_POWER_180 = 1900;
   int CL_POWER_270 = 2100;
   int CL_MAX_POWER = 2600;
   //endregion

   enum ReaderMode {
       RFID,
       BARCODE_SCANNER,
       NFC
   }

   //region CONFIG
   int MEMORYTYPE_EPCID = 4;
   int MEMORYTYPE_NONE = 0;
   int BATCHLIMIT = 500;
   int OFFLINEASSETBATCHLIMIT = 600;
   int OFFLINESTBATCHLIMIT = 200;

   Double DECIMALVAL = 0.0;
   Double DECIMALVAL1 = 1.0;
   NumberFormat formatter = new DecimalFormat("#0.00");

   //Log
   String CONFIG_FILE = "Configuration";
   String CONFIG_XML = "config.xml";
   String EVENT_FILE = "Event";
   String EVENT_LOG = "event_log.txt";
   String ERROR_FILE = "Error";
   String ERROR_LOG = "error_log.txt";
   String METHOD = "Method: ";
   String SQLEXCEPTION = "SQLiteException: ";
   String EXCEPTION = "Exception: ";
   String IOEXCEPTION = "IOException: ";
   String SOCKETTIMEOUT_EXCEPTION = "SocketTimeoutException: ";
   String UNKNOWNHOST_EXCEPTION = "UnknownHostException: ";
   String XMLPULLPARSER_EXCEPTION = "XmlPullParserException: ";
   String HTTPRESPONSE_EXCEPTION = "HttpResponseException: ";
   String JSON_EXCEPTION = "JSONException: ";
   String SOAPFAULT = "SoapFault: ";
   String EVENT = "Event: ";

   int WS_TIMEOUT = 5000;
   int RESULT_EXCEPTION = 110;
   int SLEEP_READER = 100;
   int TIMEOUT = 1000;

   //filename
   String F_REGISTRATION = "Registration";
   String F_CHECKINOUT = "CheckInOut";
   String F_RELLOCATION = "Rellocation";
   String F_AUDIT = "Audit";
   String F_LOANRETURN = "LoanReturn";
   String F_SCRAP = "Scrap";
   String F_MRO = "MRO";
   String F_STOCKTAKE = "StockTake";
   String F_PICKINGLIST = "PickingList";
   String F_VERIFICATION = "Verification";
   String F_PACKINGLIST = "PackingList";


   //formlabel
   String fl_CATEGORY = "Category";
   String fl_ASSETNO = "Asset_No";
   String fl_DESCRIPTION = "Description";
   String fl_EPCID = "EPC_ID";
   String fl_DOP = "Date_of_Purchase";
   String fl_COST = "Cost";
   String fl_ALID = "Asset_Location_ID";
   String fl_PIC = "PIC";
   String fl_YDR = "Yearly_Depreciation";
   String fl_CV = "Current_Value";
   String fl_REFNO = "Ref_No";
   String fl_LASTBAL = "LastBal";
   String fl_DOE = "Date_of_Expire";
   String fl_SKU = "SKU";
   String fl_UOM = "UOM";
   String fl_BATCHNO = "BatchNo";
   String fl_REMAKRS = "Remarks";
   String fl_REMAKRS2 = "Remarks2";
   String fl_REMAKRS3 = "Remarks3";
   String fl_REMAKRS4 = "Remarks4";
   String fl_DESCRIPTION2 = "Description2";
   String fl_DESCRIPTION3 = "Description3";
   String fl_MINORCAT = "Minor_Category";
   String fl_VENDORNAME = "Vendor_Name";
   String fl_VENDORINV = "Vendor_Invoice";
   String fl_IMGNAME = "ImageName";

   //Web service header details
   String AUTHSOAPHD = "AuthSoapHd";
   String CRYPTUSERNAME = "CryptUsername";
   String CRYPTPASSWORD = "CryptPassword";
   String UNAME = ITSApp.appPreferences.getEncryptUname();
   String UPASS = ITSApp.appPreferences.getEncryptUpass();
   //endregion

   //config file
   String CONFIGURATION = "CONFIGURATION";
   String APP_DIRECTORY = "APP_DIRECTORY";
   String DATABASE_NAME = "DATABASE_NAME";
   String HTTP = "http://";
   String IP = "IP";
   String PORT = "PORT";
   String URLSVC = "URLSVC";
   String NAMESPACE = "NAMESPACE";
   String SOAP_ACTION = "SOAP_ACTION";
   String SOAP_ADDRESS = "SOAP_ADDRESS";
   String EPCIDSTARTWITH = "EPCIDSTARTWITH";
   String READERMODELNAME = "READERMODELNAME";
   String APPMODE = "APPMODE";
   String IMGPATH = "IMGPATH";
   String LANGUAGE = "LANGUAGE";
   String EPCIDMODE = "EPCIDMODE";
   String CIOAUTOFILLQTYMODE = "CIOAUTOFILLQTYMODE";
   String STAUTOFILLQTYMODE = "STAUTOFILLQTYMODE";
   String LOGFILELIMIT = "LOGFILELIMIT";
   String STPREVBALVISIBLE = "STPREVBALVISIBLE";

   //ITS Web Service field
   String SQL = "sql";
   String QUERYJSONVERSQL = "sql1";
   String USERNAME_F = "userName1";
   String PASSWORD_F = "password1";
   String TABLENAME = "tableName";
   String CATEGORYNAME = "categoryName";
   String EPCID = "epcid";
   String STARTKEYWORD = "startKeyWord";

   //ITS Web service without header
   String HHUSERAUTHENTICATION = "HHUserAuthentication";
   String ISCONNECTED = "IsConnected";

   //ITS Web Service with header
   String GETDOCNO = "GetDocNo";
   String ASSETNOCATEGORY = "AssetNoCategory";
   String ASSETAUDIT = "AssetAudit";
   String ASSETSCRAPMANYITEMS = "AssetScrapManyItems";
   String ADDNEWMRO = "AssetAddNewMRO";
   String ASSETUPDATEEPCID = "AssetUpdateEPCID";
   String ASSETCHANGELOCREMARKS = "AssetChangeLocRemarks";
   String ASSETPICKEDITEMNEW = "AssetPickedItemNew";
   String ASSETVERIFICATION = "AssetVerification";
   String OFFLINEDATAUPDATE_ASSETUPDATE = "OfflineDataUpdate_AssetUpdate";
   String OFFLINEDATAUPDATE_ASSETREGISTRATION = "OfflineDataUpdate_AssetRegistration";
   String FNC_OFFLINE_REGISTRATION = "fnc_OfflineRegistration";
   String FNC_OFFLINE_UPDATE = "fnc_OfflineUpdate";
   String ADDNEWLOCATION = "AddNewLocation";
   String QUERYJSONUSERMODULE = "QueryJsonUserModule";
   String HHQUERYJSONUSERCATEGORY = "HHQueryJsonUserCategory";
   String QUERYJSONLOCATION = "QueryJsonAssetLocation";
   String HHQUERYJSONASSETSTATUS = "HHQueryJsonAssetStatus";
   String HHQUERYJSONIMPORTDATAMAPPING = "HHQueryJsonImportDataMapping";
   String HHQUERYJSONCHECKEPCIDEXIST = "HHQueryJsonCheckEPCIDExist";
   String HHQUERYDATASETFLOWHISTORY = "HHQueryDataSetFlowHistory";
   String HHQUERYMROHISTORY = "HHQueryMROHistory";
   String HHQUERYAUDITHISTORY = "HHQueryAuditHistory";
   String HHQUERYJSONPICKEDITEM = "HHQueryJsonPickedItem";
   String HHQUERYJSONUPDATETAGID = "HHQueryJsonUpdateTagID";
   String HHQUERYJSONPICKINGLIST = "HHQueryJsonPickingList";
   String HHQUERYJSONPLTAGLIST = "HHQueryJsonPLTagList";
   String HHQUERYJSONPLTAGLOCATIONLIST = "HHQueryJsonPLTagLocationList";
   String HHQUERYJSONPLTOTALITEMLIST = "HHQueryJsonPLTotalItemList";
   String HHQUERYLOGINACCOUNTLIST = "HHQueryJsonLoginAccountList";
   String HHQUERYVERIFICATIONLIST = "HHQueryJsonVerificationList";
   String HHQUERYOFFLINEPICKEDITEM = "HHQueryJsonOfflinePickedItem";
   String HHGETSTHAPI = "HHGetSTHAPI";
   String HHOFFLINEGETSTHAPICATLOC = "HHOfflineGetSTHAPIByCategoryLocation";
   String HHGETSTHISTORYAPI = "HHGetStHistoryAPI";
   String HHGETSTHBYEPCIDSAPI = "HHGetSTHByEPCIDSAPI";
   String HHASSETCHECKINOUTMANY = "HHAssetCheckInOutMany";
   String HHASSETLOANRETURN = "HHAssetLoanReturn";
   String HHASSETUPDATE = "HHAssetUpdate";
   String HHASSETUPDATELIST = "HHAssetUpdateList";
   String HHUPLOADPHOTO = "HHUploadPhoto";
   String HHUPLOADIMAGETRANS = "HHUploadImageTrans";
   String HHGETASSTAPIByCategoryLocation = "HHGetAssetAPIByCategoryLocation";
   String HHCHECKMASTERDATA = "HHCheckMasterData";
   String HHGETPACKINGLIST = "HHGetPackingList";
   String HHGETOFFLINEPACKAGELIST = "HHGetOfflinePackageList";
   String HHGETOFFLINEPACKEDITEMLIST = "HHGetOfflinePackedItemAPI";
   String HHGETAPKLIST = "HHGetAPKList";

   //Packing
   String HHGETPICKEDPLLISTAPI = "HHGetPickedPLListAPI";
   String HHGETPACKEDPLITEMAPI = "HHGetPackedPLItemAPI";
   String HHGETPACKAGEMASTERAPI = "HHGetPackageMasterAPI";
   String ASSETPACKEDITEM = "AssetPackedItem";
   String HHGETCONTAINERWITHITEMAPI = "HHGetContainerWithItemAPI";
   String HHSTAPI = "HHSTAPI";
   String HHMULTIPLEASSETREGISTRYAPI = "HHMultipleAssetRegistry";
   String HHGETITSSETTING = "HHGetITSSetting";
   String INVISIBLECOLUMNS = "Invisible_columns";
   String HHGETCATEGORYLIST = "HHGetCategoryList";
   String OFFLINEGETCATEGORYLIST = "OfflineGetUserCategoryList";

   //Container
   String HHGETCONTAINER = "HHGetContainer";
   String HHCHECKCONTAINERTAG = "HHCheckContainerTag";
   String HHGETCONTAINERCHECKLIST = "HHGetContainerChecklist";
   String HHGETCONTAINERITEMLIST = "HHGetContainerItemList";

   //Container in Asset Table
   String HHVERIFYCONTAINER = "HHVerifyContainer";
   String HHGETACONTAINER = "HHGetAContainer";
   String HHGETASSETLIST = "HHGetAssetList";
   String HHUPDATEASSETINCONTAINER = "HHUpdateAssetInContainer";
   String HHUPDATEASSETCONTAINERLOCATION = "HHUpdateAssetContainerLocation";
   String HHSUBMITOUTBOUND = "HHSubmitOutbound";
   String HHGETDRAFTSTHAPI = "HHGetDraftSTHAPI";
   String HHCONTAINERMULTIPLECHECKOUT = "HHContainerMultipleCheckout";

   String HHSPLITAPI = "HHSplit";
   String HHGETPLONOLIST = "HHGetPLOrderNoList";
   String HHGETUPDATEAPK = "HHGetUpdateAPK";

   String HHGETRONOLIST = "HHGetROrderNoList";
   String HHCHECKORDERNO = "HHCheckOrderNo";
   String HHRECEIVINGSUBMISSION = "HHReceivingSubmission";

   String HHGETATTACHMENTLIST = "HHGetAttachmentList";
   String HHOPENDOCUMENT = "HHOpenDocument";

   String HHGETDESCRIPTIONBYUID = "HHGetDescriptionByUID";
   String HHGETSKUBYUID = "HHGetSKUByUID";
   String HHGETSBBYSKU = "HHGetStockBalanceBySku";
   String HHGETSBBYLOC = "HHGetStockBalanceByLocation";
   String HHGETSBASSETLISTBYSKU = "HHGetSBAssetListBySku";
   String HHGETSBCASSETLISTBYSKU = "HHGetSBCAssetListBySku";
   String HHGETSBASSETLISTBYLOC = "HHGetSBAssetListByLoc";
   String HHGETSBCASSETLISTBYLOC = "HHGetSBContainerAssetListByLoc";


   //COLUMNS NAMING
   String IDF_DOP = "Date of Purchase";
   String IDF_DOE = "Date of Expire";
   String IDF_COST = "Cost";
   String IDF_RNO = "Ref No";
   String IDF_SKU = "SKU";
   String IDF_BNO = "Batch No";
   String IDF_UOM = "UOM";
   String IDF_PIC = "PIC";
   String IDF_REMARKS = "Remarks";
   String IDF_REMARKS2 = "Remarks2";
   String IDF_REMARKS3 = "Remarks3";
   String IDF_REMARKS4 = "Remarks4";
   String IDF_REMARKS5 = "Remarks5";
   String IDF_REMARKS6 = "Remarks6";
   String IDF_ASTATUS = "Asset Status";
   String IDF_YDR = "Yearly Depreciation(%)";
   String IDF_CV = "Current Value";

   //ITSSetting
   String ITS_CHIO = "AutoScraponCheckOut";
   String ITS_PL = "AutoScraponPickingList";
   String ITS_FIFOTYPE = "FIFOType";
   String ITS_PLNO = "PLOrderNo";
   String ITS_FIFO = "FIFO";
   String AUTOUPDATEAPK = "AutoUpdateAPK";
   String ITS_RECEIVINGORDERNO = "ReceivingOrderNo";
   String ITS_ISCONTAINER = "IsContainer";
   String ITS_LOGOUTTIMER = "LogoutTimer";

   //Reader
   int MODE_ONLINE = 0;
   int MODE_OFFLINE = 1;

   enum Menu_Type {
       MENU_ITEM_REGISTRATION,
       MENU_ITEM_CHECKINOUT,
       MENU_ITEM_RELOCATION,
       MENU_ITEM_AUDIT,
       MENU_ITEM_MRO,
       MENU_LOANRETURN,
       MENU_ST,
       MENU_ITEM_LOCATING,
       MENU_ITEM_PICKING_LIST,
       MENU_ITEM_VERIFICATION,
       MENU_ITEM_CHECK_STATUS,
       MENU_ITEM_SCRAP,
       MENU_IP_SETTING,
       MENU_UPLOAD_OFFLINE_DATA,
       MENU_UPDATE_TAGID,
       MENU_DOWNLOAD_DB
   }

   int CILICO_MINRANGEGRAPH = 80;
   int MINRANGEGRAPH = 130;
   int MAXRANGEGRAPH = 100;

   String XML_DATA_ASSET = "xmlDataAsset";
   String XML_DATA_ASSET_FH = "xmlDataAssetFlowHistry";
   String XML_DATA_ASSET_MRO = "xmlDataAssetMROHistry";
   String XML_DATA_ASSET_AUDIT = "xmlDataAssetAuditHistry";
   String XML_DATA_ASSET_ST = "xmlDataStockTakingHistry";
   String XML_DATA_ASSET_PI = "xmlDatapickedItem";
   String XML_DATA_ASSET_VERIFICATION = "xmlDataVerification";


   //Menu Naming
   String READER = "Reader List";
   String REGISTRATION = "Item Registration";
   String REGISTRATION_CN = "新建";
   String IR_M = "Item Registration(M)";
   String IR_S = "Item Registration(S)";
   String ITEMCHKIO = "Check In/Out";
   String CHKIO = "Check In/Out";
   String CHKIO_CN = "入库/出库";
   String CHKIO_QTY = "Item Check In/Out by Qty";
   String CHKIO_TAG = "Item Check In/Out by Tag";
   String RELOCATION = "Relocation";
   String RELOCATION_CN = "转库";
   String AUDIT = "Audit";
   String AUDIT_CN = "审计";
   String MRO = "MRO";
   String MRO_CN = "维修";
   String LOANRETURN = "LoanReturn";
   String LOANRETURN_CN = "借出/归还";
   String ST = "Item Stock Taking";
   String IST = "Stock Taking";
   String ST_CN = "盘点";
   String TAB = "Tab";
   String ST_LOC = "Stock Taking by Location";
   String ST_QTY = "Stock Taking by Qty";
   String LOCATING = "Locating";
   String LOCATING_CN = "定位";
   String PICKING = "Picking List";
   String PICKING_CN = "拣货";
   String PACKING = "Packing List";
   String PACKING_CN = "包装";
   String VERIFICATION = "Verification";
   String VERIFICATION_CN = "验货";
   String CHECKSTATUS = "Check Status";
   String CHECKSTATUS_CN = "查询";
   String SCRAP = "Scrap";
   String SCRAP_CN = "报废";
   String IP_SETTING = "IP Setting";
   String IP_SETTING_CN = "IP 设置";
   String UPLOAD_OFFLINE_DATA = "Upload Offline Data";
   String UPLOAD_OFFLINE_DATA_CN = "上传离线数据";
   String UPDATE_TAGID = "Update with TagID";
   String UPDATE_TAGID_CN = "更新标签";
   String DOWNLOAD_DB = "Download Database";
   String DOWNLOAD_DB_CN = "下载离线数据";
   String MULTIPLE_R = "Registration";
   String MULTIPLE_R_CN = "新建";
   String MULTIPLE_U = "Update";
   String MULTIPLE_U_CN = "更新";
   String PITO = "Put In/Take Out";
   String PITO_CN = "放入/取出";
   String CCICO = "Container Relocation";
   String CCICO_CN = "箱子转库";
   String CST = "Container Stock Taking";
   String CST_CN = "箱子盘点";
   String CMULTIPLECO = "Container Item Check In/Out";
   String CMULTIPLECO_CN = "箱子物品入库/出库";
   String TAGENCODING = "Tag Encoding";
   String TAGENCODING_CN = "标签读写";

   String SPLIT = "Split";
   String SPLIT_CN = "拆分";

   String RECEIVING = "Receiving";
   String RECEIVING_CN = "签收";

   String CHECKBALANCE = "Check Stock";
   String CHECKBALANCE_CN = "查看余额";

   enum Pattern_Type {
       Single,
       Multiple
   }

   enum Checkinout_Type {
       Qty,
       Tag
   }

   enum StockTaking_Status {
       Found,
       Total,
       Misplaced
   }

   enum DataMgr_Type {
       Upload,
       Download
   }

   String CONNECTION_TIMED_OUT = "Connection Timed Out";

   SimpleDateFormat DISPLAY_FORMAT = new SimpleDateFormat("dd-MMM-yyyy", Locale.ENGLISH); //13 Jun 18
   SimpleDateFormat DOP_FORMAT = new SimpleDateFormat("dd MMM yyyy HH:mm:ss", Locale.ENGLISH);
   SimpleDateFormat STANDARD_FORMAT = new SimpleDateFormat("dd-MMM-yyyy HH:mm:ss", Locale.ENGLISH);
   SimpleDateFormat DATETIMENOW_FORMAT = new SimpleDateFormat("yyyyMMddHHmmss", Locale.ENGLISH);

   //data passing variable
   int R_CATEGORY = 111;
   int R_LOCATION = 112;
   int R_ASSET = 113;
   int R_PIC = 114;
   int R_STSTATUS = 115;
   int PL_MULTIPLE = 116;
   int STA_MISPLACED = 117;
   int BARCODELIST = 118;
   int ST_CATEGORY = 119;
   int ST_LOCATION = 120;
   int ST_PIC = 121;
   int TAKEPHOTO = 122;
   int GALLERYPHOTO = 124;
   int DOWNLOADDATA = 123;
   int UPLOADDATA = 125;
   int SETTING = 126;
   int ST_MULTILOCATION = 127;
   int R_CONTAINER = 128;
   int R_CONTAINERDETAILS = 129;
   int ST_REF_NO = 130;
   int VIEW_DATA = 131;
   int CST_TAB = 132;
   int C_BIN = 133;
   int CHECKITEMSTATUS = 134;
   int RECEIVING_INTENT = 135;
   int SB_SKU = 136;
   int SB_LOC = 137;

   String USER_CATEGORY = "UserCategory";
   String LOCATION = "Location";
   String CHECKLIST = "Checklist";
   String PICKINGLIST = "PL";
   String TOTALBALANCE = "TotalBalance";
   String PACKAGEMASTER = "PackageMaster";
   String RESULTFROMWS_SUCCESS = "Success";
   String RESULT_EXIST = "EXIST(";
   String ISNORMALPICKING = "isNormalPicking";
   String DELETELIST = "DeleteList";

   //Zebra Model
   String RFD8500 = "RFD8500";
   String MC33 = "MC33";
   String TC25 = "TC25";
   String TC26 = "TC26";
   String TC21 = "TC21";
   String ATS100 = "ATS100";

   //region ATS100 reader
   int ATS_MIN_POWER = 110;
   int ATS_POWER_120 = 160;
   int ATS_POWER_180 = 210;
   int ATS_POWER_270 = 260;
   int ATS_MAX_POWER = 300;
   //endregion

   //Other Model
   String CHAINWAY_C72E = "c72e";
   String CHAINWAY_C66= "C66";
   String CIPHERLAB = "RK25WO";
   String CILICO_AHT = "Android Handheld Terminal";

   int UPLOAD_NULL = -1;
   int UPLOAD_SUCCESS = 0;
   int UPLOAD_FAILED = 1;

   String S = "S";
   String M = "M";

   String IS_NOT_INDIVIDUAL = "0";
   String IS_INDIVIDUAL = "1";
   String IS_CONTAINER = "2";
   String IS_ASSET = "3";
   String IS_NOT_NULL = "IS NOT NULL";
   String IN = "In";
   String OUT = "Out";
   String FALSE = "False";

   String PUTIN = "0";
   String TAKEOUT = "1";

   int TAB_FLOW_HISTORY = 0;
   int TAB_MRO_HISTORY = 1;
   int TAB_AUDIT_HISTORY = 2;
   int TAB_ST_HISTORY = 3;


   int TAB_ST_PENDING = 0;
   int TAB_ST_FOUND = 1;
   int TAB_ST_MISPLACED = 2;
   int TAB_ST_EXCESS = 3;
   int TAB_ST_NO_ACCESS = 4;
   int TAB_ST_NOTREGISTERED = 5;

   int TAB_CST_PENDING = 0;
   int TAB_CST_FOUND = 1;
   int TAB_CST_EXCESS = 2;
   int TAB_CST_NOTREGISTERED = 3;
   //int TAB_CST_MISSING = 4;

   int TAB_R_PENDING = 0;
   int TAB_R_FOUND = 1;
   int TAB_R_EXCESS = 2;

   String PENDING = "Pending";
   String FOUND = "Found";
   String MISPLACED = "Misplaced";
   String NOTREGISTERED = "Not Registered";
   String MISSING = "Missing";


   String STCATEGORYLIST = "StCategoryList";
   String STLOCATIONLIST = "StLocationList";
   String STMULTILOCATIONLIST = "StMultiLocationList";
   String STPICLIST = "StPICList";
   String STREFNOLIST = "StRefNoList";
   String STMISPLACEDLIST = "StMisplacedList";
   String ALID = "AssetLocationID";
   String ALIDLIST = "AssetLocationList";
   String PHOTOPATH = "PhotoPath";
   String CBINLIST = "CBinList";

   String ST_TAB = "ST Tab";
   String ST_FOUND = "Found";
   String ST_PENDING = "Pending";
   String ST_MISPLACED = "Misplaced";
   String ST_EXCESS = "Excess";
   String ST_NO_ACCESS = "Not Valid";
   String ST_COMPLETED = "Completed";
   String ST_NOTREGISTERED = "Not Registered";
   String ST_MMODE = "MisplacedMode";

   String RECEIVING_TAB = "Receiving Tab";
   String CONFIRM = "Confirm";

   String DASH = "-";

   int VIEW_ONLY = 0;
   int VIEW_EDIT = 1;

   int OFFLINE_REGISTRATION = 0;
   int OFFLINE_UPDATE = 1;

   String PL_STATUS_PICKED = "Picked";
   String PL_STATUS_NEW = "New";

   String STATUS_ALL = "All";
   String STATUS_AVAILABLE = "Available";
   String STATUS_NOTAVAILABLE = "NotAvailable";
   String STATUS_ONLOAN = "On Loan";
   String STATUS_RETURN = "Return";
   String STATUS_SCRAPPED = "Scrapped";
   String STATUS_INTRANSIT = "In-Transit";

   String STR_CMCO = "CCO";
   String STR_CMCI = "CCI";
   String STR_ASSET_STATUS_CI = "CI";
   String STR_ASSET_STATUS_CO = "CO";
   String STR_ASSET_STATUS_RE = "RE";
   String STR_ASSET_STATUS_LO = "LO";
   String STR_CHECKIN = "Check In Offline :";
   String STR_CHECKOUT = "Check Out Offline:";
   String STR_LOAN = "Loan :";
   String STR_RETURN = "Return :";
   String STR_OFFLINE = " Offline";

   String STR_EMPTY = "";
   String NULL = "NULL";
   int DEFAULT_VALUE = 0;
   int DEFAULT_MINUS_VALUE = -1;

   int IS_SELECTED = 0;
   int IS_NOT_SELECTED = 1;

   String PHOTO_FORMAT = "P_";
   String SIGNATURE_FORMAT = "S_";
   String JPEGFORMAT = ".jpg";
   String LANG_EN = "English";
   String LANG_CNN = "Chinese";
   String LANG_CN = "华语";

   String INTENT_PATTERNTYPE = "Pattern_Type";
   String INTENT_BARCODELIST = "BARCODE_LIST";
   String INTENT_ERRORLIST = "Error List";

   String ITEM_CATEGORY = "Item Category";
   String ITEM_LOCATION = "Item Location";
   String ASSET_REGISTRATION = "Asset Registration";
   String ASSET_HISTORY = "Asset History";
   String ASSET_UPDATE = "Asset Update";
   String PACKING_LIST = "Packing List";
   String PICKING_LIST = "Picking List";
   String STOCK_TAKING = "Stock Taking";

   String BOOLEAN_TRUE = "True";
   String BOOLEAN_FALSE = "False";
}
