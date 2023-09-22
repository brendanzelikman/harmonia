import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { ConnectedProps, connect } from "react-redux";
import {
  selectPattern,
  selectRoot,
  selectTimeline,
  selectTrack,
  selectTrackScale,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import {
  addSelectedPatternToTimeline,
  copySelectedClipsAndTranspositions,
  createPatternTrackFromSelectedTrack,
  createScaleTrack,
  cutSelectedClipsAndTranspositions,
  deleteSelectedClipsAndTranspositions,
  duplicateSelectedClipsAndTranspositions,
  exportSelectedClipsToMidi,
  pasteSelectedClipsAndTranspositions,
  selectAllClipsAndTranspositions,
} from "redux/thunks";
import { Row } from "..";
import { UndoTypes } from "redux/undoTypes";
import { isPatternTrack, isScaleTrack } from "types/tracks";
import { addTranspositionToTimeline } from "redux/thunks/transpositions";
import { CLIP_COLORS, CLIP_THEMES, Clip, ClipColor } from "types";
import { updateClips } from "redux/slices/clips";
import {
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
} from "types/transposition";

const mapStateToProps = (state: RootState) => {
  const {
    toolkit,
    selectedPatternId,
    selectedTrackId,
    selectedClipIds,
    selectedTranspositionIds,
  } = selectRoot(state);

  const { clipboard } = selectTimeline(state);
  const selectedPattern = selectPattern(state, selectedPatternId);
  const selectedTrack = selectTrack(state, selectedTrackId);
  const selectedScale = selectTrackScale(state, selectedTrackId);

  const isPatternTrackSelected = selectedTrack && isPatternTrack(selectedTrack);
  const areClipsSelected = selectedClipIds?.length > 0;
  const areTranspositionsSelected = selectedTranspositionIds?.length > 0;
  const isSelectionEmpty = !areClipsSelected && !areTranspositionsSelected;

  const areClipsInClipboard = clipboard?.clips?.length > 0;
  const areTranspositionsInClipboard = clipboard?.transpositions?.length > 0;
  const isClipboardEmpty =
    !areClipsInClipboard && !areTranspositionsInClipboard;

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
  const canColor = areClipsSelected;

  const { transpositionOffsets } = toolkit;
  const chromaticTranspose = getChromaticTranspose(transpositionOffsets);
  const scalarTranspose = getScalarTranspose(
    transpositionOffsets,
    selectedScale?.id
  );
  const chordalTranspose = getChordalTranspose(transpositionOffsets);

  return {
    selectedTrack,
    selectedScale,
    isPatternTrackSelected,
    selectedPattern,
    selectedClipIds,
    canCut,
    canCopy,
    canPaste,
    canDuplicate,
    canDelete,
    canExport,
    canUndo,
    canRedo,
    canColor,
    chromaticTranspose,
    scalarTranspose,
    chordalTranspose,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    undoSession: () => dispatch({ type: UndoTypes.undoSession }),
    redoSession: () => dispatch({ type: UndoTypes.redoSession }),
    copyClipsAndTranspositions: () =>
      dispatch(copySelectedClipsAndTranspositions()),
    cutClipsAndTranspositions: () =>
      dispatch(cutSelectedClipsAndTranspositions()),
    pasteClipsAndTranspositions: (rows: Row[]) =>
      dispatch(pasteSelectedClipsAndTranspositions(rows)),
    duplicateClipsAndTranspositions: () =>
      dispatch(duplicateSelectedClipsAndTranspositions()),
    deleteClipsAndTranspositions: () =>
      dispatch(deleteSelectedClipsAndTranspositions()),
    selectAllClipsAndTranspositions: () =>
      dispatch(selectAllClipsAndTranspositions()),
    exportClips: () => dispatch(exportSelectedClipsToMidi()),
    addPattern: () => dispatch(addSelectedPatternToTimeline()),
    addPatternTrack: () => dispatch(createPatternTrackFromSelectedTrack()),
    addScaleTrack: () => dispatch(createScaleTrack()),
    addTransposition: () => dispatch(addTranspositionToTimeline()),
    updateClips: (clips: Partial<Clip>[]) => dispatch(updateClips({ clips })),
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
    onClick: props.cutClipsAndTranspositions,
    disabled: !props.canCut,
  };
  const Copy = {
    label: `Copy Selection`,
    onClick: props.copyClipsAndTranspositions,
    disabled: !props.canCopy,
  };
  const Paste = {
    label: `Paste From Clipboard`,
    onClick: () => props.pasteClipsAndTranspositions(props.rows),
    disabled: !props.canPaste,
    divideEnd: !props.canDuplicate && !props.canDelete && !props.canExport,
  };
  const Duplicate = {
    label: "Duplicate Selection",
    onClick: () => props.duplicateClipsAndTranspositions(),
    disabled: !props.canDuplicate,
  };
  const Delete = {
    label: `Delete Selection`,
    onClick: props.deleteClipsAndTranspositions,
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
  const AddTransposition = {
    label: `Add ${
      props.selectedTrack
        ? `(N${props.chromaticTranspose}${
            props.selectedTrack && props.selectedScale
              ? `, T${props.scalarTranspose}, `
              : `, `
          }t${props.chordalTranspose})`
        : "Transposition"
    }`,
    onClick: () => props.addTransposition(),
    disabled: !props.selectedTrack,
    divideEnd: props.canColor,
  };

  const ClipColorCircle = ({ color }: { color: ClipColor }) => {
    const clipColor = CLIP_THEMES[color].iconColor;
    return (
      <span
        className={`w-4 h-4 m-1 rounded-full ${clipColor} border cursor-pointer`}
        onClick={() =>
          props.updateClips(props.selectedClipIds.map((id) => ({ id, color })))
        }
      ></span>
    );
  };

  const ClipColor = {
    label: (
      <div className="w-32 flex flex-wrap">
        {CLIP_COLORS.map((color) => (
          <ClipColorCircle key={color} color={color} />
        ))}
      </div>
    ),
    onClick: () => null,
    disabled: !props.canColor,
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
    AddTransposition,
    props.canColor ? ClipColor : null,
  ];
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];
  return <ContextMenu targetId="timeline" options={options} />;
}
