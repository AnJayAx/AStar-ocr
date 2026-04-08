import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DWUtilities } from 'android/app/src/main/java/com/example/app/plugin/dw-utilities';
import { HelloWorld } from 'android/app/src/main/java/com/example/app/plugin/hello-world';
import { from, Subject } from 'rxjs';
// import IBarcodePlugin from 'android/app/src/main/java/com/example/app/plugin/barcode-plugin/definitions';
import BarcodePlugin from '@its/shared/interfaces/plugins/BarcodePlugin';

@Component({
  selector: 'app-sample-barcode',
  templateUrl: './sample-barcode.component.html',
  styleUrls: ['./sample-barcode.component.scss']
})
export class SampleBarcodeComponent implements OnInit, OnDestroy {

  msg: string;
  activeProfile: string;
  profileList: string[];

  barcodeList: string[];
  barcodeList$: Subject<string[]>;
  echoMsg: string;

  cameraValid: string;

  constructor(
    private ref: ChangeDetectorRef
  ) {
    this.barcodeList = [];
    this.barcodeList$ = new Subject();

    BarcodePlugin.addListener('incomingBarcodeEvent', (info: { value: string }) => {
      console.log('TEST incoming barcode event' + JSON.stringify(info));
      // const incomingEPCs: string[] = JSON.parse(info.value);
      // this.barcodeList = incomingEPCs;
      this.barcodeList = this.processBarcodes(info.value);
      this.barcodeList$.next(this.barcodeList);
      this.echoMsg = this.barcodeList.toString();
      this.ref.detectChanges();
    });
  }

  private processBarcodes(barcodes: string): string[] {
    let arr: string[] = [];
    const processed = barcodes.replace(' ','').replace('[', '').replace(']','').split(',');
    // const processed = barcodes.replace(' ','').replace('[', '').replace(']','').split('E');
    arr = [...new Set(processed)];
    // processed.forEach(barcode => {
    //   const processedBarcode = `\"${barcode}\"`;
    //   if (!arr.includes(processedBarcode)) {
    //     arr.push(processedBarcode);
    //   }
    // });
    console.log('TEST processBarcodes', arr);
    return arr;
  }

  ngOnInit(): void {
    this.getMsg();
    this.getActiveProfile();
    this.getProfileList();
    this.testBarcodeplugin();
    this.testDWUtilitiesCameraCheck();
  }

  ngOnDestroy(): void {
    BarcodePlugin.removeAllListeners();
  }

  async getMsg() {
    this.msg =  await HelloWorld.getHelloWorld();
  }

  async getActiveProfile() {
    this.activeProfile = await DWUtilities.getActiveProfile();
    console.log('TEST active profile', JSON.stringify(this.activeProfile));
  }

  async getProfileList() {
    this.profileList = await DWUtilities.getProfileList();
    console.log('TEST profile list', JSON.stringify(this.profileList));
  }

  testBarcodeplugin() { 
    const echoMsg$ = from(BarcodePlugin.echo({ value: 'hello' }));
    echoMsg$.subscribe({
      next: (res) => { this.echoMsg = res.value; },
      error: (error) => { console.error(error); }
    });
  }

  testDWUtilitiesCameraCheck() {
    const cameraValid$ = from(DWUtilities.isCameraValid());
    cameraValid$.subscribe({
      next: (res) => { this.cameraValid = res['value']; console.log('TEST camera valid', res); },
      error: (error) => { console.error(error); }
    });
  }

  async softScanToggle() {
    await BarcodePlugin.softScanToggle();
  }

}
