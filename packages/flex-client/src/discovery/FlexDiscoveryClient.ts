import { EventEmitter } from "node:events";
import { networkInterfaces } from "node:os";

import type { FetchLike } from "../http.js";
import type {
  DiscoveryCandidate,
  DiscoveryClientEvents,
  DiscoveryClientOptions,
  DiscoveryRobot,
} from "./types.js";

const DEFAULT_PORT = 31950;
const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_REQUEST_TIMEOUT_MS = 1500;
const DEFAULT_MAX_MISSED_POLLS = 2;

type MutableRobot = DiscoveryRobot & { missedPolls: number };

function toCandidate(input: string | DiscoveryCandidate, defaultPort: number): DiscoveryCandidate {
  if (typeof input === "string") {
    return { host: input, port: defaultPort, source: "candidate" };
  }
  return {
    host: input.host,
    port: input.port ?? defaultPort,
    source: input.source ?? "candidate",
  };
}

function isPrivateV4(host: string): boolean {
  return (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function localSubnetPrefixes(): string[] {
  const nets = networkInterfaces();
  const prefixes = new Set<string>();

  for (const entries of Object.values(nets)) {
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      if (!isPrivateV4(entry.address)) continue;
      const parts = entry.address.split(".");
      if (parts.length === 4) {
        prefixes.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
      }
    }
  }

  return Array.from(prefixes);
}

function normalizeApiVersion(health: Record<string, unknown>): string | undefined {
  const apiVersion = health.apiVersion ?? health.api_version;
  return typeof apiVersion === "string" ? apiVersion : undefined;
}

function normalizeFirmwareVersion(health: Record<string, unknown>): string | undefined {
  const fw = health.firmwareVersion ?? health.fw_version;
  return typeof fw === "string" ? fw : undefined;
}

function normalizeSystemVersion(health: Record<string, unknown>): string | undefined {
  const system = health.systemVersion ?? health.system_version;
  return typeof system === "string" ? system : undefined;
}

function normalizeModel(health: Record<string, unknown>): string | undefined {
  const model = health.robotModel ?? health.robot_model;
  return typeof model === "string" ? model : undefined;
}

function normalizeSerial(health: Record<string, unknown>): string | null | undefined {
  const serial = health.robotSerial ?? health.robot_serial;
  if (typeof serial === "string") return serial;
  if (serial === null) return null;
  return undefined;
}

export class FlexDiscoveryClient extends EventEmitter {
  private readonly fetchFn: FetchLike;
  private readonly requestTimeoutMs: number;
  private readonly maxMissedPolls: number;
  private readonly defaultPort: number;

  private pollIntervalMs: number;
  private intervalId: NodeJS.Timeout | null = null;
  private manualCandidates: DiscoveryCandidate[];
  private robots: Map<string, MutableRobot> = new Map();
  private onUpdate: ((robots: DiscoveryRobot[]) => void) | undefined;
  private enableSubnetScan: boolean;
  private subnetPrefixes: string[];

  public constructor(options: DiscoveryClientOptions = {}) {
    super();

    const fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis);
    if (!fetchImpl) {
      throw new Error(
        "No fetch implementation found for discovery. Use Node 18+ or pass options.fetch."
      );
    }

    this.fetchFn = fetchImpl;
    this.defaultPort = options.port ?? DEFAULT_PORT;
    this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.maxMissedPolls = options.maxMissedPolls ?? DEFAULT_MAX_MISSED_POLLS;
    this.manualCandidates = (options.candidates ?? []).map((c) =>
      toCandidate(c, this.defaultPort)
    );
    this.onUpdate = options.onUpdate;
    this.enableSubnetScan = options.enableSubnetScan ?? false;
    this.subnetPrefixes = options.subnetPrefixes ?? [];
  }

  public override on<U extends keyof DiscoveryClientEvents>(
    event: U,
    listener: DiscoveryClientEvents[U]
  ): this {
    return super.on(event, listener);
  }

  public override emit<U extends keyof DiscoveryClientEvents>(
    event: U,
    ...args: Parameters<DiscoveryClientEvents[U]>
  ): boolean {
    return super.emit(event, ...args);
  }

  public getRobots(): DiscoveryRobot[] {
    return Array.from(this.robots.values())
      .map(({ missedPolls: _ignored, ...robot }) => robot)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public addCandidate(candidate: string | DiscoveryCandidate): this {
    const normalized = toCandidate(candidate, this.defaultPort);
    this.manualCandidates = this.manualCandidates.filter(
      (c) => !(c.host === normalized.host && (c.port ?? this.defaultPort) === normalized.port)
    );
    this.manualCandidates.push(normalized);
    return this;
  }

  public removeCandidate(host: string, port = this.defaultPort): this {
    this.manualCandidates = this.manualCandidates.filter(
      (c) => !(c.host === host && (c.port ?? this.defaultPort) === port)
    );
    return this;
  }

  public setPollInterval(intervalMs: number): this {
    this.pollIntervalMs = intervalMs > 0 ? intervalMs : DEFAULT_POLL_INTERVAL_MS;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
    return this;
  }

  public start(): this {
    if (this.intervalId) return this;
    void this.refresh();
    this.intervalId = setInterval(() => {
      void this.refresh();
    }, this.pollIntervalMs);
    return this;
  }

  public stop(): this {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return this;
  }

  public async refresh(): Promise<DiscoveryRobot[]> {
    try {
      const candidates = this.getCandidates();
      const results = await Promise.all(candidates.map((candidate) => this.probeCandidate(candidate)));

      const seen = new Set<string>();
      let changed = false;

      for (const robot of results) {
        if (!robot) continue;
        const key = `${robot.name}|${robot.host}|${robot.port}`;
        seen.add(key);

        const existing = this.robots.get(key);
        if (!existing || JSON.stringify(existing) !== JSON.stringify({ ...robot, missedPolls: 0 })) {
          this.robots.set(key, { ...robot, missedPolls: 0 });
          changed = true;
        } else if (existing.missedPolls !== 0) {
          existing.missedPolls = 0;
          this.robots.set(key, existing);
        }
      }

      for (const [key, robot] of this.robots.entries()) {
        if (seen.has(key)) continue;
        const nextMissed = robot.missedPolls + 1;
        if (nextMissed > this.maxMissedPolls) {
          this.robots.delete(key);
          changed = true;
        } else {
          this.robots.set(key, { ...robot, missedPolls: nextMissed });
        }
      }

      if (changed) {
        const list = this.getRobots();
        this.emit("update", list);
        this.onUpdate?.(list);
      }

      return this.getRobots();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("error", err);
      throw err;
    }
  }

  private getCandidates(): DiscoveryCandidate[] {
    const dedup = new Map<string, DiscoveryCandidate>();
    for (const c of this.manualCandidates) {
      const key = `${c.host}:${c.port ?? this.defaultPort}`;
      dedup.set(key, { ...c, port: c.port ?? this.defaultPort });
    }

    if (this.enableSubnetScan) {
      const prefixes =
        this.subnetPrefixes.length > 0 ? this.subnetPrefixes : localSubnetPrefixes();
      for (const prefix of prefixes) {
        for (let i = 1; i < 255; i += 1) {
          const host = `${prefix}.${i}`;
          const key = `${host}:${this.defaultPort}`;
          if (!dedup.has(key)) {
            dedup.set(key, { host, port: this.defaultPort, source: "subnet" });
          }
        }
      }
    }

    return Array.from(dedup.values());
  }

  private async probeCandidate(candidate: DiscoveryCandidate): Promise<DiscoveryRobot | null> {
    const port = candidate.port ?? this.defaultPort;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await this.fetchFn(`http://${candidate.host}:${port}/health`, {
        method: "GET",
        headers: { "opentrons-version": "*" },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const health = (await response.json()) as Record<string, unknown>;
      const name = typeof health.name === "string" ? health.name : candidate.host;
      const robot: DiscoveryRobot = {
        id: `${name}-${candidate.host}-${port}`,
        name,
        host: candidate.host,
        port,
        ok: true,
        apiVersion: normalizeApiVersion(health),
        firmwareVersion: normalizeFirmwareVersion(health),
        systemVersion: normalizeSystemVersion(health),
        robotModel: normalizeModel(health),
        robotSerial: normalizeSerial(health),
        lastSeen: Date.now(),
        source: candidate.source ?? "candidate",
        health,
      };
      return robot;
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
