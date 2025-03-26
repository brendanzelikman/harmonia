import { memo, useCallback } from "react";
import { useClipDrag } from "../useClipDnd";
import { useDeep, useProjectDispatch } from "types/hooks";
import { PatternClipId, PortaledPatternClipId } from "types/Clip/ClipTypes";
import { selectPortaledPatternClip } from "types/Arrangement/ArrangementClipSelectors";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { ClipComponentProps } from "../TimelineClips";
import {
  selectClipLeft,
  selectClipWidth,
} from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectIsAddingPatternClips,
  selectIsAddingPortals,
  selectIsClipSelected,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { POSE_HEIGHT } from "utils/constants";
import { selectTrackById } from "types/Track/TrackSelectors";

export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
}

export const PatternClipRenderer = memo((props: PatternClipRendererProps) => {
  const { pcId, id, isDragging, className } = props;
  const dispatch = useProjectDispatch();
  const clip = useDeep((_) => selectPortaledPatternClip(_, pcId));
  const { trackId, type, isOpen } = clip;
  const isSelected = useDeep((_) => selectIsClipSelected(_, id));

  const track = useDeep((_) => selectTrackById(_, trackId));
  const isAdding = useDeep(selectIsAddingPatternClips);
  const isPortaling = useDeep(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;
  const [_, drag] = useClipDrag(pcId);
  const onDragStart = useCallback(() => {
    dispatch(toggleClipDropdown({ data: { id, value: false } }));
  }, []);

  const top = useDeep((_) => selectTrackTop(_, trackId)) + POSE_HEIGHT;
  const left = useDeep((_) => selectClipLeft(_, pcId));
  const width = useDeep((_) => selectClipWidth(_, pcId));
  const height = useDeep((_) => selectTrackHeight(_, trackId)) - POSE_HEIGHT;

  if (!clip || !track) return null;
  return (
    <div
      ref={drag}
      data-type={type}
      data-open={!!isOpen}
      data-selected={isSelected}
      data-blur={isBlurred}
      style={{ top, left, width, height }}
      className={className}
      onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
      onDragStart={onDragStart}
    >
      <PatternClipHeader id={id} isSelected={isSelected} isOpen={!!isOpen} />
      {!!isOpen ? (
        <PatternClipDropdown {...props} clip={clip} id={id} />
      ) : (
        <PatternClipStream clip={clip} />
      )}
    </div>
  );
});
