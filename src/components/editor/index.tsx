import { connect, ConnectedProps } from "react-redux";
import { selectRoot, selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Editor } from "./Editor";
import { hideEditor, showEditor } from "redux/slices/root";

function mapStateToProps(state: RootState) {
  const { showingEditor, editorState, selectedPatternId } = selectRoot(state);
  const transport = selectTransport(state);

  return {
    selectedPatternId,
    showingEditor,
    editorState,
    transport,
    tour: state.tour,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    showEditor: (id: string) => dispatch(showEditor({ id })),
    hideEditor: () => dispatch(hideEditor()),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorProps extends Props {}

export default connector(Editor);
