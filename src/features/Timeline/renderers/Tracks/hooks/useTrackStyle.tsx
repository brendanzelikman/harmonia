import classNames from "classnames";
import { some } from "lodash";
import { useAppValue } from "hooks/useRedux";
import {
  selectIsEditingTrack,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import {
  selectTrackById,
  selectTrackDepthById,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { useHeldKeys } from "hooks/useHeldkeys";

export const useTrackStyle = (props: {
  trackId: TrackId;
  isDragging: boolean;
}) => {
  const trackId = props.trackId;
  const isPT = isPatternTrackId(trackId);
  const track = useAppValue((_) => selectTrackById(_, trackId));
  const isCollapsed = !!track?.collapsed;
  const depth = useAppValue((_) => selectTrackDepthById(_, trackId));
  const paddingLeft = depth * 8;
  const filter = `hue-rotate(${(depth - 1) * 8}deg)`;
  const opacity = props.isDragging ? 0.5 : 1;
  const className = classNames(
    "animate-in rdg-track fade-in duration-200 slide-in-from-top-8 transition-all size-full relative bg-radial text-white",
    { "from-teal-600 to-emerald-600": isPT },
    isCollapsed ? "p-0" : "p-1",
    { "from-indigo-800/80 to-indigo-700": !isPT }
  );
  const selectedId = useAppValue(selectSelectedTrackId);
  const isSelected = selectedId === trackId;
  const heldKeys = useHeldKeys(["q", "w", "e", "r", "t", "y"]);
  const isHolding = some(heldKeys);
  const onInstrumentEditor = useAppValue((_) =>
    selectIsEditingTrack(_, trackId)
  );
  const borderClass = classNames(
    "size-full bg-radial border-2 rounded transition-all",
    { "border-t-0": isCollapsed },
    { "total-center": isPT },
    { "total-center-col px-2 gap-1": !isPT },
    { "from-teal-700 to-emerald-600": isPT },
    { "from-indigo-900/80 to-indigo-800": !isPT },
    { "border-orange-400": isSelected && onInstrumentEditor },
    { "border-fuchsia-400": isSelected && isHolding },
    { "border-blue-400": isSelected },
    { "border-zinc-900": !isSelected }
  );
  return { paddingLeft, filter, opacity, className, borderClass };
};
