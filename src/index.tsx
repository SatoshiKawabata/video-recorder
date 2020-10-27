import * as React from "react";
import * as ReactDOM from "react-dom";
import { RecordConfig } from "./types";

enum VideoTypes {
  Camera = "Camera",
  Screen = "Screen",
}

const App = () => {
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = React.useState<
    string
  >();
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = React.useState<
    string
  >();
  const [videoType, setVideoType] = React.useState<VideoTypes>(
    VideoTypes.Camera
  );
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [config, setConfig] = React.useState<RecordConfig>({
    codec: "VP8",
    fileName: "test",
    mimeType: "webm",
  });
  const [recorder, setRecorder] = React.useState<MediaRecorder | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const downloadRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(stream);
      const { videoDevices, audioDevices } = await getDevices();
      setSelectedVideoDeviceId(
        stream.getVideoTracks()[0].getSettings().deviceId
      );
      setSelectedAudioDeviceId(
        stream.getAudioTracks()[0].getSettings().deviceId
      );
      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      stream && closeStream(stream);
      if (
        videoType === VideoTypes.Camera &&
        selectedVideoDeviceId &&
        selectedAudioDeviceId
      ) {
        const stream = await getCameraStream(
          selectedVideoDeviceId,
          selectedAudioDeviceId
        );
        setStream(stream);
      } else {
        setStream(null);
      }
    })();
  }, [selectedVideoDeviceId, selectedAudioDeviceId, videoType]);

  React.useEffect(() => {
    if (recorder) {
    }
  }, [recorder]);

  return (
    <>
      <h1>Video Recorder</h1>
      <div>
        {[VideoTypes.Camera, VideoTypes.Screen].map((type) => {
          return (
            <label>
              <input
                type="radio"
                name="VideoTypes"
                value={type}
                checked={type === videoType}
                onClick={() => {
                  setVideoUrl(null);
                  setVideoType(type);
                }}
              ></input>
              {type}
            </label>
          );
        })}
      </div>
      {stream ? (
        <>
          <div>
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
          </div>
          <div>
            <video
              width={400}
              controls
              muted
              autoPlay
              ref={(v) => {
                if (v) {
                  v.src = "";
                  v.srcObject = stream;
                }
              }}
            ></video>
          </div>
        </>
      ) : null}
      {(videoType === VideoTypes.Camera && stream) ||
      videoType === VideoTypes.Screen ? (
        recorder ? (
          <button
            type="button"
            onClick={() => {
              recorder?.stop();
              setRecorder(null);
              if (videoType === VideoTypes.Screen) {
                setStream(null);
                stream?.getTracks().forEach((t) => t.stop());
              }
            }}
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              const { mimeType, codec } = config;
              let strm: MediaStream;
              if (videoType === VideoTypes.Screen) {
                const s = await getScreenStream();
                s.getVideoTracks()[0].onended = () => {
                  recorder && recorder.stop();
                  setRecorder(null);
                  setStream(null);
                };
                setStream(s);
                strm = s;
              } else if (stream) {
                strm = stream;
              } else {
                console.error("There is no stream.");
                return;
              }

              const recorder = new MediaRecorder(strm, {
                mimeType: `video/${mimeType};codecs=${codec}`,
              });

              recorder.addEventListener("dataavailable", (e) => {
                const blob = new Blob([e.data], { type: e.data.type });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setRecorder(null);
                downloadRef.current?.click();
              });
              recorder.start();
              setRecorder(recorder);
            }}
          >
            Record
          </button>
        )
      ) : null}
      {videoUrl ? (
        <div>
          <a
            ref={downloadRef}
            href={videoUrl}
            download={`${config.fileName}.${config.mimeType}`}
          >
            download
          </a>
          <video
            width={400}
            controls
            muted
            autoPlay
            ref={(v) => {
              if (v) {
                v.srcObject = null;
                v.src = videoUrl;
              }
            }}
          ></video>
        </div>
      ) : null}
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

const getScreenStream = async (): Promise<MediaStream> => {
  // 画面収録
  return await (navigator.mediaDevices as any).getDisplayMedia({
    video: true,
    audio: true,
  });
};

const getCameraStream = async (
  selectedVideoDeviceId: string,
  selectedAudioDeviceId: string
) => {
  // カメラ
  return await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: selectedVideoDeviceId,
    },
    audio: {
      deviceId: selectedAudioDeviceId,
    },
  });
};

const closeStream = (stream: MediaStream) => {
  stream.getTracks().forEach((t) => {
    t.stop();
    t.enabled = false;
  });
};
