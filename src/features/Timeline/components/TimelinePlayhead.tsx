import { HEADER_HEIGHT } from "utils/constants";
import { useTransportTick } from "hooks/useTransportTick";
import { use } from "types/hooks";
import {
  selectCellWidth,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectIsPlayheadVisible } from "types/Transport/TransportSelectors";

export function TimelinePlayhead() {
  const { tick } = useTransportTick();
  const isVisible = use(selectIsPlayheadVisible);
  const cellWidth = use(selectCellWidth);

  // Cursor properties
  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const style = { height, marginTop, width, left };

  // Show the cursor if the transport is started and not downloading
  if (!isVisible) return null;
  return (
    <div
      className="sticky w-full inset-0 z-50 pointer-events-none"
      style={{ height }}
    >
      <div className="relative bg-green-500" style={style} />
    </div>
  );
}
