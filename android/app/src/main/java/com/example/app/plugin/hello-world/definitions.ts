import type { PluginListenerHandle } from "@capacitor/core";

export interface HelloWorldPlugin {
    /**
     * Returns 'Hello World' message
     */
    getHelloWorld(): Promise<string>;
}