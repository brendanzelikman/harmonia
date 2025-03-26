import { useTransportTick } from "hooks/useTransportTick";
import { useDeep } from "types/hooks";
import {
  selectCellHeight,
  selectSelectedTrack,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import classNames from "classnames";
import { COLLAPSED_TRACK_HEIGHT } from "utils/constants";
import { useTransportState } from "hooks/useTransportState";

export function TimelineCursor() {
  const { tick } = useTransportTick();
  const cellHeight = useDeep(selectCellHeight);
  const state = useTransportState();

  const track = useDeep(selectSelectedTrack);
  const onPatternTrack = track?.type === "pattern";

  const top = useDeep((_) => selectTrackTop(_, track?.id));
  const left = useDeep((_) => selectTimelineTickLeft(_, tick)) - 2;
  const width = 2;
  const height = track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  const style = { height, top, width, left };
  const bgColor = onPatternTrack ? "bg-emerald-500" : "bg-sky-500";

  // Show the cursor if the transport is started and not downloading
  if (state !== "stopped" || !track) return null;
  return (
    <div
      className={classNames(bgColor, "absolute pointer-events-none")}
      style={style}
    />
  );
}
