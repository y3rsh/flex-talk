import type { HttpClient } from "../http.js";
import type {
  AttachedGripper,
  AttachedInstrument,
  AttachedPipette,
} from "../types/index.js";

interface InstrumentsResponse {
  data: AttachedInstrument[];
}

export class InstrumentsResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async list(): Promise<AttachedInstrument[]> {
    const response = await this.http.get<InstrumentsResponse>("/instruments");
    return response.data;
  }

  public async pipettes(): Promise<AttachedPipette[]> {
    const instruments = await this.list();
    return instruments.filter(
      (instrument): instrument is AttachedPipette =>
        instrument.instrumentType === "pipette"
    );
  }

  public async gripper(): Promise<AttachedGripper | null> {
    const instruments = await this.list();
    return (
      instruments.find(
        (instrument): instrument is AttachedGripper =>
          instrument.instrumentType === "gripper"
      ) ?? null
    );
  }
}
