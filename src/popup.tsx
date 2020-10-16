import * as React from "react";
import * as ReactDOM from "react-dom";
import { Message } from "./types";

const App = () => {
  return (
    <div>
      <h1>Hello!!!</h1>
      <a href="/index.html" target="_blank">
        Record screen
      </a>
      <button
        type="button"
        onClick={() => {
          sendToContents({
            type: "detect-video-element",
          });
        }}
      >
        Detect video element
      </button>
      <button
        type="button"
        onClick={() => {
          sendToBackground({ type: "start-recording" });
        }}
      >
        start-recording
      </button>
      <button
        type="button"
        onClick={() => {
          sendToBackground({ type: "stop-recording" });
        }}
      >
        stop-recording
      </button>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#app"));

// backgroundで受け取った値をコンソールに表示
function logBackgroundValue() {
  var test = (chrome.extension.getBackgroundPage() as any)?.test_value;
  console.log(test);
  return;
}

// 現在アクティブなタブにデータを送信
function sendToContents(message: Message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];

    chrome.tabs.sendMessage(tab.id || 0, JSON.stringify(message), function (
      response
    ) {});
  });
}

const sendToBackground = (message: Message) => {
  chrome.runtime.sendMessage(message, (res) => {
    console.log("response", res);
  });
};

document.getElementById("log")?.addEventListener("click", logBackgroundValue);
