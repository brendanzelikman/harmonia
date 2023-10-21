import { getClipTheme } from "types/Clip";
import { ClipProps } from "../Clip";
import { TRANSPOSITION_HEIGHT } from "utils/constants";
import {
  PatternNote,
  PatternStream,
  getPatternStreamRange,
} from "types/Pattern";
import {
  selectTimelineObjectTop,
  selectTimelineTickLeft,
  selectClipWidth,
  selectTimelineObjectHeight,
  selectCellWidth,
  selectSelectedClipIds,
  selectClipTranspositions,
  selectDraftedClip,
} from "redux/selectors";
import { useAppSelector, useDeepEqualSelector } from "redux/hooks";
import { MIDI } from "types/midi";
import { normalize, ticksToColumns } from "utils";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

interface ClipStyleProps extends ClipProps {
  stream?: PatternStream;
  isDragging: boolean;
}

export const useClipStyles = (props: ClipStyleProps) => {
  const { clip, stream } = props;
  const draftedClip = useAppSelector(selectDraftedClip);
  const selectedClipIds = useDeepEqualSelector(selectSelectedClipIds);
  const clipTranspositions = useDeepEqualSelector((_) =>
    selectClipTranspositions(_, clip?.id)
  );
  const isSelected = selectedClipIds.some((id) => id === clip?.id);
  const hasTransposition =
    props.draggingTransposition ||
    props.isTransposing ||
    clipTranspositions.length > 0;

  // Cell
  const cellHeight = useAppSelector((_) => selectTimelineObjectHeight(_, clip));
  const cellTop = useAppSelector((_) => selectTimelineObjectTop(_, clip));

  // Position
  const position = `z-[10] absolute`;
  const top = hasTransposition ? cellTop + TRANSPOSITION_HEIGHT : cellTop;
  const left = useAppSelector((_) => selectTimelineTickLeft(_, clip?.tick));

  // Dimensions
  const width = useAppSelector((_) => selectClipWidth(_, clip?.id));
  const height = hasTransposition
    ? cellHeight - TRANSPOSITION_HEIGHT
    : cellHeight;

  // Theme
  const body = `w-full h-full relative flex flex-col overflow-scroll`;
  const { headerColor, bodyColor, noteColor } = getClipTheme(clip);

  // Name
  const nameHeight = 24;
  const heldKeys = useHeldHotkeys(["i"]);

  // Stream
  const margin = 8;
  const streamHeight = height - nameHeight - margin + (heldKeys.v ? 150 : 0);
  const streamRange = getPatternStreamRange(stream);
  const noteCount = streamRange.length;
  const noteHeight = Math.min(20, streamHeight / noteCount);
  const fontSize = Math.min(12, noteHeight) - 4;

  // Chord
  const chordWidth = useAppSelector(selectCellWidth);
  const chordClass = props.isSlicing
    ? "bg-slate-500/50 group-hover:bg-slate-600/50 border-slate-50/50 hover:border-r-4 cursor-scissors"
    : "border-slate-50/10";

  // Animation
  const opacity = props.isDragging ? "opacity-50" : "opacity-100";
  const pointerEvents = props.isDragging ? "pointer-events-none" : "";

  // Border
  const border = `border ${
    isSelected ? "border-white font-bold" : "border-slate-200/50 font-medium"
  } rounded-lg overflow-hidden`;

  // Ring
  const isDifferentPattern =
    draftedClip?.patternId !== clip?.patternId && !!draftedClip?.patternId;
  const isEyedropping = useHeldHotkeys(["i"]).i;
  const ring =
    props.isAdding && isDifferentPattern
      ? "hover:ring-4 hover:ring-teal-500"
      : isEyedropping
      ? "hover:ring-4 hover:ring-slate-300"
      : "";

  // Cursor
  const cursor = props.isAdding
    ? "cursor-paintbrush"
    : isEyedropping
    ? "cursor-eyedropper"
    : "cursor-pointer";

  // Note Styles
  const getNoteStyles = (note: PatternNote, i = 0) => {
    const columns = ticksToColumns(note.duration || 0, props.subdivision);
    const noteOffset = note.MIDI - streamRange[0];
    const offset = (noteCount - noteOffset - 1) * noteHeight;
    const top =
      noteCount === 1
        ? (streamHeight - noteHeight) / 2
        : offset + noteHeight / 2;
    const left = ticksToColumns(i, props.subdivision) * chordWidth;
    const width = columns * chordWidth - 2;
    const opacity = normalize(
      note.velocity ?? MIDI.DefaultVelocity,
      MIDI.MinVelocity,
      MIDI.MaxVelocity
    );
    const border = `border border-slate-950/80 rounded transition-all duration-150`;
    return {
      top,
      left,
      width,
      height: noteHeight,
      opacity,
      border,
    };
  };

  return {
    position,
    top,
    left,
    width,
    height,
    headerColor,
    body,
    bodyColor,
    noteColor,
    nameHeight,
    noteHeight,
    chordWidth,
    chordClass,
    fontSize,
    opacity,
    pointerEvents,
    border,
    ring,
    cursor,
    getNoteStyles,
  };
};
