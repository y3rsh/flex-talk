import type { HttpClient } from "../http.js";
import type { CameraImage, CameraInfo, CameraPreviewRequest } from "../types/index.js";

export class CameraResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async getInfo(): Promise<CameraInfo> {
    return this.http.get<CameraInfo>("/camera");
  }

  public async takePicture(): Promise<CameraImage> {
    return this.http.postBinary("/camera/picture");
  }

  public async capturePreviewImage(
    request: CameraPreviewRequest
  ): Promise<CameraImage> {
    return this.http.postBinary("/camera/capturePreviewImage", request);
  }
}
