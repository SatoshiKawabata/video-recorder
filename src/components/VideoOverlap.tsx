import React, { useState } from "react";

interface P {
  video: HTMLVideoElement;
}

export const VideoOverlap = ({ video }: P) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
    <div>
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
};
