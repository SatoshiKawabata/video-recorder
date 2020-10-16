export type MessageType =
  | "start-recording"
  | "stop-recording"
  | "detect-video-element";
export interface Message {
  type: MessageType;
}
