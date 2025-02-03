import classNames from "classnames";
import { ContextMenuOption, ContextMenu } from "components/ContextMenu";
import {
  use,
  useDeep,
  useProjectDispatch,
  useProjectSelector,
} from "types/hooks";
import { useState } from "react";
import { blurOnEnter, cancelEvent } from "utils/html";
import { updateClips } from "types/Clip/ClipSlice";
import {
  PatternClipColor,
  PATTERN_CLIP_THEMES,
  PATTERN_CLIP_COLORS,
  DEFAULT_PATTERN_CLIP_COLOR,
} from "types/Clip/PatternClip/PatternClipThemes";
import { isScaleTrack } from "types/Track/TrackTypes";
import {
  selectSelectedPatternClips,
  selectSelectedPoseClips,
  selectSelectedScaleClips,
  selectSelectedClips,
  selectSelectedTrack,
  selectClipboard,
} from "types/Timeline/TimelineSelectors";
import {
  cutSelectedMedia,
  copySelectedMedia,
  pasteSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  updateMedia,
} from "types/Media/MediaThunks";
import { exportSelectedClipsToMIDI } from "types/Timeline/thunks/TimelineSelectionThunks";
import { getTicksPerBar } from "types/Transport/TransportFunctions";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";
import { sanitize } from "utils/math";
import { inputPoseVector } from "types/Pose/PoseThunks";

export function TimelineContextMenu() {
  const dispatch = useProjectDispatch();
  const bpm = use(selectTransportBPM);
  const timeSignature = use(selectTransportTimeSignature);

  // Get the currently selected objects
  const patternClips = useDeep(selectSelectedPatternClips);
  const poseClips = useDeep(selectSelectedPoseClips);
  const scaleClips = useDeep(selectSelectedScaleClips);
  const clips = useDeep(selectSelectedClips);
  const track = useProjectSelector(selectSelectedTrack);
  const onScaleTrack = isScaleTrack(track);

  // Get the clipboard
  const clipboard = useDeep(selectClipboard) ?? [];
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
  const canUpdatePoses = arePoseClipsSelected;

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
  };

  // Change the color of the currently selected clips
  const [color, setColor] = useState(DEFAULT_PATTERN_CLIP_COLOR);
  const ClipColorCircle: React.FC<{ color: PatternClipColor }> = (props) => {
    return (
      <span
        className={classNames(
          PATTERN_CLIP_THEMES[props.color].iconColor,
          color === props.color ? "ring" : "",
          `size-4 m-1 rounded-full border cursor-pointer`
        )}
        onClick={(e) => {
          cancelEvent(e);
          setColor(props.color);
        }}
      />
    );
  };

  // Show the color options for the currently selected clips
  const SetColor = {
    label: "Set Clip Color",
    onClick: () => {
      const newClips = patternClips.map((clip) => ({ ...clip, color }));
      dispatch(updateClips({ data: newClips }));
    },
    disabled: !canColor,
  };

  const InputColor = {
    label: (
      <div className="w-32 flex flex-wrap">
        {PATTERN_CLIP_COLORS.map((color) => (
          <ClipColorCircle key={color} color={color} />
        ))}
      </div>
    ),
    onClick: () => null,
    disabled: !canColor,
  };

  // Set the duration of the currently selected clips
  const [duration, setDuration] = useState("");
  const SetDuration = {
    label: "Set Clip Duration",
    onClick: () => {
      const value = sanitize(parseInt(duration));
      const newClips = clips.map((clip) => ({
        ...clip,
        duration: value ? getTicksPerBar(bpm, timeSignature) * value : Infinity,
      }));
      dispatch(updateMedia({ data: { clips: newClips } }));
    },
    disabled: !canSetDuration,
  };
  const InputDuration = {
    label: (
      <>
        Bar Count:{" "}
        <input
          type="text"
          placeholder="∞"
          value={duration}
          onChange={(e) => {
            const number = sanitize(parseInt(e.target.value));
            if (!number) setDuration("");
            else setDuration(e.target.value);
          }}
          onKeyDown={blurOnEnter}
          className="ml-1 mb-0.5 w-12 h-6 p-1 text-center bg-transparent text-slate-200 bg-slate-50 rounded"
        />
      </>
    ),
    onClick: (e: MouseEvent) => e.stopPropagation(),
    disabled: !canSetDuration,
  };

  const SetPoses = {
    label: "Set Pose Vectors",
    onClick: () => dispatch(inputPoseVector()),
    disabled: !canUpdatePoses,
  };

  // Assemble all of the menu options
  const menuOptions: ContextMenuOption[][] = [
    [Cut, Copy, Paste, Duplicate, Delete, Export],
    [InputColor, SetColor],
    [InputDuration, SetDuration],
    [SetPoses],
  ];

  // Filter out the null options
  const options = menuOptions.flatMap((options) => {
    const validOptions = options.filter((option) => !option.disabled);
    const count = validOptions.length;
    if (count < 2) return validOptions;
    const firstOptions = validOptions.slice(0, count - 1);
    const lastOption = validOptions[count - 1];
    return [...firstOptions, { ...lastOption, divideEnd: true }];
  });
  if (options.length) options[options.length - 1].divideEnd = false;

  // Render the context menu
  return <ContextMenu targetId="timeline" options={options} />;
}
