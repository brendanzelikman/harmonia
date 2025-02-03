import { Row } from "features/Timeline/Timeline";
import { RenderCellProps } from "react-data-grid";
import { useDrop } from "react-dnd";

export interface CellFormatterProps extends RenderCellProps<Row> {
  col: number;
  className?: string;
  onClick?: () => void;
}

const accept = ["patternClip", "poseClip", "scaleClip", "portal"];

export function CellFormatter(props: CellFormatterProps) {
  const [_, drop] = useDrop(() => ({
    accept,
    hover(item: any) {
      item.trackId = props.row.id;
      item.canDrop = true;
      item.hoveringColumn = props.col;
      item.hoveringRow = props.row.index;
      item.isDragging = true;
    },
  }));
  return <div ref={drop} className={props.className} onClick={props.onClick} />;
}
