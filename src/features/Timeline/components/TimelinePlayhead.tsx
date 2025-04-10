import { HEADER_HEIGHT } from "utils/constants";
import { useTick } from "hooks/useTick";
import { useSelect } from "hooks/useStore";
import {
  selectCellWidth,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { useTransport } from "hooks/useTransport";

export function TimelinePlayhead() {
  const { tick } = useTick();
  const state = useTransport();
  const cellWidth = useSelect(selectCellWidth);

  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useSelect((_) => selectTimelineTickLeft(_, tick));
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
