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
import { use } from "types/hooks";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import classNames from "classnames";
import { PatternMidiStream } from "types/Pattern/PatternTypes";

interface PatternClipStyleProps extends PatternClipRendererProps {
  isDragging: boolean;
  isDraggingOtherMedia: boolean;
  stream: PatternMidiStream;
  doesOverlap: boolean;
}

export const usePatternClipStyle = (
  props: PatternClipStyleProps
): ClipStyle => {
  const { clip, doesOverlap, isAddingAny, isPortaling } = props;
  const { isSelected, holdingI, isAdding } = props;
  const { stream, isDragging, isDraggingOtherMedia } = props;

  const subdivision = use(selectSubdivision);
  const cellWidth = use(selectCellWidth);

  const duration = clip.duration;
  const startTick = clip.tick;
  const endTick = clip.tick + (duration ?? 0);

  const theme = getPatternClipTheme(clip);
  const { noteColor, bodyColor, headerColor } = theme;

  const trackHeight = use((_) => selectTrackHeight(_, clip?.trackId));
  const trackTop = use((_) => selectTrackTop(_, clip?.trackId));

  const isShort =
    doesOverlap || isAddingAny || isDragging || isDraggingOtherMedia;

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

  const fullDim = isDragging || isPortaling;
  const lightDim = isDraggingOtherMedia && isSelected;

  const className = classNames(
    props.className,
    "flex flex-col rounded-lg rounded-b-none",
    clip.isOpen ? "min-w-min z-[25]" : "border-2",
    { "backdrop-blur border-white/0": clip.isOpen },
    { "border-slate-100": isSelected && !clip.isOpen },
    { "border-teal-500/50": !isSelected && !clip.isOpen },
    { "opacity-50 pointer-events-none": fullDim },
    { "opacity-80 pointer-events-none": lightDim && !fullDim },
    { "opacity-100 pointer-events-all": !fullDim && !lightDim },
    { "cursor-paintbrush hover:ring hover:ring-teal-500": isAdding },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": holdingI },
    { "cursor-pointer": !isAdding && !holdingI }
  );

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
    className,
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
  className: string;
}
