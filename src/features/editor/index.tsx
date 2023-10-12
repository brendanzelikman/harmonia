import * as EditorSlice from "redux/Editor";
import { connect, ConnectedProps } from "react-redux";
import {
  selectEditor,
  selectRoot,
  selectSelectedPattern,
  selectSelectedTrack,
  selectTransport,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Editor } from "./components/Editor";
import { Duration, Tick, Timing, Velocity } from "types/units";
import { defaultEditor, EditorId, EditorState } from "types/Editor";
import { durationToTicks } from "utils";

function mapStateToProps(state: RootState) {
  const { showingTour } = selectRoot(state);
  const selectedPattern = selectSelectedPattern(state);
  const selectedTrack = selectSelectedTrack(state);

  const editor = selectEditor(state);
  const adding = editor.state === "adding";
  const inserting = editor.state === "inserting";
  const removing = editor.state === "removing";

  const { bpm } = selectTransport(state);
  const noteTicks = durationToTicks(editor.noteDuration, {
    dotted: editor.noteTiming === "dotted",
    triplet: editor.noteTiming === "triplet",
  });

  return {
    ...defaultEditor,
    ...editor,
    selectedPattern,
    selectedTrack,
    adding,
    inserting,
    removing,
    bpm,
    noteTicks,
    showingTour,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    showEditor: (id: EditorId) => {
      dispatch(EditorSlice.showEditor({ id }));
    },
    hideEditor: () => {
      dispatch(EditorSlice.hideEditor());
    },
    setState: (action: EditorState) => {
      dispatch(EditorSlice.setEditorState(action));
    },
    toggleState: (action: EditorState) => {
      dispatch(EditorSlice.toggleEditorState(action));
    },
    clear: () => {
      dispatch(EditorSlice.setEditorState("idle"));
    },
    setNoteDuration: (duration: Duration) => {
      dispatch(EditorSlice.setEditorNoteDuration(duration));
    },
    setNoteTiming: (timing: Timing) => {
      dispatch(EditorSlice.setEditorNoteTiming(timing));
    },
    setNoteVelocity: (velocity: Velocity) => {
      dispatch(EditorSlice.setEditorNoteVelocity(velocity));
    },
    setRecordingDuration: (length: Tick) => {
      dispatch(EditorSlice.setEditorRecordingDuration(length));
    },
    setRecordingTiming: (timing: Timing) => {
      dispatch(EditorSlice.setEditorRecordingTiming(timing));
    },
    setRecordingQuantization: (quantization: Duration) => {
      dispatch(EditorSlice.setEditorRecordingQuantization(quantization));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorProps extends Props {}

export default connector(Editor);
export * from "./components/Editor";
