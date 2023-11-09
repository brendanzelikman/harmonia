import classNames from "classnames";
import { ContextMenuOption, ContextMenu } from "components/ContextMenu";
import { updateClips } from "redux/Clip";
import {
  copySelectedMedia,
  cutSelectedMedia,
  deleteSelectedMedia,
  duplicateSelectedMedia,
  pasteSelectedMedia,
} from "redux/Media";
import { createPatternTrackFromSelectedTrack } from "redux/PatternTrack";
import { createScaleTrack } from "redux/ScaleTrack";
import {
  createClipFromMediaDraft,
  createTranspositionFromMediaDraft,
  exportSelectedClipsToMIDI,
  selectDraftedPose,
  selectMediaClipboard,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedTrack,
  selectSelectedPoses,
} from "redux/Timeline";
import {
  useProjectDeepSelector,
  useProjectDispatch,
  useProjectSelector,
} from "redux/hooks";
import {
  selectArrangementFutureLength,
  selectArrangementPastLength,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { CLIP_THEMES, CLIP_COLORS, ClipColor } from "types/Clip";
import {
  getChordalOffset,
  getChromaticOffset,
  getTranspositionVectorAsString,
} from "types/Transposition";

export function TimelineContextMenu() {
  const dispatch = useProjectDispatch();

  // Get the currently selected objects
  const clips = useProjectDeepSelector(selectSelectedClips);
  const poses = useProjectDeepSelector(selectSelectedPoses);
  const pattern = useProjectSelector(selectSelectedPattern);
  const track = useProjectSelector(selectSelectedTrack);
  const onScaleTrack = track?.type === "patternTrack";

  // Get the drafted transposition
  const { vector } = useProjectDeepSelector(selectDraftedPose);
  const N = getChromaticOffset(vector);
  const chordalTranspose = getChordalOffset(vector);

  // Get the clipboard
  const clipboard = useProjectDeepSelector(selectMediaClipboard);
  const areClipsInBoard = clipboard?.clips?.length > 0;
  const arePosesInBoard = clipboard?.poses?.length > 0;
  const arePortalsInBoard = clipboard?.portals?.length > 0;

  // Get the selected media
  const areClipsSelected = clips?.length > 0;
  const arePosesSelected = poses?.length > 0;
  const arePortalsSelected = arePortalsInBoard;
  const isSelectionEmpty =
    !areClipsSelected && !arePosesSelected && !arePortalsSelected;
  const isBoardEmpty =
    !areClipsInBoard && !arePosesInBoard && !arePortalsInBoard;

  // Determine which actions are available
  const canUndo = useProjectSelector(selectArrangementPastLength);
  const canRedo = useProjectSelector(selectArrangementFutureLength);
  const canCut = !isSelectionEmpty;
  const canCopy = !isSelectionEmpty;
  const canPaste = !isBoardEmpty && track && !(areClipsInBoard && onScaleTrack);
  const canDuplicate = !isSelectionEmpty && track;
  const canDelete = !isSelectionEmpty;
  const canExport = areClipsSelected;
  const canColor = areClipsSelected;

  // Undo the last timeline action
  const Undo = {
    label: "Undo Last Action",
    onClick: () => dispatch({ type: UndoTypes.undoArrangement }),
    disabled: !canUndo,
  };

  // Redo the last timeline action
  const Redo = {
    label: "Redo Last Action",
    onClick: () => dispatch({ type: UndoTypes.redoArrangement }),
    disabled: !canRedo,
    divideEnd: true,
  };

  // Cut the currently selected media
  const Cut = {
    label: `Cut Selection`,
    onClick: () => dispatch(cutSelectedMedia()),
    disabled: !canCut,
  };

  // Copy the currently selected media
  const Copy = {
    label: `Copy Selection`,
    onClick: () => dispatch(copySelectedMedia()),
    disabled: !canCopy,
  };

  // Paste the currently selected media at the current track/time
  const Paste = {
    label: `Paste From Clipboard`,
    onClick: () => dispatch(pasteSelectedMedia()),
    disabled: !canPaste,
    divideEnd: !canDuplicate && !canDelete && !canExport,
  };

  // Duplicate the currently selected media
  const Duplicate = {
    label: "Duplicate Selection",
    onClick: () => dispatch(duplicateSelectedMedia()),
    disabled: !canDuplicate,
  };

  // Delete the currently selected media
  const Delete = {
    label: `Delete Selection`,
    onClick: () => dispatch(deleteSelectedMedia()),
    disabled: !canDelete,
  };

  // Export the currently selected clips to MIDI
  const Export = {
    label: "Export to MIDI",
    onClick: () => dispatch(exportSelectedClipsToMIDI()),
    disabled: !canExport,
    divideEnd: true,
  };

  // Add a scale track to the timeline
  const AddScaleTrack = {
    label: "Add Scale Track",
    onClick: () => dispatch(createScaleTrack()),
  };

  // Create a pattern track from the selected track
  const AddPatternTrack = {
    label: "Add Pattern Track",
    onClick: () => dispatch(createPatternTrackFromSelectedTrack()),
    disabled: !track,
  };

  // Add the currently drafted clip to the timeline
  const AddPattern = {
    label: `Add ${pattern?.name ?? "New Pattern"}`,
    onClick: () => dispatch(createClipFromMediaDraft()),
    disabled: onScaleTrack,
  };

  // Add the currently drafted transposition to the timeline
  const AddTransposition = {
    label: `Add ${
      track ? getTranspositionVectorAsString(vector) : "Transposition"
    }`,
    onClick: () => dispatch(createTranspositionFromMediaDraft()),
    disabled: !track,
    divideEnd: canColor,
  };

  // Change the color of the currently selected clips
  const ClipColorCircle: React.FC<{ color: ClipColor }> = ({ color }) => {
    return (
      <span
        className={classNames(
          CLIP_THEMES[color].iconColor,
          `w-4 h-4 m-1 rounded-full border cursor-pointer`
        )}
        onClick={() => {
          const newClips = clips.map((clip) => ({ ...clip, color }));
          dispatch(updateClips({ clips: newClips }));
        }}
      />
    );
  };

  // Show the color options for the currently selected clips
  const ClipColors = {
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

  // Assemble all of the menu options
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
    canColor ? ClipColors : null,
  ];

  // Filter out the null options
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];

  // Render the context menu
  return <ContextMenu targetId="timeline" options={options} />;
}
