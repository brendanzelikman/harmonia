import {
  selectSelectedTranspositionIds,
  selectTimelineBackgroundWidth,
  selectTimelineObjectHeight,
  selectTimelineObjectTop,
  selectTimelineTickLeft,
  selectTrackParents,
} from "redux/selectors";
import { TranspositionProps } from "../Transposition";
import { useAppSelector, useDeepEqualSelector } from "redux/hooks";
import { normalize, ticksToColumns } from "utils";
import { TRANSPOSITION_HEIGHT } from "appConstants";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffsets,
} from "types/Transposition";

interface TranspositionStyleProps extends TranspositionProps {
  isTransposing: boolean;
  isDragging: boolean;
  isHoldingKey: (key: string) => boolean;
}

export const useTranspositionStyles = (props: TranspositionStyleProps) => {
  const { transposition, subdivision, cellWidth, isHoldingKey } = props;
  const tick = transposition?.tick ?? 0;
  const duration = transposition?.duration ?? 0;
  const offsets = transposition?.offsets ?? {};

  // Selected transpositions
  const selectedTranspositionIds = useDeepEqualSelector(
    selectSelectedTranspositionIds
  );
  const isSelected = selectedTranspositionIds.some(
    (id) => id === transposition?.id
  );

  // Selected track
  const selectedTrackParents = useDeepEqualSelector((state) =>
    selectTrackParents(state, props.selectedTrackId)
  );

  // Cell
  const cellHeight = useAppSelector((_) =>
    selectTimelineObjectHeight(_, transposition)
  );

  // Position
  const position = `z-[9] absolute flex flex-col`;
  const top = useAppSelector((_) => selectTimelineObjectTop(_, transposition));
  const left = useAppSelector((_) => selectTimelineTickLeft(_, tick));

  // The transposition width is either the duration or the remaining space
  const backgroundWidth = useAppSelector(selectTimelineBackgroundWidth);
  const width = !!duration
    ? ticksToColumns(duration, subdivision) * cellWidth
    : backgroundWidth - left;

  const isSmall = width < 2 * cellWidth;
  const height = TRANSPOSITION_HEIGHT;

  // Selected transpositions have a border
  const border = `border ${isSelected ? `border-white` : `border-white/0`}`;

  // Selected transpositions have darker backgrounds
  const background = isSelected ? `bg-fuchsia-500/80` : `bg-fuchsia-500/70`;

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
  const transition = `transition-all duration-75`;
  const opacity = props.isDragging ? 0.5 : props.draggingClip ? 0.7 : 1;
  const pointerEvents =
    props.isDragging || props.draggingClip || props.isAdding
      ? "pointer-events-none"
      : "pointer-events-all";

  // Font
  const font = "font-light";

  // Cursor
  const cursor = `cursor-pointer`;

  // Header
  const headerDisplay = `w-full flex relative items-center pointer-events-none ${
    isSelected ? "overflow-visible" : "overflow-hidden"
  }`;
  const headerBorder = `border border-b-0 rounded-t ${
    isSelected ? `border-white` : `border-white/0`
  }`;

  // Body
  const bodyBorder = `border border-t-0 rounded-b ${
    isSelected ? `border-white` : `border-white/0`
  }`;

  // Labels
  const parentCount = selectedTrackParents.length;
  const canTransposeScalars = isSelected && !!parentCount;
  const isHoldingZ = isHoldingKey("z");
  const isHoldingQ = isHoldingKey("q");
  const isHoldingE = isHoldingKey("e");
  const isHoldingW = isHoldingKey("w");
  const isHoldingS = isHoldingKey("s");
  const isHoldingX = isHoldingKey("x");

  // Label text color
  const labelColor = isSelected ? "text-white" : "text-white/80";

  // The chromatic label lights up when transposing chromatically
  const chromaticClass = `${
    (isHoldingQ || isHoldingZ) && isSelected ? "text-shadow-lg" : ""
  } ${isSelected ? "font-bold" : ""}`;

  // The chordal label lights up when transposing chordally
  const chordalClass = `${
    (isHoldingE || isHoldingZ) && isSelected ? "text-shadow-lg" : ""
  } ${isSelected ? "font-bold" : ""}`;

  // The scalar label lights up when transposing the corresponding scalar
  const scalarClass = (i: number) => {
    const onScale1 = isHoldingW && i === 0;
    const onScale2 = isHoldingS && i === 1;
    const onScale3 = isHoldingX && i === 2;
    const isTransposing = onScale1 || onScale2 || onScale3 || isHoldingZ;
    const canTransposeScalar = canTransposeScalars && i < parentCount;
    return canTransposeScalar
      ? `font-bold ${isTransposing ? "text-shadow-lg" : ""}`
      : "";
  };

  // The T lights up when any scalar is being transposed
  const onAnyScale = isHoldingW || isHoldingS || isHoldingX || isHoldingZ;
  const scalarTLabel = canTransposeScalars
    ? `font-bold ${onAnyScale ? "text-shadow-lg" : ""}`
    : "";

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
    transition,
    opacity,
    pointerEvents,
    font,
    cursor,
    headerDisplay,
    headerBorder,
    bodyBorder,
    labelColor,
    hueClass,
    chromaticClass,
    chromaticUpOpacity,
    chromaticDownOpacity,
    chordalClass,
    chordalUpOpacity,
    chordalDownOpacity,
    scalarClass,
    scalarUpOpacity,
    scalarDownOpacity,
    scalarTLabel,
    Icon,
  };
};
