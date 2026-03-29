import type { FetchLike } from "../http.js";

export interface DiscoveryCandidate {
  host: string;
  port?: number;
  source?: "manual" | "candidate" | "subnet";
}

export interface DiscoveryRobot {
  id: string;
  name: string;
  host: string;
  port: number;
  ok: boolean;
  apiVersion: string | undefined;
  firmwareVersion: string | undefined;
  systemVersion: string | undefined;
  robotModel: string | undefined;
  robotSerial: string | null | undefined;
  lastSeen: number;
  source: "manual" | "candidate" | "subnet";
  health: Record<string, unknown>;
}

export interface DiscoveryClientOptions {
  candidates?: Array<string | DiscoveryCandidate>;
  pollIntervalMs?: number;
  requestTimeoutMs?: number;
  maxMissedPolls?: number;
  port?: number;
  fetch?: FetchLike;
  enableSubnetScan?: boolean;
  subnetPrefixes?: string[];
  onUpdate?: (robots: DiscoveryRobot[]) => void;
}

export interface DiscoveryClientEvents {
  update: (robots: DiscoveryRobot[]) => void;
  error: (error: Error) => void;
}
