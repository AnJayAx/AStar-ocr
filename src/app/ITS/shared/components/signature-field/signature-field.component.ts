import { Component, OnInit, Output, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-signature-field',
  templateUrl: './signature-field.component.html',
  styleUrls: ['./signature-field.component.scss']
})
export class SignatureFieldComponent implements OnInit, AfterViewInit {
  public options: Object = { 
    'minWidth': 5,
    dotSize: 0.5,
    maxWidth: 1.5
  };
  @ViewChild('sig') signaturePad: SignaturePad;
  public _signature: string;
  
  @Output() updatedSignature: EventEmitter<string>;

  constructor() { 
    this._signature = '';
    this.updatedSignature = new EventEmitter(); 
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.signaturePad.set('minWidth', 5);
    this.signaturePad.clear(); 
  }

  private stopSignature() {
    this._signature = this.signaturePad.toDataURL();
  }

  private restartSignature() {
    this.signaturePad.set('minWidth', 5);
    this.signaturePad.clear();
    this._signature = '';
  }

  clear(): void {
    this.restartSignature();
  }

  drawStart(event: MouseEvent | Touch) {}

  drawComplete(event: MouseEvent | Touch) {
    this.stopSignature();
    this.updatedSignature.emit(this._signature);
  }
}
