import type { Coordinates, Mount } from "./shared.js";

export interface PipetteOffset {
  source: string;
  vector: Coordinates;
}

export interface GripperOffset {
  source: string;
  vector: Coordinates;
}

export interface AttachedPipette {
  id: string;
  instrumentType: "pipette";
  mount: Mount;
  serialNumber: string;
  firmwareVersion: string;
  instrumentName: string;
  instrumentModel: string;
  data: {
    channels: number;
    min_volume: number;
    max_volume: number;
    calibratedOffset?: PipetteOffset;
  };
  ok: boolean;
}

export interface AttachedGripper {
  id: string;
  instrumentType: "gripper";
  mount: "extension";
  serialNumber: string;
  firmwareVersion: string;
  instrumentName: "gripperV1";
  data: {
    jawState: string;
    calibratedOffset?: GripperOffset;
  };
  ok: boolean;
}

export type AttachedInstrument = AttachedPipette | AttachedGripper;
