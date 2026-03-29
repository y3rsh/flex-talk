import type { HttpClient } from "../http.js";
import type { DeckConfiguration, DeckConfigurationItem } from "../types/index.js";

interface DeckConfigurationResponse {
  data: DeckConfigurationItem[];
}

export class DeckResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async getConfiguration(): Promise<DeckConfiguration> {
    const response = await this.http.get<DeckConfigurationResponse>("/deck_configuration");
    return { data: response.data };
  }

  public async setConfiguration(
    config: DeckConfigurationItem[]
  ): Promise<DeckConfiguration> {
    const response = await this.http.put<DeckConfigurationResponse>("/deck_configuration", {
      data: config,
    });
    return { data: response.data };
  }
}
