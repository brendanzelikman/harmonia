import { HEADER_HEIGHT } from "utils/constants";
import { useTransportTick } from "hooks";
import { memo } from "react";
import { useProjectSelector } from "redux/hooks";
import {
  selectCellWidth,
  selectTimelineTickLeft,
  selectTransport,
} from "redux/selectors";
import { isTransportStarted } from "types/Transport";

const TimelineCursor = () => {
  const tick = useTransportTick();
  const transport = useProjectSelector(selectTransport);
  const cellWidth = useProjectSelector(selectCellWidth);

  // Cursor properties
  const width = cellWidth - 4;
  const height = HEADER_HEIGHT;
  const marginTop = -HEADER_HEIGHT;
  const left = useProjectSelector((_) => selectTimelineTickLeft(_, tick));
  const show = isTransportStarted(transport) && !transport.downloading;
  const style = { height, marginTop, width, left };

  // Show the cursor if the transport is started and not downloading
  if (!show) return null;
  return (
    <div
      className="sticky w-full inset-0 z-50 pointer-events-none"
      style={{ height }}
    >
      <div className="relative bg-green-500" style={style} />
    </div>
  );
};

export default memo(TimelineCursor);
