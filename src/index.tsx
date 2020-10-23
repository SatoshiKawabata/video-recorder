import * as React from "react";
import * as ReactDOM from "react-dom";
import { useVideoRecorder } from "./recorder/VideoRecorder";
import { startRecording, stopRecording } from "./recorder/VideoRecorder";

const App = () => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = React.useState<
    string
  >();
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = React.useState<
    string
  >();
  React.useEffect(() => {
    (async () => {
      const { videoDevices, audioDevices } = await getDevices();
      setVideoDevices([...videoDevices, ...videoDevices, ...videoDevices]);
      setAudioDevices(audioDevices);
      setSelectedVideoDeviceId(videoDevices[0].deviceId);
      setSelectedAudioDeviceId(audioDevices[0].deviceId);
    })();
  }, []);
  console.log(videoDevices);
  return (
    <>
      <select
        onChange={(e) => {
          setSelectedVideoDeviceId(
            videoDevices[e.target.selectedIndex].deviceId
          );
        }}
      >
        {videoDevices.map((d) => {
          return (
            <option
              key={d.deviceId}
              value={d.deviceId}
              selected={d.deviceId === selectedVideoDeviceId}
            >
              {d.label}
            </option>
          );
        })}
      </select>
      <select
        onChange={(e) => {
          setSelectedAudioDeviceId(
            audioDevices[e.target.selectedIndex].deviceId
          );
        }}
      >
        {audioDevices.map((d) => {
          return (
            <option
              key={d.deviceId}
              value={d.deviceId}
              selected={d.deviceId === selectedAudioDeviceId}
            >
              {d.label}
            </option>
          );
        })}
      </select>
      {isRecording ? (
        <button
          type="button"
          onClick={() => {
            setIsRecording(false);
          }}
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsRecording(true);
          }}
        >
          Record
        </button>
      )}
    </>
  );
};

ReactDOM.render(<App />, document.querySelector("#app"));

const getDevices = async (): Promise<{
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
}> => {
  const infos = await navigator.mediaDevices.enumerateDevices();
  const audioDevices: MediaDeviceInfo[] = [];
  const videoDevices: MediaDeviceInfo[] = [];
  for (const info of infos) {
    if (info.kind === "audioinput") {
      audioDevices.push(info);
    } else if (info.kind === "videoinput") {
      videoDevices.push(info);
    }
  }
  return {
    audioDevices,
    videoDevices,
  };
};
