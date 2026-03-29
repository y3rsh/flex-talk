import type { Coordinates, DeckSlot } from "./shared.js";
import type { ModuleModel } from "./modules.js";

export interface OffsetLocation {
  slotName: DeckSlot;
  moduleModel?: ModuleModel;
  definitionUri?: string;
}

export interface LabwareOffset {
  id: string;
  createdAt: string;
  definitionUri: string;
  location: OffsetLocation;
  vector: Coordinates;
}

export type LabwareOffsetInput = Omit<LabwareOffset, "id" | "createdAt">;

export interface LabwareOffsetSearchFilter {
  definitionUri?: string;
  location?: Partial<OffsetLocation>;
}
