import { getPatternClipTheme } from "types/Clip/PatternClip/PatternClipFunctions";
import { POSE_HEIGHT } from "utils/constants";
import { CLIP_NAME_HEIGHT, CLIP_STREAM_MARGIN } from "./usePatternClipRenderer";
import { useDeep } from "types/hooks";
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
  const { noteColor, bodyColor } = getPatternClipTheme(clip);

  const streamClass = `group size-full relative flex overflow-hidden ${bodyColor}`;
  const noteClass = `absolute border border-slate-950/80 opacity-80 rounded ${noteColor}`;

  let { min, max } = useDeep((_) => selectPortaledPatternClipRange(_, id));
  const streamRange = Math.max(max - min) + 1;
  const isNote = max === min;

  const height = useDeep((_) => selectTrackHeight(_, trackId)) - POSE_HEIGHT;
  const streamHeight = height - CLIP_NAME_HEIGHT - CLIP_STREAM_MARGIN;
  const noteWidth = useDeep(selectCellsPerTick);
  const noteHeight = ((isNote ? 0.4 : 1) * streamHeight) / streamRange;
  if (isNote) min = min - 0.75;

  return { streamClass, noteClass, duration, tick, min, noteWidth, noteHeight };
};
