import { memo, useCallback, useState } from "react";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { PatternClipId, PortaledPatternClipId } from "types/Clip/ClipTypes";
import { selectPortaledPatternClip } from "types/Arrangement/ArrangementClipSelectors";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import {
  selectClipLeft,
  selectClipWidth,
} from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectIsAddingClips,
  selectIsAddingPortals,
  selectIsClipSelected,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { selectTrackById } from "types/Track/TrackSelectors";
import { useEvent } from "hooks/useEvent";
import { dispatchCustomEvent } from "utils/event";
import { useDrag } from "react-dnd";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import {
  clipClassName,
  ClipComponentProps,
} from "features/Timeline/TimelineClips";

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
}

export const PatternClipRenderer = memo((props: PatternClipRendererProps) => {
  const { pcId, id, isDragging } = props;
  const dispatch = useAppDispatch();
  const clip = useAppValue((_) => selectPortaledPatternClip(_, pcId));
  const { trackId } = clip;
  const isSelected = useAppValue((_) => selectIsClipSelected(_, id));
  const [isOpen, setIsOpen] = useState(false);
  const handleDropdown = useCallback(
    (e: CustomEvent<any>) => {
      if (e.detail.id === undefined || e.detail.id === id) {
        setIsOpen(e.detail.value === undefined ? !isOpen : e.detail.value);
      }
    },
    [isOpen]
  );
  useEvent("clipDropdown", handleDropdown);
  const track = useAppValue((_) => selectTrackById(_, trackId));
  const isAdding = useAppValue(selectIsAddingClips);
  const isPortaling = useAppValue(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;
  const isCollapsed = !!track?.collapsed;
  const [_, drag] = useDrag({
    type: "clip",
    item: (monitor) => {
      dispatchCustomEvent(`dragClip`, true);
      const clip = document.getElementById(pcId);
      if (!clip) return { id: pcId };
      const clientOffset = monitor.getClientOffset();
      const clipRect = clip.getBoundingClientRect();
      const offsetX = clientOffset ? clientOffset.x - clipRect.left : 0;
      return { id: pcId, offsetX };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      dispatchCustomEvent(`dragClip`, false);
      dispatch(onMediaDragEnd(item, monitor));
    },
  });

  const top =
    useAppValue((_) => selectTrackTop(_, trackId)) + POSE_NOTCH_HEIGHT;
  const left = useAppValue((_) => selectClipLeft(_, pcId));
  const width = useAppValue((_) => selectClipWidth(_, pcId));
  const height =
    useAppValue((_) => selectTrackHeight(_, trackId)) - POSE_NOTCH_HEIGHT;

  if (!clip || !track) return null;
  return (
    <div
      ref={drag}
      id={pcId}
      data-type="pattern"
      data-open={!!isOpen}
      data-selected={isSelected}
      data-blur={isBlurred}
      style={{ top, left, width, height }}
      className={clipClassName}
      onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
      onDragStart={() => dispatchCustomEvent("clipDropdown", { value: false })}
    >
      <PatternClipHeader id={id} isSelected={isSelected} isOpen={!!isOpen} />
      {!isCollapsed ? <PatternClipStream clip={clip} /> : null}
      {!!isOpen ? (
        <PatternClipDropdown {...props} clip={clip} id={id} isOpen={!!isOpen} />
      ) : null}
    </div>
  );
});
