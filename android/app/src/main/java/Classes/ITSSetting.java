package Classes;

import android.provider.BaseColumns;

public class ITSSetting {

    private String ITSKey;
    private String ITSValue;
    private String Description;

    public ITSSetting() {
    }

    public ITSSetting(String ITSKey, String ITSValue, String description) {
        this.ITSKey = ITSKey;
        this.ITSValue = ITSValue;
        this.Description = description;
    }

    public String getITSKey() {
        return ITSKey;
    }

    public void setITSKey(String ITSKey) {
        this.ITSKey = ITSKey;
    }

    public String getITSValue() {
        return ITSValue;
    }

    public void setITSValue(String ITSValue) {
        this.ITSValue = ITSValue;
    }

    public String getDescription() {
        return Description;
    }

    public void setDescription(String description) {
        Description = description;
    }

    public static abstract class Entry implements BaseColumns {
        public static final String TABLE_NAME = "ITSSetting";
        public static final String COLUMN_NAME_ID = "_ID";
        public static final String COLUMN_NAME_ITSKEY = "ITSKey";
        public static final String COLUMN_NAME_ITSVALUE = "ITSValue";
        public static final String COLUMN_NAME_DESC = "Description";
    }
}
