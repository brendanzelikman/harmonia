import { useDrop } from "react-dnd";
import { CellProps } from ".";

export function useCellDrop(props: CellProps) {
  const { trackId, isPatternTrack, columnIndex, row } = props;
  return useDrop(
    () => ({
      accept: ["clip", "transform"],
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
    [trackId, isPatternTrack, columnIndex, row]
  );
}
