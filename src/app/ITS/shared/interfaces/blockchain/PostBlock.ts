export interface IPostBlock {
    "SupplyChainEntityType": string;
    "OperationType": string;
    "Company": string;
    "TransactionNo": string;
    "Destination": string;
    "Address": string;
    "PostCode": string;
    "Operator": string;
    "Operator2": string;
    "Vehicle": string;
    "Remarks": string;
    "Latitude": number;
    "Longitude": number;
    "Status": string;
    "Country": string;
    "SubmissionDate": string;
    "Items": IPostBlockItem[];
}

export interface IPostBlockItem {
    "ProductId": string;
    "EPCID": string;
    "AutoIDType": string;
    "ImageOfProduct": string;
    "Brand": string;
    "ProductName": string;
    "ProductDescription": string;
    "RefNo": string;
    "ProductCode": string;
    "BatchNo": string;
    "CountryOfOrigin": string;
    "Description": string;
    "Price": number;
    "Quantity": number;
    "Manufacturer": string;
    "RefurbishType": string;
    "ManufacturingDate": string;
    "DateOfExpire": string;
    "WarrantyExpiryDate": string;
    "CalibrationDate": string;
    "GS1BarCode": string;
    "Certification": string;
    "CO2Score": string;
    "Remarks": string;
    "Height": string;
    "Length": string;
    "Width": string;
    "Weight": string;
    "HeightUOM": string;
    "LengthUOM": string;
    "WidthUOM": string;
    "WeightUOM": string;
    "Status": string;
}