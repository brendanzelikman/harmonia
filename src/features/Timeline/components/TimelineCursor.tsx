import { useSelect } from "hooks/useStore";
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
  const tick = useSelect(selectTimelineTick);
  const cellHeight = useSelect(selectCellHeight);

  const track = useSelect(selectSelectedTrack);
  const onPatternTrack = track?.type === "pattern";

  const top = useSelect((_) => selectTrackTop(_, track?.id));
  const left = useSelect((_) => selectTimelineTickLeft(_, tick)) - 2;
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
