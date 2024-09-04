import { useTransportTick } from "hooks/useTransportTick";
import { use } from "types/hooks";
import {
  selectCellHeight,
  selectSelectedTrack,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectIsTransportActive } from "types/Transport/TransportSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import classNames from "classnames";

export function TimelineCursor() {
  const tick = useTransportTick();
  const cellHeight = use(selectCellHeight);
  const isTransportActive = use(selectIsTransportActive);

  const track = use(selectSelectedTrack);
  const onPatternTrack = track?.type === "pattern";

  const top = use((_) => selectTrackTop(_, track?.id));
  const left = use((_) => selectTimelineTickLeft(_, tick)) - 2;
  const width = 2;
  const height = cellHeight;
  const style = { height, top, width, left };
  const bgColor = onPatternTrack ? "bg-emerald-500" : "bg-sky-500";

  // Show the cursor if the transport is started and not downloading
  if (isTransportActive) return null;
  return (
    <div
      className={classNames(bgColor, "absolute pointer-events-none")}
      style={style}
    />
  );
}
