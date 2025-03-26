import { HEADER_HEIGHT } from "utils/constants";
import { useTransportTick } from "hooks/useTransportTick";
import { useDeep } from "types/hooks";
import {
  selectCellWidth,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { useTransportState } from "hooks/useTransportState";

export function TimelinePlayhead() {
  const { tick } = useTransportTick();
  const state = useTransportState();
  const cellWidth = useDeep(selectCellWidth);

  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useDeep((_) => selectTimelineTickLeft(_, tick));
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
