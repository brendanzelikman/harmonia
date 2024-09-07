import { clamp } from "lodash";
import { getPatternClipTheme } from "types/Clip/PatternClip/PatternClipFunctions";
import { getMidiStreamMinMax } from "types/Pattern/PatternUtils";
import { POSE_HEIGHT, TRACK_WIDTH } from "utils/constants";
import { getTickColumns, Subdivision } from "utils/durations";
import {
  CLIP_NAME_HEIGHT,
  CLIP_STREAM_MARGIN,
  PatternClipRendererProps,
} from "./usePatternClipRenderer";
import {
  selectCellWidth,
  selectSubdivision,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { use, useDeep } from "types/hooks";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectOverlappingPortaledClipIds,
  selectPatternClipMidiStream,
} from "types/Arrangement/ArrangementSelectors";

interface PatternClipStyleProps extends PatternClipRendererProps {
  isDragging: boolean;
}

export const usePatternClipStyle = (
  props: PatternClipStyleProps
): ClipStyle => {
  const { clip, portaledClip, isAddingAny, isDragging } = props;
  const pcId = portaledClip?.id;
  const stream = useDeep((_) => selectPatternClipMidiStream(_, pcId));

  const subdivision = use(selectSubdivision);
  const cellWidth = use(selectCellWidth);

  const duration = clip.duration;
  const startTick = clip.tick;
  const endTick = clip.tick + (duration ?? 0);

  const theme = getPatternClipTheme(clip);
  const { noteColor, bodyColor, headerColor } = theme;

  const trackHeight = use((_) => selectTrackHeight(_, clip?.trackId));
  const trackTop = use((_) => selectTrackTop(_, clip?.trackId));

  const clipIds = useDeep((_) => selectOverlappingPortaledClipIds(_, pcId));
  const isShort = !!clipIds.length || isAddingAny || isDragging;

  const height = isShort ? trackHeight - POSE_HEIGHT : trackHeight;
  const top = trackTop + (isShort ? POSE_HEIGHT : 0);
  const width = (getTickColumns(duration, subdivision) || 1) * cellWidth;
  const streamHeight = height - CLIP_NAME_HEIGHT - CLIP_STREAM_MARGIN;

  const { min: streamMin, max: streamMax } = getMidiStreamMinMax(stream);
  const streamRange = Math.max(streamMax - streamMin, 1);
  const streamLength = stream?.length ?? 0;

  const noteHeight = clamp(streamHeight / streamRange, 4, 20);
  const fontSize = Math.min(12, noteHeight) - 4;

  const columns = getTickColumns(clip?.tick, subdivision);
  const left = TRACK_WIDTH + Math.round(columns * cellWidth);

  return {
    duration,
    startTick,
    endTick,
    top,
    left,
    width,
    height,
    noteHeight,
    fontSize,
    streamHeight,
    streamMin,
    streamMax,
    streamRange,
    streamLength,
    cellWidth,
    subdivision,
    noteColor,
    bodyColor,
    headerColor,
  };
};

export interface ClipStyle {
  duration: number;
  startTick: number;
  endTick: number;
  top: number;
  left: number;
  width: number;
  height: number;
  noteHeight: number;
  fontSize: number;
  streamHeight: number;
  streamMin: number;
  streamMax: number;
  streamRange: number;
  streamLength: number;
  cellWidth: number;
  subdivision: Subdivision;
  noteColor: string;
  bodyColor: string;
  headerColor: string;
}
