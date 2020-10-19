import React from "react";

interface P {
  video: HTMLVideoElement;
}

const finishRecord = () => {
  console.log("record start");
};

const startRecord = () => {};

export const VideoOverlap = ({ video }: P) => {
  const onClickRecord = () => {
    const isPlaying = !!(
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > 2
    );
    if (isPlaying) {
      startRecord();
    } else {
      video.play();
      startRecord();
    }

    video.removeEventListener("ended", finishRecord);
    video.removeEventListener("pause", finishRecord);
    video.addEventListener("ended", finishRecord);
    video.addEventListener("pause", finishRecord);
  };

  return (
    <div>
      <div>
        <h3>Record this video on play.</h3>
        <button type="button" onClick={onClickRecord}>
          Record
        </button>
      </div>
    </div>
  );
};
