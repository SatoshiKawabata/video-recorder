import React from "react";

interface P {
  video: HTMLVideoElement;
}
export const VideoOverlap = ({ video }: P) => {
  const onClickRecord = () => {
    const isPlaying = !!(
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > 2
    );
    if (isPlaying) {
      console.log("record start");
    } else {
      video.addEventListener("play", () => {
        console.log("on play");
      });
    }

    video.addEventListener("ended", () => {
      console.log("ended");
    });
    video.addEventListener("pause", () => {
      console.log("pause");
    });
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
