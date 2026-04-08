import { Injectable } from '@angular/core';
import { IBom } from '@its/shared/interfaces/backend/Bom';
import { ISimpleBom } from '@its/shared/interfaces/backend/SimpleBom';

@Injectable({
  providedIn: 'root'
})
export class PtBomScanStoreService {

  inputBomState: IBom[] = [];
  outputBomState: ISimpleBom[] = []; 

  constructor() { }

  updateOutputBomState(outputBom: ISimpleBom[]) { this.outputBomState = outputBom; }
  updateInputBomState(inputBom: IBom[]) { this.inputBomState = inputBom; }
}
