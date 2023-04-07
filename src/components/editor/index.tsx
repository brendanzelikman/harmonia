import { connect, ConnectedProps } from "react-redux";
import { selectRoot, selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Editor } from "./Editor";

function mapStateToProps(state: RootState) {
  const { showEditor, editorState, activePatternId } = selectRoot(state);
  const transport = selectTransport(state);

  return {
    activePatternId,
    showEditor,
    editorState,
    transport,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {};
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorProps extends Props {}

export default connector(Editor);
