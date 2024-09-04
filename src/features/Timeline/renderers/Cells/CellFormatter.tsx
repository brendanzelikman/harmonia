import { useCellDrop } from "./useCellDrop";
import { FormatterProps } from "react-data-grid";
import { Row } from "features/Timeline/Timeline";

export interface CellFormatterProps extends FormatterProps<Row> {
  col: number;
  className?: string;
  onClick?: () => void;
}

export function CellFormatter(props: CellFormatterProps) {
  const [_, drop] = useCellDrop(props);
  return <div ref={drop} className={props.className} onClick={props.onClick} />;
}
