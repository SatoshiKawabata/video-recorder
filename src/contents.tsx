import React from "react";
import ReactDOM from "react-dom";
import { Message } from "./types";

const Main = () => {
  return <div>Hello Content Scripts.</div>;
};
const app = document.createElement("div");
app.style.position = "fixed";
app.style.background = "rgba(255,255,255,0.6)";
app.style.display = "none";

console.log(app);
document.body.appendChild(app);
ReactDOM.render(<Main />, app);

// 送信側 contents -> background
chrome.runtime.sendMessage({ value: { contents: "test value from contents" } });

// 受信側 other tab -> contents(popup/option -> contents)
chrome.runtime.onMessage.addListener(function (
  messageStr: string,
  sender,
  sendResponse
) {
  const message: Message = JSON.parse(messageStr);
  onMessage(message);
  return;
});

const onMessage = (message: Message) => {
  switch (message.type) {
    case "detect-video-element":
      detectVideoElement();
      break;
  }
};

const detectVideoElement = () => {
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    video.removeEventListener("mouseover", onVideoMouseOver);
    video.addEventListener("mouseover", onVideoMouseOver);
  });
};

const onVideoMouseOver = (e: MouseEvent) => {
  const rect = (e.target as HTMLVideoElement).getBoundingClientRect();
  app.style.top = `${rect.top}px`;
  app.style.left = `${rect.left}px`;
  app.style.width = `${rect.width}px`;
  app.style.height = `${rect.height}px`;
  app.style.display = "block";
};

const onAppMouseOut = (e: MouseEvent) => {
  app.style.display = "none";
};

app.addEventListener("mouseout", onAppMouseOut);
