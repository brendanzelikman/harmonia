import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import { use } from "types/hooks";
import {
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { PortaledPoseClip } from "types/Clip/PoseClip/PoseClipTypes";

export const usePoseClipStyle = (clip: PortaledPoseClip) => {
  const top = use((_) => selectTrackTop(_, clip.trackId));
  const left = use((_) => selectTimelineTickLeft(_, clip.tick));
  const width = use((_) => selectClipWidth(_, clip));
  const height = use((_) => selectTrackHeight(_, clip.trackId));

  return { top, left, width, height };
};
