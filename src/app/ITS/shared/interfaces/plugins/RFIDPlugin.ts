import {registerPlugin} from "@capacitor/core";
import {Plugin, PluginListenerHandle} from '@capacitor/core/types/definitions';

export interface RFIDPlugin extends Plugin{
  connect(options: { value: string }): Promise<{ value: string }>;
  // attempt
  disconnect(): Promise<{ value: string }>;

  test1(options: { value: string }): Promise<{ value: string }>;
  test2(options: { value: string }): Promise<{ value: string }>;

  performScan(options: { value: string }): Promise<{ value: string }>;
  stopScan(options: { value: string }): Promise<{ value: string }>;

  getBeeperVolum(options: { value: string }): Promise<{ value: string }>;
  setBeeperVolume(options: { volume: string }): Promise<{ value: string}>;

  getRFIDPowerLevel(options: { value: string}): Promise<{value: string}>;
  setRFIDPowerLevel(options: { level: string }): Promise<{value: string}>;

  setLocationingID(options: { tagID: string }): Promise<{ value: string }>;
  removeLocationingID(): Promise<{value: string}>;
  performLocationingScan(options: { tagID: string }): Promise<{ value: string }>;
  stopLocationingScan(options: { value: string }): Promise<{ value: string }>;

  //setTriggerMode(options: { mode: 'RFID' | 'BARCODE' }): Promise<{ ok: boolean; mode?: string; message?: string }>;
  //stopScan(): Promise<{ ok: boolean; message?: string }>;

  addListener(
    eventName: 'handleTagData',
    listenerFunc: (options: { value: string }) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'handleDistanceData',
    listenerFunc: (options: { value: string }) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'triggerPressEvent',
    listenerFunc: (options: { value: string }) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

}
const RFIDPlugin = registerPlugin<RFIDPlugin>('RFID');

export default RFIDPlugin;
