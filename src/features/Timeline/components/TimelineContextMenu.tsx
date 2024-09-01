import classNames from "classnames";
import { ContextMenuOption, ContextMenu } from "components/ContextMenu";
import {
  use,
  useProjectDeepSelector,
  useProjectDispatch,
  useProjectSelector,
} from "types/hooks";
import { useState } from "react";
import { blurOnEnter } from "utils/html";
import { PPQ } from "utils/durations";
import { updateClips } from "types/Clip/ClipSlice";
import {
  PatternClipColor,
  PATTERN_CLIP_THEMES,
  PATTERN_CLIP_COLORS,
} from "types/Clip/PatternClip/PatternClipThemes";
import { isScaleTrack } from "types/Track/TrackTypes";
import {
  selectSelectedPatternClips,
  selectSelectedPoseClips,
  selectSelectedScaleClips,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedPose,
  selectSelectedTrack,
  selectClipboard,
  selectSelectedMotif,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { createPatternTrackFromSelectedTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { createScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  cutSelectedMedia,
  copySelectedMedia,
  pasteSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  updateMedia,
} from "types/Media/MediaThunks";
import { createClipFromMediaDraft } from "types/Timeline/thunks/TimelineDraftThunks";
import { exportSelectedClipsToMIDI } from "types/Timeline/thunks/TimelineSelectionThunks";
import { getTransport } from "tone";

export function TimelineContextMenu() {
  const dispatch = useProjectDispatch();

  // Get the currently selected objects
  const patternClips = useProjectDeepSelector(selectSelectedPatternClips);
  const poseClips = useProjectDeepSelector(selectSelectedPoseClips);
  const scaleClips = useProjectDeepSelector(selectSelectedScaleClips);
  const clips = useProjectDeepSelector(selectSelectedClips);
  const pattern = useProjectSelector(selectSelectedPattern);
  const pose = useProjectSelector(selectSelectedPose);
  const track = useProjectSelector(selectSelectedTrack);
  const onScaleTrack = isScaleTrack(track);

  // Get the clipboard
  const clipboard = useProjectDeepSelector(selectClipboard) ?? [];
  const areClipsInBoard = !!clipboard?.clips?.length;
  const arePortalsInBoard = !!clipboard?.portals?.length;

  // Get the selected media
  const arePatternClipsSelected = patternClips?.length > 0;
  const arePoseClipsSelected = poseClips?.length > 0;
  const areScaleClipsSelected = scaleClips?.length > 0;
  const areClipsSelected =
    arePatternClipsSelected || arePoseClipsSelected || areScaleClipsSelected;
  const arePortalsSelected = arePortalsInBoard;
  const isSelectionEmpty = !areClipsSelected && !arePortalsSelected;
  const isBoardEmpty = !areClipsInBoard && !arePortalsInBoard;

  // Determine which actions are available
  const canCut = !isSelectionEmpty;
  const canCopy = !isSelectionEmpty;
  const canPaste = !isBoardEmpty && track && !(areClipsInBoard && onScaleTrack);
  const canDuplicate = !isSelectionEmpty && track;
  const canDelete = !isSelectionEmpty;
  const canExport = arePatternClipsSelected;
  const canColor = arePatternClipsSelected;
  const canSetDuration = areClipsSelected;

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
    divideEnd: !canDelete && !canExport,
  };

  // Delete the currently selected media
  const Delete = {
    label: `Delete Selection`,
    onClick: () => dispatch(deleteSelectedMedia()),
    disabled: !canDelete,
    divideEnd: !canExport,
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
    divideEnd: true,
  };

  // Add the currently drafted motif to the timeline
  const type = use(selectTimelineType);
  const motif = use(selectSelectedMotif);
  const AddClip = motif
    ? {
        label: `Add ${motif?.name ?? "Motif"} Clip`,
        onClick: () =>
          dispatch(
            createClipFromMediaDraft({
              data: {
                type,
                [`${type}Id`]: motif.id,
                trackId: track?.id,
                tick: getTransport().ticks,
              },
            })
          ),
        disabled: (type === "pattern" && onScaleTrack) || !track,
        divideEnd: areClipsSelected,
      }
    : null;

  // Change the color of the currently selected clips
  const ClipColorCircle: React.FC<{ color: PatternClipColor }> = ({
    color,
  }) => {
    return (
      <span
        className={classNames(
          PATTERN_CLIP_THEMES[color].iconColor,
          `w-4 h-4 m-1 rounded-full border cursor-pointer`
        )}
        onClick={() => {
          const newClips = patternClips.map((clip) => ({ ...clip, color }));
          dispatch(updateClips({ data: newClips }));
        }}
      />
    );
  };

  // Show the color options for the currently selected clips
  const ClipColors = {
    label: (
      <div className="w-32 flex flex-wrap">
        {PATTERN_CLIP_COLORS.map((color) => (
          <ClipColorCircle key={color} color={color} />
        ))}
      </div>
    ),
    onClick: () => null,
    disabled: !canColor,
    divideEnd: canColor && canSetDuration,
  };

  // Set the duration of the currently selected clips
  const [duration, setDuration] = useState(PPQ);
  const SetClipDuration = {
    label: "Set Clip Duration",
    onClick: () => {
      const newClips = clips.map((clip) => ({ ...clip, duration }));
      dispatch(updateMedia({ data: { clips: newClips } }));
    },
    disabled: !canSetDuration,
  };
  const SetDurationInput = {
    label: (
      <>
        Duration:{" "}
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          onKeyDown={blurOnEnter}
          className="ml-1 w-12 h-6 p-1 text-center text-slate-900 bg-slate-50 rounded"
        />
      </>
    ),
    onClick: (e: MouseEvent) => e.stopPropagation(),
    disabled: !canSetDuration,
  };

  // Assemble all of the menu options
  const menuOptions = [
    // Undo,
    // Redo,
    canCut ? Cut : null,
    canCopy ? Copy : null,
    canPaste ? Paste : null,
    canDuplicate ? Duplicate : null,
    canDelete ? Delete : null,
    canExport ? Export : null,
    AddScaleTrack,
    AddPatternTrack,
    AddClip,
    canColor ? ClipColors : null,
    canSetDuration ? SetDurationInput : null,
    canSetDuration ? SetClipDuration : null,
  ];

  // Filter out the null options
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];

  // Render the context menu
  return <ContextMenu targetId="timeline" options={options} />;
}
