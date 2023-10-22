import {
  selectSelectedTranspositionIds,
  selectTimelineBackgroundWidth,
  selectTimelineObjectHeight,
  selectTimelineObjectTop,
  selectTimelineTickLeft,
  selectTrackParents,
} from "redux/selectors";
import { TranspositionProps } from "../Transposition";
import { useProjectSelector, useProjectDeepSelector } from "redux/hooks";
import { normalize, ticksToColumns } from "utils";
import { TRANSPOSITION_HEIGHT } from "utils/constants";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffsets,
} from "types/Transposition";

interface TranspositionStyleProps extends TranspositionProps {
  isSlicing: boolean;
  isTransposing: boolean;
  isDragging: boolean;
}

export const useTranspositionStyles = (props: TranspositionStyleProps) => {
  const { transposition, subdivision, cellWidth, isSlicing: isCutting } = props;
  const tick = transposition?.tick ?? 0;
  const duration = transposition?.duration ?? 0;
  const offsets = transposition?.offsets ?? {};

  // Selected transpositions
  const selectedTranspositionIds = useProjectDeepSelector(
    selectSelectedTranspositionIds
  );
  const isSelected = selectedTranspositionIds.some(
    (id) => id === transposition?.id
  );

  // Selected track
  const selectedTrackParents = useProjectDeepSelector((project) =>
    selectTrackParents(project, props.selectedTrackId)
  );

  // Cell
  const cellHeight = useProjectSelector((_) =>
    selectTimelineObjectHeight(_, transposition)
  );

  // Position
  const position = `z-[9] group absolute flex flex-col overflow-hidden`;
  const top = useProjectSelector((_) =>
    selectTimelineObjectTop(_, transposition)
  );
  const left = useProjectSelector((_) => selectTimelineTickLeft(_, tick));

  // The transposition width is either the duration or the remaining space
  const backgroundWidth = useProjectSelector(selectTimelineBackgroundWidth);
  const tickWidth = ticksToColumns(1, subdivision) * cellWidth;
  const width = !!duration
    ? ticksToColumns(duration, subdivision) * cellWidth
    : backgroundWidth - left;

  const isSmall = width < 2 * cellWidth;
  const height = TRANSPOSITION_HEIGHT;

  // Selected transpositions have a border
  const border = `rounded border ${
    isSelected ? `border-white` : `border-slate-400`
  }`;

  // All transpositions have the same background
  const background = `bg-transposition ${
    isCutting ? "opacity-60 group-hover:opacity-90" : ""
  }`;

  // Offsets create different hues
  const hueClass = "absolute inset-0 w-full";

  // Chromatic = Fuchsia
  const chromaticOffset = getChromaticOffset(offsets);
  const chromaticUpOpacity =
    chromaticOffset > 0 ? Math.min(1, normalize(chromaticOffset, 1, 12)) : 0;
  const chromaticDownOpacity =
    chromaticOffset < 0 ? Math.min(1, normalize(chromaticOffset, -1, -12)) : 0;

  // Scalar = Indigo
  const scalarOffsets = getScalarOffsets(
    offsets,
    selectedTrackParents.map((t) => t.id)
  );
  const maxScalar = Math.max(...scalarOffsets);
  const minScalar = Math.min(...scalarOffsets);
  const scalarUpOpacity =
    maxScalar > 0 ? Math.min(1, normalize(maxScalar, 1, 12)) : 0;
  const scalarDownOpacity =
    minScalar < 0 ? Math.min(1, normalize(minScalar, -1, -12)) : 0;

  // Chordal = Rose
  const chordalOffset = getChordalOffset(offsets);
  const chordalUpOpacity =
    chordalOffset > 0 ? Math.min(1, normalize(chordalOffset, 1, 12)) : 0;
  const chordalDownOpacity =
    chordalOffset < 0 ? Math.min(1, normalize(chordalOffset, -1, -12)) : 0;

  // Animation
  const opacity = props.isDragging ? 0.5 : props.draggingClip ? 0.7 : 1;
  const pointerEvents =
    props.isDragging || props.draggingClip || props.isAdding
      ? "pointer-events-none"
      : "pointer-events-all";

  // Font
  const font = "font-light";

  // Cursor
  const cursor = props.isSlicing ? "cursor-scissors" : "cursor-pointer";

  // Header
  const headerDisplay = `w-full flex relative items-center pointer-events-none ${
    isSelected ? "overflow-visible" : "overflow-hidden"
  }`;

  // Label text color
  const labelColor = isSelected ? "text-white font-bold" : "text-white/80 pt-1";

  // The icon is a star wand when selected, magic wand otherwise
  const Icon = isSelected ? (
    <SlMagicWand className="text-md ml-1 mr-2" />
  ) : (
    <BsMagic className={`text-md ml-1 mr-2`} />
  );

  return {
    cellHeight,
    position,
    top,
    left,
    width,
    height,
    isSmall,
    border,
    background,
    tickWidth,
    opacity,
    pointerEvents,
    font,
    cursor,
    headerDisplay,
    labelColor,
    hueClass,
    chromaticUpOpacity,
    chromaticDownOpacity,
    chordalUpOpacity,
    chordalDownOpacity,
    scalarUpOpacity,
    scalarDownOpacity,
    Icon,
  };
};
