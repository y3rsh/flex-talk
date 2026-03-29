import type { HttpClient } from "../http.js";
import type {
  LabwareOffset,
  LabwareOffsetInput,
  LabwareOffsetSearchFilter,
} from "../types/index.js";

interface LabwareOffsetsResponse {
  data: LabwareOffset[];
}

function filterToQueryParams(filter: LabwareOffsetSearchFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.definitionUri) {
    params.set("definitionUri", filter.definitionUri);
  }
  if (filter.location?.slotName) {
    params.set("location.slotName", filter.location.slotName);
  }
  if (filter.location?.moduleModel) {
    params.set("location.moduleModel", filter.location.moduleModel);
  }
  if (filter.location?.definitionUri) {
    params.set("location.definitionUri", filter.location.definitionUri);
  }
  return params;
}

export class LabwareOffsetsResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async store(offsets: LabwareOffsetInput[]): Promise<LabwareOffset[]> {
    const response = await this.http.post<LabwareOffsetsResponse>("/labware_offsets", {
      data: offsets,
    });
    return response.data;
  }

  public async list(): Promise<LabwareOffset[]> {
    const response = await this.http.get<LabwareOffsetsResponse>("/labware_offsets");
    return response.data;
  }

  public async search(filter: LabwareOffsetSearchFilter): Promise<LabwareOffset[]> {
    const params = filterToQueryParams(filter);
    const path =
      params.toString().length > 0
        ? `/labware_offsets?${params.toString()}`
        : "/labware_offsets";
    const response = await this.http.get<LabwareOffsetsResponse>(path);
    return response.data;
  }

  public async delete(offsetId: string): Promise<void> {
    await this.http.delete<unknown>(`/labware_offsets/${offsetId}`);
  }

  public async deleteAll(): Promise<void> {
    await this.http.delete<unknown>("/labware_offsets");
  }
}
