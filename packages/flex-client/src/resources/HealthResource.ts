import type { HttpClient } from "../http.js";
import type { RobotHealth } from "../types/index.js";

interface HealthResponse {
  data: RobotHealth;
}

type RawHealth = Record<string, unknown>;

function toRobotHealth(health: RawHealth): RobotHealth {
  const getString = (key: string): string | undefined =>
    typeof health[key] === "string" ? (health[key] as string) : undefined;
  const links =
    typeof health.links === "object" && health.links !== null
      ? (health.links as Record<string, string>)
      : {};

  return {
    name: getString("name") ?? "unknown",
    robotModel:
      getString("robotModel") ?? getString("robot_model") ?? "OT-3 Standard",
    apiVersion: getString("apiVersion") ?? getString("api_version") ?? "unknown",
    firmwareVersion:
      getString("firmwareVersion") ?? getString("fw_version") ?? "unknown",
    systemVersion:
      getString("systemVersion") ?? getString("system_version") ?? "unknown",
    robotSerial:
      getString("robotSerial") ?? getString("robot_serial") ?? "unknown",
    links,
  };
}

export class HealthResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async get(): Promise<RobotHealth> {
    const response = await this.http.get<HealthResponse | RobotHealth>("/health");
    if ("data" in response) {
      return toRobotHealth(response.data as unknown as RawHealth);
    }
    return toRobotHealth(response as unknown as RawHealth);
  }
}
