package Utility;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;

import Classes.APIConfig;
import Classes.LoginAccount;


/**
 * Created by chiayc on 07/30/2018.
 */

public class AppPreferences implements AppConstants {

    private SharedPreferences mPrefs;
    private SharedPreferences.Editor mEdit;
    private String PREFNAME = "NBSPreferences";

    public String LOGOUTTIMER = "LogoutTimer";
    private String IS_CONTAINER = "IsContainer";
    private String IS_LOGIN = "is_login";
    private String IS_REMEMBER = "is_remember";
    private String IS_APP_FIRST_LOAD = "is_app_first_load";
    private String ENCRYPT_UNAME = "encrypted_username";
    private String ENCRYPT_PASSWORD = "encrypted_password";

    private String READERMODE = "ReaderMode";

    private String LOGINID = "LoginID";
    private String NAME = "Name";
    private String ID = "id";
    private String IP = "ip";
    private String PORT = "port";
    private String URL = "url";
    private String URLSVC = "urlsvc";
    private String NAMESPACE = "namespace";
    private String SOAP_ACTION = "soapAction";
    private String SOAP_ADDRESS = "soapAddress";
    private String EPCID = "epcid";
    private String SUPPID = "suppid";
    private String PLASTICBAGID = "plasticbagid";
    private String APPDIR = "appdirectory";
    private String DBNAME = "databasename";
    private String FULLURL = "fullurl";
    private String READERMODELNAME = "readermodelname";
    private String MODE = "mode";
    private String APPMODE = "APPMODE";
    private String IMGPATH = "IMGPATH";
    private String LANGUAGE = "LANGUAGE";
    private String EPCIDMODE = "EPCIDMODE";
    private String CIOAUTOFILLQTYMODE = "CIOAUTOFILLQTYMODE";
    private String STAUTOFILLQTYMODE = "STAUTOFILLQTYMODE";
    private String LOGFILELIMIT = "LOGFILELIMIT";
    private String STPREVBALVISIBLE = "STPREVBALVISIBLE";

    public AppPreferences(Context context) {
        mPrefs = context.getSharedPreferences(PREFNAME, Activity.MODE_PRIVATE);
        mEdit = mPrefs.edit();
    }

    /* To remember default API*/
    public void setAPI(APIConfig apiConfig) {
        mEdit.putInt(ID, apiConfig.get_id());
        mEdit.putString(IP, apiConfig.get_ip());
        mEdit.putString(PORT, apiConfig.get_port());
        mEdit.putString(URL, apiConfig.get_url());
        mEdit.putString(URLSVC, apiConfig.get_urlsvc());
        mEdit.putString(NAMESPACE, apiConfig.get_namespace());
        mEdit.putString(SOAP_ACTION, apiConfig.get_soap_action());
        mEdit.putString(SOAP_ADDRESS, apiConfig.get_soap_address());
        mEdit.putString(EPCID, apiConfig.get_epcid());
        mEdit.putString(SUPPID, apiConfig.get_suppid());
        mEdit.putString(PLASTICBAGID, apiConfig.get_plasticbagid());
        mEdit.putString(APPDIR, apiConfig.get_appdirectory());
        mEdit.putString(DBNAME, apiConfig.get_databasename());
        mEdit.putString(FULLURL, apiConfig.get_url());
        mEdit.putString(READERMODELNAME, apiConfig.get_readermodelname());
        mEdit.putString(MODE, apiConfig.get_mode());
        mEdit.putString(APPMODE, String.valueOf(apiConfig.get_appmode()));
        mEdit.putString(IMGPATH, apiConfig.get_imgpath());
        mEdit.putString(LANGUAGE, apiConfig.get_language());
        mEdit.putString(EPCIDMODE, apiConfig.get_epcidmode());
        mEdit.putString(CIOAUTOFILLQTYMODE, apiConfig.get_cioautofillqtymode());
        mEdit.putString(STAUTOFILLQTYMODE, apiConfig.get_stautofillqtymode());
        mEdit.putString(LOGFILELIMIT, apiConfig.get_logfilelimit());
        mEdit.putString(STPREVBALVISIBLE, apiConfig.get_stprevbal_visible());
        mEdit.commit();
    }

