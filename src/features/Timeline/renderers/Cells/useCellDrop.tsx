import { useDrop } from "react-dnd";
import { Row } from "features/Timeline/Timeline";
import { TrackId } from "types/Track/TrackTypes";

interface CellDropProps {
  trackId?: TrackId;
  columnIndex: number;
  row: Row;
}

export function useCellDrop(props: CellDropProps) {
  const { trackId, columnIndex, row } = props;
  return useDrop(
    () => ({
      accept: ["patternClip", "poseClip", "scaleClip", "portal"],
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
      hover(item: any) {
        item.trackId = trackId;
        item.canDrop = true;
        item.hoveringColumn = columnIndex;
        item.hoveringRow = row.index;
      },
    }),
    [trackId, columnIndex, row]
  );
}
