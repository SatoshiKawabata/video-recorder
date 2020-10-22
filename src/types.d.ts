export type MessageType =
  | "start-recording"
  | "stop-recording"
  | "detect-video-element";

export interface Message {
  type: MessageType;
  data?: RecordConfig;
}

export type Codec = "H264" | "VP8" | "VP9" | "";

export interface RecordConfig {
  codec: Codec;
  mimeType: "webm" | "mp4";
  fileName: string;
}
