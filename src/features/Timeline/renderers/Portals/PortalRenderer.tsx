import classNames from "classnames";
import { useDeep, useProjectDispatch } from "types/hooks";
import { usePortalDrag } from "./usePortalDrag";
import portalIcon from "assets/images/portal.svg";
import { Portal } from "types/Portal/PortalTypes";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectIsAddingClips,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectTrackById } from "types/Track/TrackSelectors";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { onPortalClick } from "types/Timeline/thunks/TimelineClickThunks";
import { useDragState } from "types/Media/MediaTypes";
import { Timed } from "types/units";
import { useCallback } from "react";

type PortalFragmentProps = { top: number; left: number };
type PortalProps = { portal: Timed<Portal> };

/** A timeline portal can be either a fragment or a real portal. */
type TimelinePortalProps = (PortalFragmentProps | PortalProps) & {
  width: number;
  height: number;
  isSelected?: boolean;
  isPortaling?: boolean;
};

export function TimelinePortal(props: TimelinePortalProps) {
  const dispatch = useProjectDispatch();
  const { width, height } = props;
  const { isSelected, isPortaling } = props;
  const isPortal = "portal" in props;
  const portal = isPortal ? props.portal : undefined;
  const dragState = useDragState();

  /** Update the timeline when dragging portals. */
  const onDragStart = useCallback(() => {
    dragState.set("draggingPortal", true);
  }, []);

  /** Update the timeline when releasing portals and call the thunk. */
  const onDragEnd = useCallback((item: any, monitor: any) => {
    dragState.set("draggingPortal", false);
    dispatch(onMediaDragEnd(item, monitor));
  }, []);

  /** A custom hook for dragging portals into cells. */
  const [Entry, entryDrag] = usePortalDrag({
    portal,
    isEntry: true,
    onDragStart,
    onDragEnd,
  });
  const [Exit, exitDrag] = usePortalDrag({
    portal,
    isEntry: false,
    onDragStart,
    onDragEnd,
  });
  const addingClips = useDeep(selectIsAddingClips);
  const draggingPatternClip = !!dragState.draggingPatternClip;
  const draggingPoseClip = !!dragState.draggingPoseClip;
  const isDragging = Entry.isDragging || Exit.isDragging;
  const isActive = isPortaling || addingClips;
  const isDraggingOther = draggingPatternClip || draggingPoseClip;

  // Get the entry portal info
  const tId = portal?.trackId;
  const entryTrack = useDeep((_) =>
    tId ? selectTrackById(_, portal?.trackId) : undefined
  );
  const entryTop = useDeep((_) => selectTrackTop(_, entryTrack?.id));
  const entryLeft = useDeep((_) => selectTimelineTickLeft(_, portal?.tick));

  // Get the exit portal info
  const exitTrack = useDeep((_) =>
    tId ? selectTrackById(_, portal?.portaledTrackId) : undefined
  );
  const exitTop = useDeep((_) => selectTrackTop(_, exitTrack?.id));
  const exitLeft = useDeep((_) =>
    selectTimelineTickLeft(_, portal?.portaledTick)
  );

  // Prepare the icon
  const PortalIcon = () => (
    <img
      src={portalIcon}
      draggable
      className={classNames(
        "w-full h-full -rotate-2 shadow-xl invert pointer-events-none"
      )}
    />
  );

  // Prepare the classname
  const portalClass = classNames(
    "z-10 absolute text-white rounded overflow-hidden border",
    isPortal ? "cursor-pointer" : "pointer-events-none",
    isSelected ? "border-white" : "border-slate-500/50",
    isDragging ? "opacity-50" : "opacity-100",
    isActive || isDraggingOther ? "pointer-events-none" : "pointer-events-all"
  );

  const track = useDeep((_) => (tId ? selectTrackById(_, tId) : undefined));

  if (!tId || !track) return null;
  /** Return an entry portal for the fragment. */
  if (!isPortal)
    return (
      <div
        className={classNames(
          portalClass,
          "bg-sky-500 animate-in fade-in ease-in duration-500"
        )}
        style={{ top: props.top, left: props.left, width, height }}
      >
        <PortalIcon />
      </div>
    );

  /** Otherwise, return both entry and exit portals. */
  return (
    <>
      <div
        ref={entryDrag}
        className={classNames(portalClass, "bg-sky-500")}
        style={{ top: entryTop, left: entryLeft, width, height }}
        onClick={(e) => portal && dispatch(onPortalClick(e, portal))}
      >
        <PortalIcon />
      </div>
      <div
        ref={exitDrag}
        className={classNames(portalClass, "bg-orange-400")}
        style={{ top: exitTop, left: exitLeft, width, height }}
        onClick={(e) => portal && dispatch(onPortalClick(e, portal))}
      >
        <PortalIcon />
      </div>
    </>
  );
}
