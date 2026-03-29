import { HttpClient } from "./http.js";
import type { FetchLike } from "./http.js";
import { FlexDiscoveryClient } from "./discovery/FlexDiscoveryClient.js";
import type { DiscoveryClientOptions } from "./discovery/types.js";
import { CameraResource } from "./resources/CameraResource.js";
import { DeckResource } from "./resources/DeckResource.js";
import { ErrorRecoveryResource } from "./resources/ErrorRecoveryResource.js";
import { HealthResource } from "./resources/HealthResource.js";
import { InstrumentsResource } from "./resources/InstrumentsResource.js";
import { LabwareOffsetsResource } from "./resources/LabwareOffsetsResource.js";
import { MaintenanceRunsResource } from "./resources/MaintenanceRunsResource.js";
import { ModulesResource } from "./resources/ModulesResource.js";
import { ProtocolsResource } from "./resources/ProtocolsResource.js";
import { RunsResource } from "./resources/RunsResource.js";
import { SystemResource } from "./resources/SystemResource.js";

export interface FlexClientConfig {
  host: string;
  port?: number;
  protocol?: "http" | "https";
  fetch?: FetchLike;
}

export class FlexClient {
  public readonly camera: CameraResource;
  public readonly deck: DeckResource;
  public readonly errorRecovery: ErrorRecoveryResource;
  public readonly health: HealthResource;
  public readonly instruments: InstrumentsResource;
  public readonly labwareOffsets: LabwareOffsetsResource;
  public readonly maintenance: MaintenanceRunsResource;
  public readonly modules: ModulesResource;
  public readonly protocols: ProtocolsResource;
  public readonly runs: RunsResource;
  public readonly system: SystemResource;
  private readonly http: HttpClient;

  public constructor(config: FlexClientConfig) {
    const protocol = config.protocol ?? "http";
    const port = config.port ?? 31950;
    const baseUrl = `${protocol}://${config.host}:${port}`;

    this.http = new HttpClient(baseUrl, config.fetch);
    this.camera = new CameraResource(this.http);
    this.deck = new DeckResource(this.http);
    this.errorRecovery = new ErrorRecoveryResource(this.http);
    this.health = new HealthResource(this.http);
    this.instruments = new InstrumentsResource(this.http);
    this.labwareOffsets = new LabwareOffsetsResource(this.http);
    this.maintenance = new MaintenanceRunsResource(this.http);
    this.modules = new ModulesResource(this.http);
    this.protocols = new ProtocolsResource(this.http);
    this.runs = new RunsResource(this.http);
    this.system = new SystemResource(this.http);
  }

  public static createDiscoveryClient(
    options: DiscoveryClientOptions = {}
  ): FlexDiscoveryClient {
    return new FlexDiscoveryClient(options);
  }
}
