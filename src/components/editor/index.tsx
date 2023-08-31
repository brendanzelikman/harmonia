import { connect, ConnectedProps } from "react-redux";
import { selectEditor, selectRoot, selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Editor } from "./Editor";
import {
  showEditor,
  hideEditor,
  setEditorState,
  setEditorNoteTiming,
  setEditorNoteDuration,
} from "redux/slices/editor";
import { Duration, Timing } from "types/units";
import { EditorId, EditorState } from "types/editor";

function mapStateToProps(state: RootState) {
  const { selectedPatternId, showingTour } = selectRoot(state);
  const editor = selectEditor(state);
  const adding = editor.state === "adding";
  const inserting = editor.state === "inserting";
  const removing = editor.state === "removing";

  const transport = selectTransport(state);

  return {
    selectedPatternId,
    ...editor,
    adding,
    inserting,
    removing,
    transport,
    showingTour,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    showEditor: (id: EditorId) => dispatch(showEditor({ id })),
    hideEditor: () => dispatch(hideEditor()),
    setState: (action: EditorState) => dispatch(setEditorState(action)),
    clear: () => dispatch(setEditorState("idle")),
    setNoteDuration: (duration: Duration) =>
      dispatch(setEditorNoteDuration(duration)),
    setNoteTiming: (timing: Timing) => dispatch(setEditorNoteTiming(timing)),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorProps extends Props {}

export default connector(Editor);
