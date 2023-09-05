import { connect, ConnectedProps } from "react-redux";
import { selectEditor, selectRoot, selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Editor } from "./Editor";
import * as EditorSlice from "redux/slices/editor";
import { Duration, Tick, Timing, Velocity } from "types/units";
import { EditorId, EditorState } from "types/editor";
import { durationToTicks } from "appUtil";

function mapStateToProps(state: RootState) {
  const { selectedPatternId, showingTour } = selectRoot(state);
  const editor = selectEditor(state);
  const adding = editor.state === "adding";
  const inserting = editor.state === "inserting";
  const removing = editor.state === "removing";

  const transport = selectTransport(state);

  const noteTicks = durationToTicks(editor.noteDuration, {
    dotted: editor.noteTiming === "dotted",
    triplet: editor.noteTiming === "triplet",
  });

  return {
    selectedPatternId,
    ...editor,
    noteTicks,
    adding,
    inserting,
    removing,
    transport,
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
    setRecordingLength: (length: Tick) => {
      dispatch(EditorSlice.setEditorRecordingLength(length));
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
export * from "./Editor";
