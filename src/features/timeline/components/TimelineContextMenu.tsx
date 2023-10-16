import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { ConnectedProps, connect } from "react-redux";
import {
  selectDraftedTransposition,
  selectMediaClipboard,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedTrack,
  selectSelectedTrackId,
  selectSelectedTranspositions,
  selectTrackScale,
} from "redux/selectors";
import { AppDispatch, Project } from "redux/store";
import {
  addClipToTimeline,
  createPatternTrackFromSelectedTrack,
  createScaleTrack,
  exportSelectedClipsToMIDI,
} from "redux/thunks";
import { UndoTypes } from "redux/undoTypes";
import { addTranspositionToTimeline } from "redux/Timeline";
import { updateClips } from "redux/Clip";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffset,
} from "types/Transposition";
import { CLIP_THEMES, CLIP_COLORS, Clip, ClipColor } from "types/Clip";
import { isPatternTrack } from "types/PatternTrack";
import { isScaleTrack } from "types/ScaleTrack";
import {
  copySelectedMedia,
  cutSelectedMedia,
  pasteSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  selectAllMedia,
} from "redux/Media";
import { useDeepEqualSelector } from "redux/hooks";

const mapStateToProps = (state: Project) => {
  const selectedTrackId = selectSelectedTrackId(state);

  const clipboard = selectMediaClipboard(state);
  const selectedPattern = selectSelectedPattern(state);
  const selectedTrack = selectSelectedTrack(state);

  const isPatternTrackSelected = selectedTrack && isPatternTrack(selectedTrack);

  const areClipsInClipboard = clipboard?.clips?.length > 0;
  const areTranspositionsInClipboard = clipboard?.transpositions?.length > 0;
  const isClipboardEmpty =
    !areClipsInClipboard && !areTranspositionsInClipboard;

  const { offsets } = selectDraftedTransposition(state);
  const chromaticTranspose = getChromaticOffset(offsets);
  const scalarTranspose = getScalarOffset(offsets, selectedTrackId);
  const chordalTranspose = getChordalOffset(offsets);
  const canUndo = state.arrangement.past.length > 0;
  const canRedo = state.arrangement.future.length > 0;
  return {
    areClipsInClipboard,
    areTranspositionsInClipboard,
    isClipboardEmpty,
    canUndo,
    canRedo,
    selectedTrack,
    isPatternTrackSelected,
    selectedPattern,
    chromaticTranspose,
    scalarTranspose,
    chordalTranspose,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    undoArrangement: () => dispatch({ type: UndoTypes.undoArrangement }),
    redoArrangement: () => dispatch({ type: UndoTypes.redoArrangement }),
    copyMedia: () => dispatch(copySelectedMedia()),
    cutMedia: () => dispatch(cutSelectedMedia()),
    pasteMedia: () => dispatch(pasteSelectedMedia()),
    duplicateMedia: () => dispatch(duplicateSelectedMedia()),
    deleteMedia: () => dispatch(deleteSelectedMedia()),
    selectAllMedia: () => dispatch(selectAllMedia()),
    exportClips: () => dispatch(exportSelectedClipsToMIDI()),
    addPattern: () => dispatch(addClipToTimeline()),
    addPatternTrack: () => dispatch(createPatternTrackFromSelectedTrack()),
    addScaleTrack: () => dispatch(createScaleTrack()),
    addTransposition: () => dispatch(addTranspositionToTimeline()),
    updateClips: (clips: Partial<Clip>[]) => dispatch(updateClips({ clips })),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TimelineContextMenuProps = ConnectedProps<typeof connector>;

interface Props extends TimelineContextMenuProps {}

export default connector(TimelineContextMenu);

function TimelineContextMenu(props: Props) {
  const clips = useDeepEqualSelector(selectSelectedClips);
  const transpositions = useDeepEqualSelector(selectSelectedTranspositions);
  const areClipsSelected = clips?.length > 0;
  const areTranspositionsSelected = transpositions?.length > 0;
  const isSelectionEmpty = !areClipsSelected && !areTranspositionsSelected;
  const canCut = !isSelectionEmpty;
  const canCopy = !isSelectionEmpty;
  const canPaste =
    !props.isClipboardEmpty &&
    props.selectedTrack &&
    (isScaleTrack(props.selectedTrack) ? !props.areClipsInClipboard : true);
  const canDuplicate = !isSelectionEmpty && props.selectedTrack;
  const canDelete = !isSelectionEmpty;
  const canExport = areClipsSelected;

  const canColor = areClipsSelected;
  const selectedScale = useDeepEqualSelector((state) =>
    selectTrackScale(state, props.selectedTrack?.id)
  );
  const Undo = {
    label: "Undo Last Action",
    onClick: props.undoArrangement,
    disabled: !props.canUndo,
  };
  const Redo = {
    label: "Redo Last Action",
    onClick: props.redoArrangement,
    disabled: !props.canRedo,
    divideEnd: true,
  };
  const Cut = {
    label: `Cut Selection`,
    onClick: props.cutMedia,
    disabled: !canCut,
  };
  const Copy = {
    label: `Copy Selection`,
    onClick: props.copyMedia,
    disabled: !canCopy,
  };
  const Paste = {
    label: `Paste From Clipboard`,
    onClick: () => props.pasteMedia(),
    disabled: !canPaste,
    divideEnd: !canDuplicate && !canDelete && !canExport,
  };
  const Duplicate = {
    label: "Duplicate Selection",
    onClick: () => props.duplicateMedia(),
    disabled: !canDuplicate,
  };
  const Delete = {
    label: `Delete Selection`,
    onClick: props.deleteMedia,
    disabled: !canDelete,
  };
  const Export = {
    label: "Export to MIDI",
    onClick: props.exportClips,
    disabled: !canExport,
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
            props.selectedTrack && selectedScale
              ? `, T${props.scalarTranspose}, `
              : `, `
          }t${props.chordalTranspose})`
        : "Transposition"
    }`,
    onClick: () => props.addTransposition(),
    disabled: !props.selectedTrack,
    divideEnd: canColor,
  };

  const ClipColorCircle = ({ color }: { color: ClipColor }) => {
    const clipColor = CLIP_THEMES[color].iconColor;
    return (
      <span
        className={`w-4 h-4 m-1 rounded-full ${clipColor} border cursor-pointer`}
        onClick={() =>
          props.updateClips(clips.map((clip) => ({ ...clip, color })))
        }
      />
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
    disabled: !canColor,
  };

  const menuOptions = [
    Undo,
    Redo,
    canCut ? Cut : null,
    canCopy ? Copy : null,
    canPaste ? Paste : null,
    canDuplicate ? Duplicate : null,
    canDelete ? Delete : null,
    canExport ? Export : null,
    AddScaleTrack,
    AddPatternTrack,
    AddPattern,
    AddTransposition,
    canColor ? ClipColor : null,
  ];
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];
  return <ContextMenu targetId="timeline" options={options} />;
}
