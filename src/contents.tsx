import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Message, RecordConfig } from "./types";

interface P {
  onStartRecord: () => void;
  onFinishRecord: () => void;
  video: HTMLVideoElement;
  config: RecordConfig;
}

const Main = ({ video, onStartRecord, onFinishRecord, config }: P) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const onClickRecord = () => {
    onStartRecord();
    const isPlaying = !!(
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > 2
    );

    const stream = (video as any).captureStream() as MediaStream;
    const { mimeType, codec } = config;
    const recorder = new MediaRecorder(stream, {
      mimeType: `video/${mimeType};codecs=${codec}`,
    });

    recorder.addEventListener("dataavailable", (e) => {
      const blob = new Blob([e.data], { type: e.data.type });
      const url = URL.createObjectURL(blob);
      video.pause();
      setVideoUrl(url);
      downloadRef.current?.click();
    });

    if (isPlaying) {
      recorder.start();
    } else {
      video.play();
      recorder.start();
    }
    const finishRecord = () => {
      recorder.stop();
      setIsRecording(false);
      onFinishRecord();
    };

    video.removeEventListener("ended", finishRecord);
    video.removeEventListener("pause", finishRecord);
    video.addEventListener("ended", finishRecord);
    video.addEventListener("pause", finishRecord);

    setIsRecording(true);
  };

  const onClickFinish = () => {
    video.pause();
    onFinishRecord();
  };

  const rect = video.getBoundingClientRect();
  return (
    <div
      style={{
        display: "block",
        position: "fixed",
        background: "rgba(255,255,255,0.6)",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      <div>
        <h3>Record this video on play.</h3>
        {isRecording ? (
          <button type="button" onClick={onClickFinish}>
            Finish
          </button>
        ) : (
          <button type="button" onClick={onClickRecord}>
            Record
          </button>
        )}
        {videoUrl ? (
          <a
            download={`${config.fileName}.${config.mimeType}`}
            href={videoUrl}
            ref={downloadRef}
          >
            download
          </a>
        ) : null}
      </div>
    </div>
  );
};

const app = document.createElement("div");

// 送信側 contents -> background
chrome.runtime.sendMessage({
  value: { contents: "test value from contents" },
});

// 受信側 other tab -> contents(popup/option -> contents)
chrome.runtime.onMessage.addListener(
  (messageStr: string, sender, sendResponse) => {
    const message: Message = JSON.parse(messageStr);
    switch (message.type) {
      case "detect-video-element":
        if (message.data) {
          onDetectVideoElement(message.data);
        }
        break;
    }
  }
);

const onDetectVideoElement = (config: RecordConfig) => {
  if (!document.body.contains(app)) {
    document.body.appendChild(app);

    app.onmouseleave = () => {
      ReactDOM.unmountComponentAtNode(app);
    };

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.addEventListener("mouseover", () => {
        ReactDOM.render(
          <Main
            config={config}
            video={video}
            onStartRecord={() => {
              app.onmouseleave = null;
            }}
            onFinishRecord={() => {
              app.onmouseleave = () => {
                ReactDOM.unmountComponentAtNode(app);
              };
            }}
          />,
          app
        );
      });
    });
  }
};
