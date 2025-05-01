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
  selectIsClipSelectedLast,
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
import { replaceClipIdsInSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { useHeldKeys } from "hooks/useHeldkeys";
import classNames from "classnames";

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
    item: (monitor: any) => {
      dispatchCustomEvent(`dragClip`, true);
      const clip = document.getElementById(pcId);
      if (!clip) return { id: pcId };
      const clientOffset = monitor.getClientOffset();
      const clipRect = clip.getBoundingClientRect();
      const offsetX = clientOffset ? clientOffset.x - clipRect.left : 0;
      return { id: pcId, offsetX };
    },
    collect: (monitor: any) => ({
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

  const heldKeys = useHeldKeys(["alt", "control", "shift", "meta"]);
  const holdingAlt = heldKeys["AltLeft"];
  const holdingCtrl = heldKeys["ControlLeft"];
  const holdingShift = heldKeys["ShiftLeft"];
  const holdingMeta = heldKeys["MetaLeft"];
  const menuLeft = (left ?? 0) + (width ?? 0) + 2;
  const isLast = useAppValue((_) => selectIsClipSelectedLast(_, id));
  const isMenuOpen =
    !isCollapsed &&
    isLast &&
    !isBlurred &&
    !isOpen &&
    !holdingAlt &&
    !holdingShift;
  if (!clip || !track) return null;
  return (
    <>
      <div
        ref={drag}
        id={pcId}
        data-type="pattern"
        data-open={!!isOpen}
        data-selected={isSelected}
        data-blur={isBlurred}
        data-alt={!!holdingAlt}
        data-ctrl={!!holdingCtrl}
        data-shift={!!holdingShift}
        data-meta={!!holdingMeta}
        style={{ top, left, width, height }}
        className={clipClassName}
        onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
        onContextMenu={() => {
          dispatch(replaceClipIdsInSelection({ data: [id] }));
        }}
        onDragStart={() =>
          dispatchCustomEvent("clipDropdown", { value: false })
        }
      >
        <PatternClipHeader id={id} isSelected={isSelected} isOpen={!!isOpen} />
        {!isCollapsed ? <PatternClipStream clip={clip} /> : null}
        {!!isOpen ? (
          <PatternClipDropdown
            {...props}
            clip={clip}
            id={id}
            isOpen={!!isOpen}
          />
        ) : null}
      </div>
      {isMenuOpen && (
        <>
          <div
            style={{ left: menuLeft, top: top }}
            className={classNames(
              "absolute z-[31] text-xs flex flex-col gap-0.5 *:border-b font-light animate-in fade-in whitespace-nowrap w-48 p-[3px] px-1 rounded bg-slate-900/90 backdrop-blur text-emerald-300/80"
            )}
          >
            <div className="text-emerald-300/80">
              Cmd + Click to Edit Pattern
            </div>
            <div className="text-cyan-300/80">Ctrl + Click to Edit Clips</div>
            <div className="text-indigo-300/90">
              Option + Click to Select Clips
            </div>
            <div className="text-violet-300/90">
              Shift + Click to Select Range
            </div>
            <div className="text-slate-200/90">Escape to Close Menus</div>
          </div>
        </>
      )}
    </>
  );
});
