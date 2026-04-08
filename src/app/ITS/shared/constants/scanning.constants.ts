/* -1: init state, start scan: 1, stop scan: 0 */
export enum StartScanBtnStatus {
    Init = -1,
    Start = 1, 
    Stop = 0
};

/* 0 -- not yet scanned, 1 -- scanning in progress, 2 -- scan stopped */
export enum RFIDReaderStatus {
    Init = 0,
    InProgress = 1,
    Stopped = 2
};

/* For RFID scanning only */
export enum ZebraPowerLevels {
  MIN_POWER = "100",
  POWER_120 = "120",
  POWER_180 = "180",
  POWER_270 = "270",
  MAX_POWER = "300",
}