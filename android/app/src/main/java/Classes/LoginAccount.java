package Classes;

import android.provider.BaseColumns;

public class LoginAccount {
    private String Users_ID;
    private String UserName;

    public LoginAccount() {
    }

    public LoginAccount(String users_ID, String userName) {
        this.Users_ID = users_ID;
        this.UserName = userName;
    }

    public String getUsers_ID() {
        return Users_ID;
    }

    public void setUsers_ID(String users_ID) {
        Users_ID = users_ID;
    }

    public String getUserName() {
        return UserName;
    }

    public void setUserName(String userName) {
        UserName = userName;
    }

    public static abstract class Entry implements BaseColumns {
        public static final String TABLE_NAME = "LoginAccount";
        public static final String COLUMN_NAME_ID = "_ID";
        public static final String COLUMN_NAME_USERSID = "Users_ID";
        public static final String COLUMN_NAME_USERNAME = "User_Name";
    }
}
