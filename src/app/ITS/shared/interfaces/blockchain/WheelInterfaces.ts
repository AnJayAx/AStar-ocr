interface WheelPart {
  Description: string;
  EPC_ID: string;
  Ref_No: string;
  BatchNo: string;
  Creator: string;
}

interface WheelPartBatchItem {
  wheelPart: WheelPart;
  index: number;
}

interface WheelPartRegistrationResult {
  index: number;
  isRegistered: boolean;
}

interface RFIDPrint {
  index: number;
  rfidVal: string;
}

interface RFIDPrintResult {
  EPC_ID: string;
  isSuccessful: boolean;
}



export {
  WheelPart,
  WheelPartBatchItem,
  WheelPartRegistrationResult,
  RFIDPrint,
  RFIDPrintResult
};
