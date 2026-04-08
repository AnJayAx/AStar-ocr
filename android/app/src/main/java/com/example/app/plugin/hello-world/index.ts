import { registerPlugin } from "@capacitor/core";
import type { HelloWorldPlugin } from "./definitions";

const HelloWorld = registerPlugin<HelloWorldPlugin>('HelloWorld');

export * from "./definitions";
export { HelloWorld };