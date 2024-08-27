import { getClipDuration } from "types/Clip/ClipFunctions";
import { Clip, isIPatternClip } from "types/Clip/ClipTypes";
import { Project } from "types/Project/ProjectTypes";
import {
  selectSubdivision,
  selectCellWidth,
} from "types/Timeline/TimelineSelectors";
import { isFiniteNumber } from "types/util";
import { getTickColumns } from "utils/durations";

/** Select the width of a clip in pixels. Always at least 1 pixel. */
export const selectClipWidth = (project: Project, clip?: Clip) => {
  if (!clip) return 1;

  const subdivision = selectSubdivision(project);
  const cellWidth = selectCellWidth(project);
  const duration = getClipDuration(clip);

  // Return one cell width for all infinite non-pattern clips
  if (!isIPatternClip(clip) && !isFiniteNumber(duration)) {
    return cellWidth;
  }

  // Otherwise, compute the width based on the timeline
  const columns = getTickColumns(duration, subdivision);
  const width = Math.max(cellWidth * columns, 1);
  return width;
};
