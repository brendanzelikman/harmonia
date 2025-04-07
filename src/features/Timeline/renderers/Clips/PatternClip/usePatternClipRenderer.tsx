import { memo, useCallback, useState } from "react";
import { useClipDrag } from "../useClipDnd";
import { useStore, useDispatch } from "types/hooks";
import { PatternClipId, PortaledPatternClipId } from "types/Clip/ClipTypes";
import { selectPortaledPatternClip } from "types/Arrangement/ArrangementClipSelectors";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
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
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { selectTrackById } from "types/Track/TrackSelectors";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { dispatchCustomEvent } from "utils/html";
import { useHotkeys } from "react-hotkeys-hook";

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
}

export const PatternClipRenderer = memo((props: PatternClipRendererProps) => {
  const { pcId, id, isDragging, className } = props;
  const dispatch = useDispatch();
  const clip = useStore((_) => selectPortaledPatternClip(_, pcId));
  const { trackId, type } = clip;
  const isSelected = useStore((_) => selectIsClipSelected(_, id));
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
  useCustomEventListener("clipDropdown", handleDropdown);
  useHotkeys("esc", () =>
    dispatchCustomEvent("clipDropdown", { id, value: false })
  );
  const track = useStore((_) => selectTrackById(_, trackId));
  const isAdding = useStore(selectIsAddingPatternClips);
  const isPortaling = useStore(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;
  const isCollapsed = !!track?.collapsed;
  const [_, drag] = useClipDrag(pcId);

  const top = useStore((_) => selectTrackTop(_, trackId)) + POSE_NOTCH_HEIGHT;
  const left = useStore((_) => selectClipLeft(_, pcId));
  const width = useStore((_) => selectClipWidth(_, pcId));
  const height =
    useStore((_) => selectTrackHeight(_, trackId)) - POSE_NOTCH_HEIGHT;

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
