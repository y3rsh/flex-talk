export interface RobotHealth {
  name: string;
  robotModel: string;
  apiVersion: string;
  firmwareVersion: string;
  systemVersion: string;
  robotSerial: string;
  links: Record<string, string>;
}
