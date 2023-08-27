import ContextMenu from "components/ContextMenu";
import { ConnectedProps, connect } from "react-redux";
import { selectPattern, selectRoot, selectTrack } from "redux/selectors";
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
import { Row } from ".";
import { UndoTypes } from "redux/undoTypes";
import { isPatternTrack } from "types/tracks";
import { addTransformToTimeline } from "redux/thunks/transforms";

const mapStateToProps = (state: RootState) => {
  const {
    clipboard,
    toolkit,
    selectedPatternId,
    selectedTrackId,
    selectedClipIds,
    selectedTransformIds,
  } = selectRoot(state);

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

  const canUndo = state.timeline.past.length > 0;
  const canRedo = state.timeline.future.length > 0;

  return {
    selectedTrack,
    isPatternTrackSelected,
    selectedPattern,
    areClipsSelected,
    areTransformsSelected,
    isSelectionEmpty,
    isClipboardEmpty,
    canUndo,
    canRedo,
    N: toolkit?.chromaticTranspose,
    T: toolkit?.scalarTranspose,
    t: toolkit?.chordalTranspose,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    undoTimeline: () => dispatch({ type: UndoTypes.undoTimeline }),
    redoTimeline: () => dispatch({ type: UndoTypes.redoTimeline }),

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
  const menuOptions = [
    {
      label: "Undo Last Action",
      onClick: props.undoTimeline,
      disabled: !props.canUndo,
    },
    {
      label: "Redo Last Action",
      onClick: props.redoTimeline,
      disabled: !props.canRedo,
      divideEnd: true,
    },
    {
      label: "Select All Objects",
      onClick: props.selectAllClipsAndTransforms,
    },
    {
      label: `Cut Selection`,
      onClick: props.cutClipsAndTransforms,
      disabled: props.isSelectionEmpty,
    },
    {
      label: `Copy Selection`,
      onClick: props.copyClipsAndTransforms,
      disabled: props.isSelectionEmpty,
    },
    {
      label: `Paste From Clipboard`,
      onClick: () => props.pasteClipsAndTransforms(props.rows),
      disabled: props.isClipboardEmpty || !props.selectedTrack,
    },
    {
      label: `Delete Selection`,
      onClick: props.deleteClipsAndTransforms,
      disabled: props.isSelectionEmpty,
    },
    {
      label: `Export Selection to MIDI`,
      onClick: props.exportClips,
      disabled: !props.areClipsSelected,
      divideEnd: true,
    },
    {
      label: "Add Scale Track",
      onClick: props.addScaleTrack,
    },
    {
      label: "Add Pattern Track",
      onClick: props.addPatternTrack,
      disabled: !props.selectedTrack,
    },
    {
      label: `Add ${props.selectedPattern?.name ?? "New Pattern"}`,
      onClick: props.addPattern,
      disabled: !props.isPatternTrackSelected,
    },
    {
      label: `Add Transform ${
        props.selectedTrack ? `(N${props.N}, T${props.T}, t${props.t})` : ""
      }`,
      onClick: () => props.addTransform(),
      disabled: !props.selectedTrack,
    },
  ];
  return <ContextMenu targetId="timeline" options={menuOptions} />;
}
