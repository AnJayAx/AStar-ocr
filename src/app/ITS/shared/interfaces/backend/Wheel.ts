export interface Wheel {
  SerialNo_SAP: string;
  Wheel_ID: number;
  Aircraft: string;
  PartNo: string;
  SerialNo: string;
}

export interface CreateWheelBody {
  Customer: string
  Aircraft: string;
  PartNo: string;
  SerialNo: string;
}


export interface WheelFormat {
  ID: number;
  Aircraft: string;
  NoseMain: string;
  HighestAssyPN: string;
  SNFormat1: string;
  SNFormat2: string;
  SNDesc: string;
}

export interface Block {
  text: string;
  cornerPoints: CornersPoints | null;
}

export interface CornersPoints {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface Point {
  x: number;
  y: number;
}
