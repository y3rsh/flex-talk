import type { DeckSlot } from "./shared.js";

export type ModuleModel =
  | "temperatureModuleV2"
  | "magneticBlockV1"
  | "heaterShakerModuleV1"
  | "thermocyclerModuleV2"
  | "absorbanceReaderV1"
  | "flexStackerModuleV1";

export interface AttachedModule {
  id: string;
  serialNumber: string;
  firmwareVersion: string;
  hardwareRevision: string;
  hasAvailableUpdate: boolean;
  moduleType: string;
  moduleModel: ModuleModel;
  slotName: DeckSlot;
  data: Record<string, unknown>;
  usbPort: { port: number; path: string };
}
