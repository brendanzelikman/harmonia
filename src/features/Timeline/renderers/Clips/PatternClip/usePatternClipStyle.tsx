import { clamp } from "lodash";
import { getPatternClipTheme } from "types/Clip/PatternClip/PatternClipFunctions";
import { POSE_HEIGHT, TRACK_WIDTH } from "utils/constants";
import { getTickColumns, Subdivision } from "utils/durations";
import {
  CLIP_NAME_HEIGHT,
  CLIP_STREAM_MARGIN,
  PatternClipRendererProps,
} from "./usePatternClipRenderer";
import classNames from "classnames";
import { use, useDeep } from "types/hooks";
import {
  selectIsClipSelected,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectOverlappingPortaledClipIdMap,
  selectPatternClipMidiStreamMax,
  selectPatternClipMidiStreamMin,
  selectPatternClipStreamLength,
} from "types/Arrangement/ArrangementSelectors";
import { PatternClip } from "types/Clip/ClipTypes";
import { Timed } from "types/units";

interface PatternClipStyleProps extends PatternClipRendererProps {
  clip?: Timed<PatternClip>;
  isDragging: boolean;
}

export const usePatternClipStyle = (
  props: PatternClipStyleProps
): ClipStyle => {
  const { clip, isAddingAny, isPortaling, id, pcId } = props;
  const { holdingI, isAdding, subdivision, cellWidth } = props;
  const trackHeight = use((_) => selectTrackHeight(_, clip?.trackId));
  const trackTop = use((_) => selectTrackTop(_, clip?.trackId));
  const isSelected = use((_) => selectIsClipSelected(_, id));

  const doesOverlap = useDeep(
    (_) => !!selectOverlappingPortaledClipIdMap(_)[pcId]?.length
  );
  const duration = clip?.duration ?? 0;
  const startTick = clip?.tick ?? 0;
  const endTick = startTick + (duration ?? 0);

  const theme = getPatternClipTheme(clip);
  const { noteColor, bodyColor, headerColor } = theme;

  const isShort = doesOverlap || isAddingAny || props.isDraggingOther;

  const height = isShort ? trackHeight - POSE_HEIGHT : trackHeight;
  const top = trackTop + (isShort ? POSE_HEIGHT : 0);
  const width = (getTickColumns(duration, subdivision) || 1) * cellWidth;
  const streamHeight = height - CLIP_NAME_HEIGHT - CLIP_STREAM_MARGIN;

  const streamMin = use((_) => selectPatternClipMidiStreamMin(_, pcId));
  const streamMax = use((_) => selectPatternClipMidiStreamMax(_, pcId));
  const streamRange = Math.max(streamMax - streamMin, 1);
  const streamLength = use((_) => selectPatternClipStreamLength(_, pcId));

  const noteHeight = clamp(streamHeight / streamRange, 4, 20);
  const fontSize = Math.min(12, noteHeight) - 4;

  const columns = getTickColumns(clip?.tick, subdivision);
  const left = TRACK_WIDTH + Math.round(columns * cellWidth);

  const fullDim = isPortaling;
  const isDraggingOtherMedia = false;
  const lightDim = isDraggingOtherMedia && isSelected;
  const isOpen = !!clip?.isOpen;
  const className = classNames(
    props.className,
    "flex flex-col rounded-lg rounded-b-none animate-in fade-in",
    isOpen ? "min-w-min max-w-lg z-[25]" : "border-2",
    { "backdrop-blur border-white/0": isOpen },
    { "border-slate-100": isSelected && !isOpen },
    { "border-teal-500/50": !isSelected && !isOpen },
    { "pointer-events-none": props.isDraggingAny },
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
    [Symbol.iterator]: function* () {
      let properties = Object.keys(this) as (keyof ClipStyle)[];
      for (let i of properties) {
        yield this[i];
      }
    },
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
  [Symbol.iterator]: () => Generator<any>;
}
