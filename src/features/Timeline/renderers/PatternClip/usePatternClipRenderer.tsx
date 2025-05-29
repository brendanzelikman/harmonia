import { memo, useState } from "react";
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
  selectIsClipSelectedLast,
  selectIsClipSelected,
  selectTrackHeight,
  selectCellWidth,
} from "types/Timeline/TimelineSelectors";
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { selectTrackById } from "types/Track/TrackSelectors";
import { dispatchCustomEvent } from "utils/event";
import {
  clipClassName,
  ClipComponentProps,
  useClipDrag,
  useClipDropdown,
} from "features/Timeline/TimelineClips";
import { replaceClipIdsInSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { PatternClipMenu } from "./PatternClipMenu";

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
}

export const PatternClipRenderer = memo((props: PatternClipRendererProps) => {
  const { pcId, id, isDragging } = props;
  const dispatch = useAppDispatch();
  const clip = useAppValue((_) => selectPortaledPatternClip(_, pcId));
  const track = useAppValue((_) => selectTrackById(_, clip.trackId));
  const dropdown = useClipDropdown(id);
  const [_, drag] = useClipDrag(pcId);
  const [resizing, setResizing] = useState(false);
  const cellWidth = useAppValue(selectCellWidth);

  // Get timeline properties
  const isSelected = useAppValue((_) => selectIsClipSelected(_, id));
  const isSelectedLast = useAppValue((_) => selectIsClipSelectedLast(_, id));
  const isAdding = useAppValue(selectIsAddingClips);
  const isPortaling = useAppValue(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;
  const isCollapsed = !!track?.collapsed;
  const isMenuOpen = !isCollapsed && isSelectedLast && !isBlurred && !dropdown;

  // Get the clip dimensions
  const left = useAppValue((_) => selectClipLeft(_, pcId));
  const width = useAppValue((_) => selectClipWidth(_, pcId));
  const trackTop = useAppValue((_) => selectTrackTop(_, clip.trackId));
  const trackHeight = useAppValue((_) => selectTrackHeight(_, clip.trackId));
  const top = trackTop + POSE_NOTCH_HEIGHT;
  const height = trackHeight - POSE_NOTCH_HEIGHT;

  if (!clip || !track) return null;
  return (
    <>
      <div
        ref={drag}
        id={pcId}
        data-type="pattern"
        data-open={!!dropdown}
        data-selected={isSelected}
        data-blur={isBlurred}
        data-resizing={resizing}
        style={{ top, left, width, height: dropdown ? undefined : height }}
        className={clipClassName}
        onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
        onContextMenu={() =>
          dispatch(replaceClipIdsInSelection({ data: [id] }))
        }
        onMouseOver={(e) => {
          const clip = (e.nativeEvent.target as HTMLElement).offsetParent;
          if (!clip) return setResizing(false);
          const rect = clip.getBoundingClientRect();
          const offsetAfterClip = e.clientX - rect.left;
          const widthBeforeLastCell = rect.width - cellWidth;
          setResizing(offsetAfterClip > widthBeforeLastCell);
        }}
        onDragStart={() =>
          dispatchCustomEvent("clipDropdown", { value: false })
        }
      >
        <PatternClipHeader
          id={id}
          isSelected={isSelected}
          isOpen={!!dropdown}
        />
        {!isCollapsed ? <PatternClipStream clip={clip} /> : null}
        {!!dropdown ? (
          <PatternClipDropdown
            {...props}
            clip={clip}
            id={id}
            isOpen={!!dropdown}
          />
        ) : null}
      </div>
      {isMenuOpen && (
        <PatternClipMenu left={(left ?? 0) + (width ?? 0) + 4} top={top} />
      )}
    </>
  );
});
