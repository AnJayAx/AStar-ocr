export interface ICompany {
    "creator": string;
    "edit_By": string;
    "creation_Time": string;
    "edit_Time": string;
    "company_Name": string;
    "company_Account": string;
    "userlogin_id": string;
    "profileImgUrl": string;
    "device_Token": string;
    "udid": string;
    "platformID": number;
    "keepLoginSessionHour": number;
    "chopImageUrl": string;
    "tokenId": string;
    "company_Type_ID": number;
    "token_Creation_Time": string;
    "company_ID": number;
    "addressList": [
      {
        "address_ID": number;
        "company_ID": number;
        "creator": string;
        "creation_Time": string;
        "edit_By": string;
        "edit_Time": string;
        "country": string;
        "company_Address": string;
        "postcode": string;
        "latitude": number;
        "longitude": number;
        "contactPersonName": string;
        "contactPersonHP": string;
        "email_ID": string;
        "isDepot": true,
        "direction": string;
        "zone_ID": string;
      }
    ],
    "company_Type_Name": string;
  }