import { HEADER_HEIGHT } from "utils/constants";
import { useTick } from "types/Transport/TransportTick";
import { useAppValue } from "hooks/useRedux";
import {
  selectCellWidth,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { useTransportState } from "types/Transport/TransportState";

export function TimelinePlayhead() {
  const tick = useTick();
  const state = useTransportState();
  const cellWidth = useAppValue(selectCellWidth);

  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useAppValue((_) => selectTimelineTickLeft(_, tick));
  const style = { height, marginTop, width, left };

  if (state === "stopped") return null;
  return (
    <div
      className="sticky w-full inset-0 z-50 pointer-events-none"
      style={{ height }}
    >
      <div className="relative bg-green-500" style={style} />
    </div>
  );
}
