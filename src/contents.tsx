import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Message } from "./types";

const Main = () => {
  const [video, setVideo] = useState<HTMLVideoElement>();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // const videos = document.querySelectorAll("video");
    // videos.forEach((video) => {
    //   video.removeEventListener("mouseover", onVideoMouseOver);
    //   video.addEventListener("mouseover", onVideoMouseOver);
    // });
  }, []);

  const onVideoMouseOver = (e: MouseEvent) => {
    if (isRecording) {
      return;
    }
    const videoElm = e.target as HTMLVideoElement;
    const rect = videoElm.getBoundingClientRect();
    setVideo(videoElm);
    setRect(rect);
  };

  if (video && rect) {
    const onClickRecord = () => {
      const isPlaying = !!(
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > 2
      );

      const stream = (video as any).captureStream() as MediaStream;
      const mimeType = "webm";
      const codec = "VP8";
      const recorder = new MediaRecorder(stream, {
        mimeType: `video/${mimeType};codecs=${codec}`,
      });

      recorder.addEventListener("dataavailable", (e) => {
        const blob = new Blob([e.data], { type: e.data.type });
        const url = URL.createObjectURL(blob);
        video.pause();
        setVideoUrl(url);
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
      };

      video.removeEventListener("ended", finishRecord);
      video.removeEventListener("pause", finishRecord);
      video.addEventListener("ended", finishRecord);
      video.addEventListener("pause", finishRecord);

      setIsRecording(true);
    };

    const onClickFinish = () => {
      video.pause();
    };

    return (
      <div
        style={{
          position: "fixed",
          background: "rgba(255,255,255,0.6)",
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }}
        onMouseLeave={() => {
          if (isRecording) {
            return;
          }
          setVideo(undefined);
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
            <a download="test.webbm" href={videoUrl}>
              download
            </a>
          ) : null}
        </div>
      </div>
    );
  } else {
    return null;
  }
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
        if (!document.body.contains(app)) {
          document.body.appendChild(app);
          ReactDOM.render(<Main />, app);
          const videos = document.querySelectorAll("video");
          videos.forEach((video) => {
            video.addEventListener("mouseover", () => {
              // ここでRectをとってきてMainに渡す
              // Mainからmouseleaveイベントをもらう
              // Reactやめる方向の方が良い気がしてきた
            });
          });
        }
        break;
    }
  }
);
