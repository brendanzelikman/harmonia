import { HEADER_HEIGHT } from "utils/constants";
import { useTransportTick } from "hooks";
import { memo } from "react";
import { useProjectSelector } from "redux/hooks";
import {
  selectCellWidth,
  selectTimelineTickLeft,
  selectTransport,
} from "redux/selectors";

const TimelineCursor = () => {
  const transport = useProjectSelector(selectTransport);
  const cellWidth = useProjectSelector(selectCellWidth);
  const tick = useTransportTick();

  // Cursor properties
  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useProjectSelector((_) => selectTimelineTickLeft(_, tick));
  const showCursor = transport.state === "started" && !transport.downloading;
  if (!showCursor) return null;

  // Return the cursor
  const style = { height, marginTop, width, left };
  return (
    <div
      className="sticky w-full inset-0 z-50 pointer-events-none"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="relative bg-green-500" style={style} />
    </div>
  );
};

export default memo(TimelineCursor);
