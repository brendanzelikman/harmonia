import { useProjectSelector, useProjectDeepSelector } from "redux/hooks";
import { ScaleTrackProps } from "../ScaleTrack";
import { selectTranspositionIds } from "redux/Transposition";
import { selectTrackParents, selectSelectedTrackId } from "redux/selectors";

interface ScaleTrackStyleProps extends ScaleTrackProps {
  isDragging: boolean;
}
export const useScaleTrackStyles = (props: ScaleTrackStyleProps) => {
  const selectedTrackId = useProjectSelector(selectSelectedTrackId);
  const selectedTranspositionIds = useProjectSelector(selectTranspositionIds);
  const selectedParents = useProjectDeepSelector((_) =>
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
  const innerTrack = "w-full h-full items-center flex";
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
  const scaleEditorButton = `px-2 border-sky-400 ${
    props.onScaleEditor
      ? "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse"
      : ""
  }`;
  const patternTrackButton = `w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-emerald-500 active:bg-emerald-500 select-none`;
  const scaleTrackButton = `w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`;

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
