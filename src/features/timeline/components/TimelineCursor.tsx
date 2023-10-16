import { HEADER_HEIGHT } from "utils/constants";
import useTransportTick from "hooks/useTransportTick";
import { memo } from "react";
import { useAppSelector } from "redux/hooks";
import {
  selectCellWidth,
  selectTimelineTickLeft,
  selectTransport,
} from "redux/selectors";

const TimelineCursor = () => {
  const transport = useAppSelector(selectTransport);
  const cellWidth = useAppSelector(selectCellWidth);
  const tick = useTransportTick();

  // Cursor properties
  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useAppSelector((_) => selectTimelineTickLeft(_, tick));
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
