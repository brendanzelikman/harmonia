import { getPatternClipTheme } from "types/Clip/PatternClip/PatternClipFunctions";
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { CLIP_NAME_HEIGHT, CLIP_STREAM_MARGIN } from "utils/constants";
import { useSelect } from "hooks/useStore";
import {
  selectCellsPerTick,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { selectPortaledPatternClipRange } from "types/Arrangement/ArrangementClipSelectors";
import { PortaledPatternClip } from "types/Clip/ClipTypes";

interface ClipStyleProps {
  clip: PortaledPatternClip;
}

export const usePatternClipStreamStyle = (props: ClipStyleProps) => {
  const { clip } = props;
  const { id, trackId, duration, tick } = clip;
  const noteWidth = useSelect(selectCellsPerTick);

  // Get the height of the stream based on the track
  const height =
    useSelect((_) => selectTrackHeight(_, trackId)) - POSE_NOTCH_HEIGHT;
  const streamHeight = height - CLIP_NAME_HEIGHT - CLIP_STREAM_MARGIN;

  // Get the height of the note based on the range
  let { min, max } = useSelect((_) => selectPortaledPatternClipRange(_, id));
  const streamRange = Math.max(max - min) + 1;
  let noteHeight = streamHeight / streamRange;

  // If the stream has one note, center it
  if (min === max) {
    noteHeight /= 2;
    min -= 0.5;
  }

  // Get the colors based on the clip theme
  const { noteColor, bodyColor } = getPatternClipTheme(clip);
  const streamClass = `group size-full relative flex overflow-hidden ${bodyColor}`;
  const noteClass = `absolute border border-slate-950/80 opacity-80 rounded ${noteColor}`;

  return { streamClass, noteClass, duration, tick, min, noteWidth, noteHeight };
};
