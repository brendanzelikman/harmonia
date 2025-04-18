import { useAppValue } from "hooks/useRedux";
import {
  selectCellHeight,
  selectSelectedTrack,
  selectTimelineTick,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import classNames from "classnames";
import { COLLAPSED_TRACK_HEIGHT } from "utils/constants";

export function TimelineCursor() {
  const tick = useAppValue(selectTimelineTick);
  const cellHeight = useAppValue(selectCellHeight);
  const track = useAppValue(selectSelectedTrack);
  const onPatternTrack = track?.type === "pattern";
  const top = useAppValue((_) => selectTrackTop(_, track?.id));
  const left = useAppValue((_) =>
    tick ? selectTimelineTickLeft(_, tick) - 2 : 0
  );
  const width = 2;
  const height = track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  const style = { height, top, width, left };
  const bgColor = onPatternTrack ? "bg-emerald-500" : "bg-sky-500";

  // Hide the cursor if no track is selected
  if (!track) return null;
  return (
    <div
      className={classNames(bgColor, "absolute pointer-events-none")}
      style={style}
    />
  );
}
