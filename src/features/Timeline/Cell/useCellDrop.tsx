import { useDrop } from "react-dnd";
import { TrackId } from "types/Track";
import { Row } from "features/Timeline/Timeline";

interface CellDropProps {
  trackId?: TrackId;
  columnIndex: number;
  row: Row;
}

export function useCellDrop(props: CellDropProps) {
  const { trackId, columnIndex, row } = props;
  return useDrop(
    () => ({
      accept: ["clip", "portal"],
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
      hover(item: any) {
        item.trackId = trackId;
        item.canDrop = true;
        item.hoveringColumn = columnIndex;

        // Update the row index if the item is hovering over a row
        item.hoveringRow = row.index;
      },
    }),
    [trackId, columnIndex, row]
  );
}
