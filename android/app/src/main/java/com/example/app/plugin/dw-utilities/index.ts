import { registerPlugin } from "@capacitor/core";
import type { DWUtilitiesPlugin } from "./definitions";

const DWUtilities = registerPlugin<DWUtilitiesPlugin>('DWUtilities');

export * from "./definitions";
export { DWUtilities };