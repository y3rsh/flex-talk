import type { HttpClient } from "../http.js";
import type { AttachedModule } from "../types/index.js";

interface ModulesResponse {
  data: AttachedModule[];
}

interface ModuleResponse {
  data: AttachedModule;
}

export class ModulesResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async list(): Promise<AttachedModule[]> {
    const response = await this.http.get<ModulesResponse>("/modules");
    return response.data;
  }

  public async get(moduleId: string): Promise<AttachedModule> {
    const response = await this.http.get<ModuleResponse>(`/modules/${moduleId}`);
    return response.data;
  }
}
