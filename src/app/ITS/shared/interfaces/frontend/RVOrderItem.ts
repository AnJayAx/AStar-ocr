export interface IRVOrderItem {
    label: string; 
    value: number; 
    isNormalPicking: boolean; /* true => DO, false => transfer */
    destinationLocation: string;
    destinationLocationID: number;
}