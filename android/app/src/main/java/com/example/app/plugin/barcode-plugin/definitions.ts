// import {registerPlugin} from "@capacitor/core";
// import {PluginListenerHandle} from '@capacitor/core/types/definitions';

// export interface barcodepluginPlugin {
//   echo(options: { value: string }): Promise<{ value: string }>;

//   addListener(
//     eventName: 'incomingBarcodeEvent',
//     listenerFunc: (options: { value: string }) => void,
//   ): Promise<PluginListenerHandle> & PluginListenerHandle;

//   addListener(
//     eventName: 'scannerStatusChangedEvent',
//     listenerFunc: (options: { value: string }) => void,
//   ): Promise<PluginListenerHandle> & PluginListenerHandle;

//   removeAllListeners(): Promise<void>;

//   softScanToggle(): Promise<{ value: string }>;
// }
// // const IBarcodePlugin = registerPlugin<barcodepluginPlugin>('barcodeplugin', {
// //   web: () => import('./web').then(m => new m.barcodepluginWeb()),
// // });
// const IBarcodePlugin = registerPlugin<barcodepluginPlugin>('barcodeplugin');

// export default IBarcodePlugin;
