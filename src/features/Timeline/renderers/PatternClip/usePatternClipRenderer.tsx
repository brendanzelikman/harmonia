import { memo, useCallback, useState } from "react";
import { useSelect, useDispatch } from "hooks/useStore";
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
  selectIsAddingPatternClips,
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
import { ClipComponentProps } from "features/Timeline/TimelineClips";

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
}

export const PatternClipRenderer = memo((props: PatternClipRendererProps) => {
  const { pcId, id, isDragging, className } = props;
  const dispatch = useDispatch();
  const clip = useSelect((_) => selectPortaledPatternClip(_, pcId));
  const { trackId, type } = clip;
  const isSelected = useSelect((_) => selectIsClipSelected(_, id));
  const [isOpen, setIsOpen] = useState(false);
  const handleDropdown = useCallback(
    (e: CustomEvent<any>) => {
      if (e.detail.id === undefined || e.detail.id === id) {
        setIsOpen(e.detail.value === undefined ? !isOpen : e.detail.value);
      } else if (isOpen && e.detail.id.slice(0, 2) === id.slice(0, 2)) {
        setIsOpen(false);
      }
    },
    [isOpen, id]
  );
  useEvent("clipDropdown", handleDropdown);
  const track = useSelect((_) => selectTrackById(_, trackId));
  const isAdding = useSelect(selectIsAddingPatternClips);
  const isPortaling = useSelect(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;
  const isCollapsed = !!track?.collapsed;
  const [_, drag] = useDrag({
    type: "clip",
    item: () => {
      dispatchCustomEvent(`dragClip`, true);
      return { id: pcId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      dispatchCustomEvent(`dragClip`, false);
      dispatch(onMediaDragEnd(item, monitor));
    },
  });

  const top = useSelect((_) => selectTrackTop(_, trackId)) + POSE_NOTCH_HEIGHT;
  const left = useSelect((_) => selectClipLeft(_, pcId));
  const width = useSelect((_) => selectClipWidth(_, pcId));
  const height =
    useSelect((_) => selectTrackHeight(_, trackId)) - POSE_NOTCH_HEIGHT;

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
      onDragStart={() => dispatchCustomEvent("clipDropdown", { value: false })}
    >
      <PatternClipHeader id={id} isSelected={isSelected} isOpen={!!isOpen} />
      {!!isOpen ? (
        <PatternClipDropdown {...props} clip={clip} id={id} isOpen={!!isOpen} />
      ) : !isCollapsed ? (
        <PatternClipStream clip={clip} />
      ) : null}
    </div>
  );
});
