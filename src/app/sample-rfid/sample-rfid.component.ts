import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ZebraPowerLevels } from '@its/shared/constants/scanning.constants';
import RFIDPlugin from '@its/shared/interfaces/plugins/RFIDPlugin';
import { of } from 'rxjs';

@Component({
  selector: 'app-sample-rfid',
  templateUrl: './sample-rfid.component.html',
  styleUrls: ['./sample-rfid.component.scss']
})
export class SampleRfidComponent implements OnInit {
  testvalue = [];
  status;
  isPress = false;

  powerLevels = [ZebraPowerLevels.MIN_POWER, ZebraPowerLevels.POWER_120, ZebraPowerLevels.POWER_180, ZebraPowerLevels.POWER_270, ZebraPowerLevels.MAX_POWER];
  selectedPowerLevel = this.powerLevels[0];

  testLocationingEPCId = "E30000000199000000000333";

  locationRes;
  distance = 0;
  
  isButtonHighlighted(level): boolean {
    return this.selectedPowerLevel == level;
  }

  onSelectPowerLevel(level): void {
    this.selectedPowerLevel = level;
    
    const setPowerLevel$ = of(RFIDPlugin.setRFIDPowerLevel({ level: this.selectedPowerLevel }));
    setPowerLevel$.subscribe({
      next: (res) => {
        console.log('onSelectPowerLevel', res);
      },
      error: (error) => { console.error(error); }
    });
  }

  // onDistanceUpdated(distance: number) {
  //   console.log('DEBUG on distance updated', distance);
  //   this.distance = distance;
  //   this.ref.detectChanges();
  // }

  // onLocationingStatusUpdated(status: string) {
  //   console.log('DEBUG on locationing status updated', status);
  //   this.locationRes = status;
  //   this.ref.detectChanges();
  // }

  clearTags(): void {
    this.testvalue = [];
    this.ref.detectChanges();
  }

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    RFIDPlugin.addListener('handleTagData', (info: any) => {
      console.log('myPluginEvent was fired' + JSON.stringify(info));

      // this.toastr.info('myPluginEvent was fired' + info);
      // const parsedResults =  JSON.parse(info.result);
      if (info.result && this.isPress){
        this.testvalue = [...this.testvalue, ... info.result.replace('[', '').replace(']', '').split(',')];
        this.ref.detectChanges();
      }

    });

    // RFIDPlugin.addListener('handleDistanceData', (info: any) => {
    //   console.log('myPluginEvent was fired' + JSON.stringify(info));

    //   // this.toastr.info('myPluginEvent was fired' + info);
    //   // const parsedResults =  JSON.parse(info.result);
    //   if (info.result) {
    //     this.locationRes = info.result;
    //     this.distance = parseInt(info.result.trim().replace('[','').replace(']',''));
    //     console.log('handleTagData', JSON.stringify(info.result));
    //     this.ref.detectChanges();
    //   }

    // });


    RFIDPlugin.addListener('triggerPressEvent', (info: any) => {
      console.log('triggerPressEvent was fired' + info.isPress);

      // reset testvalue array
      if( !this.isPress && info.isPress ){
        this.testvalue = [];
      }

      this.isPress = info.isPress;
    });

  }



  async connect(): Promise<void> {
    // RFIDPlugin.addListener('myPluginEvent', (info: any) => {
    //   console.log('myPluginEvent was fired');
    // });

    const { value } = await RFIDPlugin.connect({ value: 'Hello World!' });
    console.log('Response from native:', value);
    this.status = value;
  }


  async test1(): Promise<void>  {

    const { value } = await RFIDPlugin.test1({ value: 'Hello World!' });
    console.log('Response from native:', value);
    this.status = value;

  }

  async test2(): Promise<void>  {
    const { value } = await RFIDPlugin.test2({ value: 'Hello World!' });
    console.log('Response from native:', value);

    this.status = value;
  }


}
