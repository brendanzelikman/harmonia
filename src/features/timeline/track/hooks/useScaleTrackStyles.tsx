import { useAppSelector, useDeepEqualSelector } from "redux/hooks";
import { selectSelectedTrackId } from "redux/Root";
import { ScaleTrackProps } from "../ScaleTrack";
import { selectTranspositionIds } from "redux/Transposition";
import { selectTrackParents } from "redux/selectors";

interface ScaleTrackStyleProps extends ScaleTrackProps {
  isDragging: boolean;
}
export const useScaleTrackStyles = (props: ScaleTrackStyleProps) => {
  const selectedTrackId = useAppSelector(selectSelectedTrackId);
  const selectedTranspositionIds = useAppSelector(selectTranspositionIds);
  const selectedParents = useDeepEqualSelector((_) =>
    selectTrackParents(_, selectedTrackId)
  );
  const isSelected = props.track.id === selectedTrackId;
  const isScaleSelected = selectedParents.some(({ id }) => id === props.id);
  const isSmall = props.cell.height < 100;

  // Outer track
  const opacity = props.isDragging ? "opacity-50" : "opacity-100";
  const text = `text-white ${isSmall ? "text-xs" : "text-sm"}`;
  const padding = "h-full p-2 bg-indigo-700";
  const outerBorder = "border-b border-b-slate-300";

  // Inner track
  const gradient = "bg-gradient-to-r from-sky-900 to-indigo-800";
  const innerTrack = "h-full p-2 flex flex-col items-center justify-evenly";
  const innerBorder = `rounded border-2 ${
    isSelected
      ? props.onScaleEditor
        ? "border-sky-500"
        : "border-blue-400"
      : "border-sky-950"
  }`;

  // Header
  const depthLabel = `w-4 text-center ${
    isScaleSelected && selectedTranspositionIds.length
      ? "font-semibold text-fuchsia-400 text-shadow"
      : "font-medium"
  }`;

  // Body
  const scaleEditorButton = `px-3 border-sky-400 ${
    props.onScaleEditor
      ? "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse"
      : ""
  }`;
  const patternTrackButton = `px-4 active:bg-gradient-to-tr active:from-emerald-500 active:to-teal-500/50 border-emerald-500 background-pulse select-none`;
  const scaleTrackButton = `px-3 border-indigo-400 active:bg-gradient-to-r active:from-indigo-400 active:to-indigo-500 background-pulse select-none`;

  return {
    opacity,
    text,
    padding,
    outerBorder,
    gradient,
    innerTrack,
    innerBorder,
    depthLabel,
    scaleEditorButton,
    patternTrackButton,
    scaleTrackButton,
  };
};
