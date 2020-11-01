import * as React from "react";
import * as ReactDOM from "react-dom";
import { RecordConfig } from "./types";
import {
  Provider,
  defaultTheme,
  Button,
  View,
  ListBox,
  Item,
  Picker,
  RadioGroup,
  Radio,
  Heading,
  Link,
  Dialog,
  Header,
  Divider,
  Content,
  ButtonGroup,
  Text,
  DialogTrigger,
  ActionButton,
} from "@adobe/react-spectrum";
import "modern-css-reset";

/**
 * そろそろUIを作り始めても良いかも
 * codecのリストを出す
 */

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
      <Provider theme={defaultTheme}>
        <View height="100vh" width={800} margin="auto">
          <Heading level={1}>Video Recorder</Heading>
          <View>
            <RadioGroup
              orientation="horizontal"
              label="Device"
              value={videoType}
              onChange={(value) => {
                setVideoType(value as VideoTypes);
              }}
            >
              {[VideoTypes.Camera, VideoTypes.Screen].map((type) => {
                return <Radio value={type}>{type}</Radio>;
              })}
            </RadioGroup>
          </View>
          {stream ? (
            <>
              <View>
                <Picker
                  defaultSelectedKey={selectedVideoDeviceId}
                  onSelectionChange={(key) => {
                    setSelectedVideoDeviceId(key as string);
                  }}
                >
                  {videoDevices.map((d) => {
                    return <Item key={d.deviceId}>{d.label}</Item>;
                  })}
                </Picker>
                <Picker
                  defaultSelectedKey={selectedAudioDeviceId}
                  onSelectionChange={(key) => {
                    setSelectedAudioDeviceId(key as string);
                  }}
                >
                  {audioDevices.map((d) => {
                    return <Item key={d.deviceId}>{d.label}</Item>;
                  })}
                </Picker>
              </View>
              <View>
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
              </View>
            </>
          ) : null}
          {(videoType === VideoTypes.Camera && stream) ||
          videoType === VideoTypes.Screen ? (
            recorder ? (
              <Button
                UNSAFE_style={{ cursor: "pointer" }}
                variant="cta"
                onPress={() => {
                  recorder?.stop();
                  setRecorder(null);
                  if (videoType === VideoTypes.Screen) {
                    setStream(null);
                    stream?.getTracks().forEach((t) => t.stop());
                  }
                }}
              >
                Stop
              </Button>
            ) : (
              <Button
                UNSAFE_style={{ cursor: "pointer" }}
                variant="cta"
                onPress={async () => {
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
              </Button>
            )
          ) : null}
          {videoUrl ? (
            <>
              <View>
                <Heading level={3}>Preview</Heading>
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
              </View>
              <View>
                <Link>
                  <a
                    ref={downloadRef}
                    href={videoUrl}
                    download={`${config.fileName}.${config.mimeType}`}
                  >
                    download
                  </a>
                </Link>
              </View>
            </>
          ) : null}
        </View>

        <DialogTrigger>
          <ActionButton>Check connectivity</ActionButton>
          <Dialog>
            <Heading>Internet Speed Test</Heading>
            <Header>Connection status: Connected</Header>
            <Divider />
            <Content>
              <Text>Start speed test?</Text>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button variant="cta" onPress={close}>
                Confirm
              </Button>
            </ButtonGroup>
          </Dialog>
        </DialogTrigger>
      </Provider>
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
