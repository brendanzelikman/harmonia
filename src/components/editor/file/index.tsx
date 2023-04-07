import { connect, ConnectedProps } from "react-redux";
import {
  selectRoot,
  selectTransport,
  selectTransportEndTime,
} from "redux/selectors";
import { setProjectName } from "redux/slices/root";
import { convertTimeToSeconds } from "redux/slices/transport";

import { AppDispatch, RootState } from "redux/store";
import { downloadTransport } from "redux/thunks/transport";
import { clearState, readFiles, saveStateToFile } from "redux/util";
import { Time } from "tone";
import { EditorProps } from "..";
import EditorFile from "./File";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const { projectName } = selectRoot(state);
  const transport = selectTransport(state);
  const endTick = selectTransportEndTime(state);
  const startTick = transport.loop ? transport.loopStart : 0;
  const duration = endTick - startTick;
  const projectDuration = convertTimeToSeconds(transport, duration);
  const barsBeatsSixteenth = Time(projectDuration).toBarsBeatsSixteenths();
  const recordingProgress = Math.round(
    ((transport.time - startTick) / duration) * 100
  );
  const isRecording = transport.recording && recordingProgress > 0;
  return {
    ...ownProps,
    projectName,
    projectDuration,
    barsBeatsSixteenth,
    recordingProgress,
    isRecording,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    saveToFile: () => {
      dispatch(saveStateToFile);
    },
    saveToAudio: () => {
      dispatch(downloadTransport("webm"));
    },
    readFiles: () => {
      dispatch(readFiles);
    },
    clearProject: () => {
      clearState();
    },
    setProjectName: (name: string) => {
      dispatch(setProjectName(name));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorFileProps extends Props {}

export default connector(EditorFile);
