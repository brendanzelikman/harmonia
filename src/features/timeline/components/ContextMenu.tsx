import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { ConnectedProps, connect } from "react-redux";
import {
  selectPattern,
  selectRoot,
  selectTimeline,
  selectTrack,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import {
  addSelectedPatternToTimeline,
  copySelectedClipsAndTransforms,
  createPatternTrackFromSelectedTrack,
  createScaleTrack,
  cutSelectedClipsAndTransforms,
  deleteSelectedClipsAndTransforms,
  exportSelectedClipsToMidi,
  pasteSelectedClipsAndTransforms,
  selectAllClipsAndTransforms,
} from "redux/thunks";
import { Row } from "..";
import { UndoTypes } from "redux/undoTypes";
import { isPatternTrack, isScaleTrack } from "types/tracks";
import { addTransformToTimeline } from "redux/thunks/transforms";

const mapStateToProps = (state: RootState) => {
  const {
    toolkit,
    selectedPatternId,
    selectedTrackId,
    selectedClipIds,
    selectedTransformIds,
  } = selectRoot(state);

  const { clipboard } = selectTimeline(state);

  const selectedPattern = selectedPatternId
    ? selectPattern(state, selectedPatternId)
    : undefined;
  const selectedTrack = selectedTrackId
    ? selectTrack(state, selectedTrackId)
    : undefined;

  const isPatternTrackSelected = selectedTrack && isPatternTrack(selectedTrack);

  const areClipsSelected = selectedClipIds?.length > 0;
  const areTransformsSelected = selectedTransformIds?.length > 0;
  const isSelectionEmpty = !areClipsSelected && !areTransformsSelected;

  const areClipsInClipboard = clipboard?.clips?.length > 0;
  const areTransformsInClipboard = clipboard?.transforms?.length > 0;
  const isClipboardEmpty = !areClipsInClipboard && !areTransformsInClipboard;

  const canCut = !isSelectionEmpty;
  const canCopy = !isSelectionEmpty;
  const canPaste =
    !isClipboardEmpty &&
    selectedTrack &&
    (isScaleTrack(selectedTrack) ? !areClipsInClipboard : true);
  const canDuplicate = !isSelectionEmpty && selectedTrack;
  const canDelete = !isSelectionEmpty;
  const canExport = areClipsSelected;
  const canUndo = state.session.past.length > 0;
  const canRedo = state.session.future.length > 0;

  return {
    selectedTrack,
    isPatternTrackSelected,
    selectedPattern,
    canCut,
    canCopy,
    canPaste,
    canDuplicate,
    canDelete,
    canExport,
    canUndo,
    canRedo,
    N: toolkit?.chromaticTranspose,
    T: toolkit?.scalarTranspose,
    t: toolkit?.chordalTranspose,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    undoSession: () => dispatch({ type: UndoTypes.undoSession }),
    redoSession: () => dispatch({ type: UndoTypes.redoSession }),

    copyClipsAndTransforms: () => dispatch(copySelectedClipsAndTransforms()),
    cutClipsAndTransforms: () => dispatch(cutSelectedClipsAndTransforms()),
    pasteClipsAndTransforms: (rows: Row[]) =>
      dispatch(pasteSelectedClipsAndTransforms(rows)),
    deleteClipsAndTransforms: () =>
      dispatch(deleteSelectedClipsAndTransforms()),
    selectAllClipsAndTransforms: () => dispatch(selectAllClipsAndTransforms()),
    exportClips: () => dispatch(exportSelectedClipsToMidi()),

    addPattern: () => dispatch(addSelectedPatternToTimeline()),
    addPatternTrack: () => dispatch(createPatternTrackFromSelectedTrack()),
    addScaleTrack: () => dispatch(createScaleTrack()),
    addTransform: () => dispatch(addTransformToTimeline()),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TimelineContextMenuProps = ConnectedProps<typeof connector>;

interface Props extends TimelineContextMenuProps {
  rows: Row[];
}

export default connector(TimelineContextMenu);

function TimelineContextMenu(props: Props) {
  const Undo = {
    label: "Undo Last Action",
    onClick: props.undoSession,
    disabled: !props.canUndo,
  };
  const Redo = {
    label: "Redo Last Action",
    onClick: props.redoSession,
    disabled: !props.canRedo,
    divideEnd: true,
  };
  const Cut = {
    label: `Cut Selection`,
    onClick: props.cutClipsAndTransforms,
    disabled: !props.canCut,
  };
  const Copy = {
    label: `Copy Selection`,
    onClick: props.copyClipsAndTransforms,
    disabled: !props.canCopy,
  };
  const Paste = {
    label: `Paste From Clipboard`,
    onClick: () => props.pasteClipsAndTransforms(props.rows),
    disabled: !props.canPaste,
    divideEnd: !props.canDuplicate && !props.canDelete && !props.canExport,
  };
  const Duplicate = {
    label: "Duplicate Selection",
    onClick: () => props.pasteClipsAndTransforms(props.rows),
    disabled: !props.canDuplicate,
  };
  const Delete = {
    label: `Delete Selection`,
    onClick: props.deleteClipsAndTransforms,
    disabled: !props.canDelete,
  };
  const Export = {
    label: "Export to MIDI",
    onClick: props.exportClips,
    disabled: !props.canExport,
    divideEnd: true,
  };
  const AddScaleTrack = {
    label: "Add Scale Track",
    onClick: props.addScaleTrack,
  };
  const AddPatternTrack = {
    label: "Add Pattern Track",
    onClick: props.addPatternTrack,
    disabled: !props.selectedTrack,
  };
  const AddPattern = {
    label: `Add ${props.selectedPattern?.name ?? "New Pattern"}`,
    onClick: props.addPattern,
    disabled: !props.isPatternTrackSelected,
  };
  const AddTransform = {
    label: `Add Transform ${
      props.selectedTrack ? `(N${props.N}, T${props.T}, t${props.t})` : ""
    }`,
    onClick: () => props.addTransform(),
    disabled: !props.selectedTrack,
  };

  const menuOptions = [
    Undo,
    Redo,
    props.canCut ? Cut : null,
    props.canCopy ? Copy : null,
    props.canPaste ? Paste : null,
    props.canDuplicate ? Duplicate : null,
    props.canDelete ? Delete : null,
    props.canExport ? Export : null,
    AddScaleTrack,
    AddPatternTrack,
    AddPattern,
    AddTransform,
  ];
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];
  return <ContextMenu targetId="timeline" options={options} />;
}
