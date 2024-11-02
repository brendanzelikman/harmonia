import { getClipDuration } from "types/Clip/ClipFunctions";
import { selectClipById } from "types/Clip/ClipSelectors";
import {
  Clip,
  ClipId,
  isIPatternClip,
  PortaledClipId,
} from "types/Clip/ClipTypes";
import { Project } from "types/Project/ProjectTypes";
import {
  selectSubdivision,
  selectCellWidth,
} from "types/Timeline/TimelineSelectors";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectTransport } from "types/Transport/TransportSelectors";
import { isFiniteNumber } from "types/util";
import { getTickColumns } from "utils/durations";
import { selectPortaledClipById } from "./ArrangementSelectors";

/** Select the width of a clip in pixels. Always at least 1 pixel. */
export const selectClipWidth = (project: Project, clip?: Clip) => {
  if (!clip) return 1;

  const subdivision = selectSubdivision(project);
  const cellWidth = selectCellWidth(project);
  const duration = getClipDuration(clip);

  // Return one cell width for all infinite non-pattern clips
  if (!isIPatternClip(clip) && (!duration || !isFiniteNumber(duration))) {
    return cellWidth;
  }

  // Otherwise, compute the width based on the timeline
  const columns = getTickColumns(duration, subdivision);
  const width = Math.max(cellWidth * columns, cellWidth);
  return width;
};

/** Select the start time of a clip in seconds. */
export const selectClipStartTime = (project: Project, id: ClipId) => {
  const clip =
    selectClipById(project, id) ||
    selectPortaledClipById(project, id as PortaledClipId);
  const transport = selectTransport(project);
  if (!clip) return undefined;
  return convertTicksToSeconds(transport, clip.tick);
};
