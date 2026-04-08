export interface RegisterItem {
    "Description": string; // name of part 
    "Registration_Status": number; // 0 is registered, 1 is failed, 2 is registering, 3 is new
    "Print_Status": number; // 0 is printed, 1 is failed, 2 is printing
    "RFID_Number":string; // the 24 digit barcode string
}