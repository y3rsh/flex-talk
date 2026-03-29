import type { Coordinates } from "./shared.js";

export type CommandStatus = "queued" | "running" | "succeeded" | "failed";
export type KnownCommandType =
  | "aspirate"
  | "dispense"
  | "moveToWell"
  | "pickUpTip"
  | "dropTip"
  | "moveLabware"
  | "home"
  | "moveToCoordinates"
  | "touchTip";

export interface CommandError {
  id?: string;
  errorType?: string;
  errorCode?: string;
  detail?: string;
  createdAt?: string;
}

export interface CommandNote {
  kind: string;
  message: string;
  createdAt?: string;
}

export interface WellOffset {
  x: number;
  y: number;
  z: number;
}

export interface WellLocation {
  origin: "top" | "bottom" | "center";
  offset?: WellOffset;
}

export type LabwareLocation =
  | { slotName: string }
  | { moduleId: string }
  | { offDeck: true };

export interface BaseCommand {
  id: string;
  key: string;
  commandType: string;
  status: CommandStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: CommandError;
  notes?: CommandNote[];
}

export interface AspirateCommand extends BaseCommand {
  commandType: "aspirate";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation: WellLocation;
    volume: number;
    flowRate: number;
    liquidClassRecord?: unknown;
  };
}

export interface DispenseCommand extends BaseCommand {
  commandType: "dispense";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation: WellLocation;
    volume: number;
    flowRate: number;
    pushOut?: number;
    liquidClassRecord?: unknown;
  };
}

export interface MoveToWellCommand extends BaseCommand {
  commandType: "moveToWell";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation: WellLocation;
    forceDirect?: boolean;
    minimumZHeight?: number;
    speed?: number;
  };
}

export interface PickUpTipCommand extends BaseCommand {
  commandType: "pickUpTip";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation?: WellLocation;
  };
}

export interface DropTipCommand extends BaseCommand {
  commandType: "dropTip";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation?: WellLocation;
    alternateDropLocation?: boolean;
    homeAfter?: boolean;
  };
}

export interface MoveLabwareCommand extends BaseCommand {
  commandType: "moveLabware";
  params: {
    labwareId: string;
    newLocation: LabwareLocation;
    strategy: "usingGripper" | "manualMoveWithPause";
    pickUpOffset?: Coordinates;
    dropOffset?: Coordinates;
  };
}

export interface HomeCommand extends BaseCommand {
  commandType: "home";
  params: {
    axes?: Array<"x" | "y" | "leftZ" | "rightZ" | "gripperZ">;
  };
}

export interface MoveToCoordinatesCommand extends BaseCommand {
  commandType: "moveToCoordinates";
  params: {
    pipetteId: string;
    coordinates: Coordinates;
    minimumZHeight?: number;
    speed?: number;
    forceDirect?: boolean;
  };
}

export interface TouchTipCommand extends BaseCommand {
  commandType: "touchTip";
  params: {
    pipetteId: string;
    labwareId: string;
    wellName: string;
    wellLocation?: WellLocation;
    zOffset?: number;
    speed?: number;
  };
}

export type KnownCommand =
  | AspirateCommand
  | DispenseCommand
  | MoveToWellCommand
  | PickUpTipCommand
  | DropTipCommand
  | MoveLabwareCommand
  | HomeCommand
  | MoveToCoordinatesCommand
  | TouchTipCommand;

export type Command =
  | KnownCommand
  | BaseCommand;

export function isKnownCommand(command: Command): command is KnownCommand {
  return (
    command.commandType === "aspirate" ||
    command.commandType === "dispense" ||
    command.commandType === "moveToWell" ||
    command.commandType === "pickUpTip" ||
    command.commandType === "dropTip" ||
    command.commandType === "moveLabware" ||
    command.commandType === "home" ||
    command.commandType === "moveToCoordinates" ||
    command.commandType === "touchTip"
  );
}

export interface EnqueueCommandRequest {
  data: {
    commandType: KnownCommandType | (string & {});
    params: Record<string, unknown>;
    intent?: "protocol" | "setup" | "fixit";
    key?: string;
  };
  waitUntilComplete?: boolean;
  timeout?: number;
}
