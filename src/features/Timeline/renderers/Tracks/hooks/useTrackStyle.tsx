import classNames from "classnames";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { some } from "lodash";
import { useDeep } from "types/hooks";
import {
  selectIsEditingTrack,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import {
  selectTrackAncestorIds,
  selectTrackById,
  selectTrackDepthById,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";

export const useTrackStyle = (props: {
  trackId: TrackId;
  isDragging: boolean;
}) => {
  const trackId = props.trackId;
  const isPT = isPatternTrackId(trackId);
  const track = useDeep((_) => selectTrackById(_, trackId));
  const isCollapsed = !!track?.collapsed;
  const depth = useDeep((_) => selectTrackDepthById(_, trackId));
  const paddingLeft = depth * 8;
  const filter = `hue-rotate(${(depth - 1) * 8}deg)`;
  const opacity = props.isDragging ? 0.5 : 1;
  const className = classNames(
    "animate-in fade-in slide-in-from-top-8 transition-all rdg-track size-full relative bg-gradient-radial text-white",
    { "from-teal-600 to-emerald-600": isPT },
    isCollapsed ? "p-0.5 pt-0" : "p-1",
    { "from-indigo-800/80 to-indigo-700": !isPT }
  );
  const ancestors = useDeep(selectTrackAncestorIds);
  const selectedId = useDeep(selectSelectedTrackId);
  const isSelected = selectedId === trackId;
  const isAncestorSelected = selectedId && ancestors.includes(selectedId);
  const heldKeys = useHeldHotkeys(["q", "w", "e", "r", "t", "y"]);
  const isHolding = some(heldKeys);
  const onInstrumentEditor = useDeep((_) => selectIsEditingTrack(_, trackId));
  const borderClass = classNames(
    "size-full bg-gradient-radial border-2 rounded transition-all",
    { "total-center": isPT },
    { "total-center-col px-2 gap-1": !isPT },
    { "from-teal-700 to-emerald-600": isPT },
    { "from-indigo-900/80 to-indigo-800": !isPT },
    { "border-orange-400": isSelected && onInstrumentEditor },
    { "border-fuchsia-400": isSelected && isHolding },
    { "border-blue-400": isSelected },
    { "border-blue-400/50": !isSelected && isAncestorSelected },
    { "border-zinc-900": !isAncestorSelected && !isSelected }
  );
  return { paddingLeft, filter, opacity, className, borderClass };
};