    public APIConfig getAPI() {
        int id = (mPrefs.getInt(ID, 0));
        String ip = (mPrefs.getString(IP, ""));
        String port = (mPrefs.getString(PORT, ""));
        String url = (mPrefs.getString(URL, ""));
        String urlsvc = (mPrefs.getString(URLSVC, ""));
        String namespace = (mPrefs.getString(NAMESPACE, ""));
        String soapAction = (mPrefs.getString(SOAP_ACTION, ""));
        String soapAddress = (mPrefs.getString(SOAP_ADDRESS, ""));
        String epcid = (mPrefs.getString(EPCID, ""));
        String suppid = (mPrefs.getString(SUPPID, ""));
        String plasticbagid = (mPrefs.getString(PLASTICBAGID, ""));
        String appdirectory = (mPrefs.getString(APPDIR, ""));
        String databasename = (mPrefs.getString(DBNAME, ""));
        String fullUrl = (mPrefs.getString(FULLURL, ""));
        String readermodelname = (mPrefs.getString(READERMODELNAME, ""));
        String appmode = (mPrefs.getString(APPMODE, ""));
        String imgpath = (mPrefs.getString(IMGPATH, ""));
        String language = (mPrefs.getString(LANGUAGE, ""));
        String epcidmode = (mPrefs.getString(EPCIDMODE, ""));
        String cioautofillqtymode = (mPrefs.getString(CIOAUTOFILLQTYMODE, ""));
        String stautofillqtymode = (mPrefs.getString(STAUTOFILLQTYMODE, ""));
        String logfilelimit = (mPrefs.getString(LOGFILELIMIT, ""));
        String stprevbalvisible = (mPrefs.getString(STPREVBALVISIBLE, ""));

        if (appmode.isEmpty())
            appmode = "-1";

        int mMode = Integer.parseInt(appmode);

        return new APIConfig(id, ip, url, port, urlsvc, namespace, soapAction, soapAddress, epcid, suppid, plasticbagid,
                appdirectory, databasename, fullUrl, readermodelname, mMode, imgpath, language, epcidmode, cioautofillqtymode, stautofillqtymode,
                logfilelimit, stprevbalvisible);
    }

    public void setEncryptUInfo(String uname, String upass) {
        mEdit.putString(ENCRYPT_UNAME, uname);
        mEdit.putString(ENCRYPT_PASSWORD, upass);
        mEdit.commit();
    }

    public String getEncryptUname() {
        return mPrefs.getString(ENCRYPT_UNAME, "");
    }

    public String getEncryptUpass() {
        return mPrefs.getString(ENCRYPT_PASSWORD, "");
    }


    public void setIsLogin(boolean is_login) {
        mEdit.putBoolean(IS_LOGIN, is_login);
        mEdit.commit();
    }

    public void setLogoutTimer(int logoutTimer) {
        mEdit.putInt(LOGOUTTIMER, logoutTimer);
        mEdit.commit();
    }

    public int getLogoutTimer() {
        return mPrefs.getInt(LOGOUTTIMER, 0);
    }


    public void setIsContainer(boolean isContainer) {
        mEdit.putBoolean(IS_CONTAINER, isContainer);
        mEdit.commit();
    }

    public Boolean getIsContainer() {
        return mPrefs.getBoolean(IS_CONTAINER, false);
    }


    public void setUserCredentials(String loginID, String name) {
        mEdit.putString(LOGINID, loginID);
        mEdit.putString(NAME, name);
        mEdit.commit();
    }

    public String getUserID() {
        return mPrefs.getString(LOGINID, "");
    }


    public void setReaderMode(ReaderMode readerMode) {
        mEdit.putInt(READERMODE, readerMode.ordinal());
        mEdit.commit();
    }

    public int getReaderMode() {
        return mPrefs.getInt(READERMODE, 0);
    }

    public String getUserName() {
        return mPrefs.getString(NAME, "");
    }

    public void setAppMode(int appMode) {
        mEdit.putString(APPMODE, String.valueOf(appMode));
        mEdit.commit();
    }

    public String getAppMode() {
        return mPrefs.getString(APPMODE, "");
    }

    public void setUser(LoginAccount loginAccount) {
        if (loginAccount == null) {
            mEdit.remove(LOGINID);
            mEdit.remove(NAME);
            mEdit.commit();
        } else {
            mEdit.commit();
        }
    }

    public LoginAccount getUserInfo() {
        String _userid = mPrefs.getString(LOGINID, "");
        String _name = mPrefs.getString(NAME, "");
        return new LoginAccount(_userid, _name);
    }

    //region ADDITIONAL
    public void setIsAppFirstLoad(boolean is_app_first_load) {
        mEdit.putBoolean(IS_APP_FIRST_LOAD, is_app_first_load);
        mEdit.commit();
    }

    public boolean isApsFirstLoad() {
        return mPrefs.getBoolean(IS_APP_FIRST_LOAD, true);
    }

    public boolean getRememberMePref() {
        return mPrefs.getBoolean(IS_REMEMBER, false);
    }

    public boolean getIsLogin() {
        boolean is_login = false;
        is_login = mPrefs.getBoolean(IS_LOGIN, false);
        return is_login;
    }
    //endregion
}