import { DataGridHandle } from "react-data-grid";
import { getColumnTicks } from "utils/durations";

export const getTimelineVisibleRange = (timeline: DataGridHandle) => {
  const element = timeline?.element;
  if (element) {
    const range = { start: 0, end: 0 };
    const rows = element.querySelectorAll(".rdg-cell-row");

    // Select the first row and extract a col matching rdg-cell-* from the classnames
    const first = rows[0];
    const firstCell = first.querySelectorAll(".rdg-cell")[1];
    const firstClasses = firstCell?.classList;
    firstClasses.forEach((className) => {
      if (className.startsWith("rdg-cell-")) {
        const [_, col] = className.split("rdg-cell-");
        const start = getColumnTicks(parseInt(col) - 1);
        range["start"] = start;
      }
    });

    // Select the last row and extract a col matching rdg-cell-* from the classnames
    const last = rows[rows.length - 1];
    const lastCell =
      last.querySelectorAll(".rdg-cell")[last.children.length - 1];
    const lastClasses = lastCell?.classList;
    lastClasses.forEach((className) => {
      if (className.startsWith("rdg-cell-")) {
        const [_, col] = className.split("rdg-cell-");
        const end = getColumnTicks(parseInt(col) - 1);
        range["end"] = end;
      }
    });
  }
};
