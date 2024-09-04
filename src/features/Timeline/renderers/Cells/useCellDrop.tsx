import { useDrop } from "react-dnd";
import { CellFormatterProps } from "./CellFormatter";

export function useCellDrop(props: CellFormatterProps) {
  return useDrop({
    accept: ["patternClip", "poseClip", "scaleClip", "portal"],
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
    hover(item: any) {
      item.trackId = props.row.id;
      item.canDrop = true;
      item.hoveringColumn = props.col;
      item.hoveringRow = props.row.index;
    },
  });
}
