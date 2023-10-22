import { useDrop } from "react-dnd";
import { CellProps } from "..";

/**
 * A hook for dropping clips and transpositions into cells.
 */
export function useCellDrop(props: CellProps) {
  const { trackId, columnIndex, row } = props;
  return useDrop(
    () => ({
      accept: ["clip", "transposition"],
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
