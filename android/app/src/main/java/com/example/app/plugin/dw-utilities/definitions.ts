import type { PluginListenerHandle } from "@capacitor/core";

export interface DWUtilitiesPlugin {
    /**
     * Returns active profile
    */
   getActiveProfile(): Promise<string>;

   /**
    * Returns profile list
    */
   getProfileList(): Promise<string[]>;

   isCameraValid(): Promise<string>;

}