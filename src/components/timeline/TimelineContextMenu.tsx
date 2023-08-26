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
  pasteSelectedClipsAndTransforms,
  selectAllClipsAndTransforms,
} from "redux/thunks";
import { Row } from ".";
import { UndoTypes } from "redux/undoTypes";
import pluralize from "pluralize";
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

  const clipsName = pluralize("Clip", selectedClipIds.length);
  const transformsName = pluralize("Transform", selectedTransformIds.length);

  const areClipsSelected = selectedClipIds.length > 0;
  const areTransformsSelected = selectedTransformIds.length > 0;
  const clipLength = selectedClipIds.length;
  const transformLength = selectedTransformIds.length;
  const isSelectionEmpty = !areClipsSelected && !areTransformsSelected;

  const selectionName = `${
    areClipsSelected && areTransformsSelected
      ? `${clipLength} ${clipsName} and ${transformLength} ${transformsName}`
      : areClipsSelected
      ? `${clipLength} ${clipsName}`
      : areTransformsSelected
      ? `${transformLength} ${transformsName}`
      : "Timeline Objects"
  }`;

  const areClipsInClipboard = clipboard.clips.length > 0;
  const areTransformsInClipboard = clipboard.transforms.length > 0;
  const clipboardClipLength = clipboard.clips.length;
  const clipboardTransformLength = clipboard.transforms.length;
  const isClipboardEmpty = !areClipsInClipboard && !areTransformsInClipboard;

  const clipboardName = `${
    areClipsInClipboard && areTransformsInClipboard && selectedTrackId
      ? `${clipboardClipLength} ${clipsName} and ${clipboardTransformLength} ${transformsName}`
      : areClipsInClipboard && selectedTrackId
      ? `${clipboardClipLength} ${clipsName}`
      : areTransformsInClipboard && selectedTrackId
      ? `${clipboardTransformLength} ${transformsName}`
      : "Timeline Objects"
  }`;

  const canUndo = state.timeline.past.length > 0;
  const canRedo = state.timeline.future.length > 0;

  return {
    selectedTrack,
    isPatternTrackSelected,
    selectedPattern,
    areClipsSelected,
    areTransformsSelected,
    selectionName,
    clipboardName,
    isSelectionEmpty,
    isClipboardEmpty,
    canUndo,
    canRedo,
    N: toolkit.chromaticTranspose,
    T: toolkit.scalarTranspose,
    t: toolkit.chordalTranspose,
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
      label: "Select All Timeline Objects",
      onClick: props.selectAllClipsAndTransforms,
    },
    {
      label: `Cut ${props.selectionName}`,
      onClick: props.cutClipsAndTransforms,
      disabled: props.isSelectionEmpty,
    },
    {
      label: `Copy ${props.selectionName}`,
      onClick: props.copyClipsAndTransforms,
      disabled: props.isSelectionEmpty,
    },
    {
      label: `Paste ${props.clipboardName}`,
      onClick: () => props.pasteClipsAndTransforms(props.rows),
      disabled: props.isClipboardEmpty || !props.selectedTrack,
    },
    {
      label: `Delete ${props.selectionName}`,
      onClick: props.deleteClipsAndTransforms,
      disabled: props.isSelectionEmpty,
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
