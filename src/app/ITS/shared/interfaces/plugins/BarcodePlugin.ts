import {registerPlugin} from "@capacitor/core";
import {PluginListenerHandle} from '@capacitor/core/types/definitions';

export interface barcodepluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  addListener(
    eventName: 'incomingBarcodeEvent',
    listenerFunc: (options: { value: string }) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'scannerStatusChangedEvent',
    listenerFunc: (options: { value: string }) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  removeAllListeners(): Promise<void>;

  softScanToggle(): Promise<{ value: string }>;

  suspendScanner(): Promise<{ value: string }>;
  resumeScanner(): Promise<{ value: string }>;
}

const BarcodePlugin = registerPlugin<barcodepluginPlugin>('barcodeplugin');

export default BarcodePlugin;
