export interface CameraImage {
  data: Uint8Array;
  contentType: string | null;
}

export type CameraInfo = Record<string, unknown>;

export interface CameraPreviewRequest {
  data: Record<string, unknown>;
}
