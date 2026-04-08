package Classes;

/**
 * Created by chiayc on 09/03/2018.
 */

public class APIConfig {

    private int _id;
    private String _ip;
    private String _url;
    private String _port;
    private String _urlsvc;
    private String _namespace;
    private String _soap_action;
    private String _soap_address;
    private String _epcid;
    private String _suppid;
    private String _plasticbagid;
    private String _appdirectory;
    private String _databasename;
    private String _fullurl;
    private String _readermodelname;
    private String _mode;
    private int _appmode = -1;
    private String _imgpath;
    private String _language;
    private String _epcidmode;
    private String _cioautofillqtymode;
    private String _stautofillqtymode;
    private String _logfilelimit;
    private String _stprevbal_visible;


    public APIConfig() {
    }

    public APIConfig(int _id, String _ip, String _url, String _port, String _urlsvc, String _namespace, String _soap_action,
                     String _soap_address, String _epcid, String _suppid, String _plasticbagid, String _appdirectory,
                     String _databasename, String _fullurl, String _readermodelname, int _appmode, String _imgpath,
                     String _language, String _epcidmode, String _cioautofillqtymode, String _stautofillqtymode,
                     String _logfilelimit, String _stprevbal_visible) {
        this._id = _id;
        this._ip = _ip;
        this._url = _url;
        this._port = _port;
        this._urlsvc = _urlsvc;
        this._namespace = _namespace;
        this._soap_action = _soap_action;
        this._soap_address = _soap_address;
        this._epcid = _epcid;
        this._suppid = _suppid;
        this._plasticbagid = _plasticbagid;
        this._appdirectory = _appdirectory;
        this._databasename = _databasename;
        this._fullurl = _fullurl;
        this._readermodelname = _readermodelname;
        this._appmode = _appmode;
        this._imgpath = _imgpath;
        this._language = _language;
        this._epcidmode = _epcidmode;
        this._cioautofillqtymode = _cioautofillqtymode;
        this._stautofillqtymode = _stautofillqtymode;
        this._logfilelimit = _logfilelimit;
        this._stprevbal_visible = _stprevbal_visible;
    }


    public int get_id() {
        return _id;
    }

    public void set_id(int _id) {
        this._id = _id;
    }

    public String get_ip() {
        return _ip;
    }

    public void set_ip(String _ip) {
        this._ip = _ip;
    }

    public String get_url() {
        return _url;
    }

    public void set_url(String _url) {
        this._url = _url;
    }

    public String get_port() {
        return _port;
    }

    public void set_port(String _port) {
        this._port = _port;
    }

    public String get_urlsvc() {
        return _urlsvc;
    }

    public void set_urlsvc(String _urlsvc) {
        this._urlsvc = _urlsvc;
    }

    public String get_namespace() {
        return _namespace;
    }

    public void set_namespace(String _namespace) {
        this._namespace = _namespace;
    }

    public String get_soap_action() {
        return _soap_action;
    }

    public void set_soap_action(String _soap_action) {
        this._soap_action = _soap_action;
    }

    public String get_soap_address() {
        return _soap_address;
    }

    public void set_soap_address(String _soap_address) {
        this._soap_address = _soap_address;
    }

    public String get_epcid() {
        return _epcid;
    }

    public void set_epcid(String _epcid) {
        this._epcid = _epcid;
    }

    public String get_suppid() {
        return _suppid;
    }

    public void set_suppid(String _suppid) {
        this._suppid = _suppid;
    }

    public String get_plasticbagid() {
        return _plasticbagid;
    }

    public void set_plasticbagid(String _plasticbagid) {
        this._plasticbagid = _plasticbagid;
    }

    public String get_appdirectory() {
        return _appdirectory;
    }

    public void set_appdirectory(String _appdirectory) {
        this._appdirectory = _appdirectory;
    }

    public String get_databasename() {
        return _databasename;
    }

    public void set_databasename(String _databasename) {
        this._databasename = _databasename;
    }

    public String get_fullurl() {
        return _fullurl;
    }

    public void set_fullurl(String _fullurl) {
        this._fullurl = _fullurl;
    }

    public String get_readermodelname() {
        return _readermodelname;
    }

    public void set_readermodelname(String _readermodelname) {
        this._readermodelname = _readermodelname;
    }

    public String get_mode() {
        return _mode;
    }

    public void set_mode(String _mode) {
        this._mode = _mode;
    }

    public int get_appmode() {
        return _appmode;
    }

    public void set_appmode(int _appmode) {
        this._appmode = _appmode;
    }

    public String get_imgpath() {
        return _imgpath;
    }

    public void set_imgpath(String _imgpath) {
        this._imgpath = _imgpath;
    }

    public String get_language() {
        return _language;
    }

    public void set_language(String _language) {
        this._language = _language;
    }

    public String get_epcidmode() {
        return _epcidmode;
    }

    public void set_epcidmode(String _epcidmode) {
        this._epcidmode = _epcidmode;
    }

    public String get_cioautofillqtymode() {
        return _cioautofillqtymode;
    }

    public void set_cioautofillqtymode(String _cioautofillqtymode) {
        this._cioautofillqtymode = _cioautofillqtymode;
    }

    public String get_stautofillqtymode() {
        return _stautofillqtymode;
    }

    public void set_stautofillqtymode(String _stautofillqtymode) {
        this._stautofillqtymode = _stautofillqtymode;
    }

    public String get_logfilelimit() {
        return _logfilelimit;
    }

    public void set_logfilelimit(String _logfilelimit) {
        this._logfilelimit = _logfilelimit;
    }


    public String get_stprevbal_visible() {
        return _stprevbal_visible;
    }

    public void set_stprevbal_visible(String _stprevbal_visible) {
        this._stprevbal_visible = _stprevbal_visible;
    }
}
