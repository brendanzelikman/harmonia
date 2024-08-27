import classNames from "classnames";
import { use, useProjectDispatch } from "types/hooks";
import { usePortalDrag } from "./usePortalDrag";
import portalIcon from "assets/images/portal.svg";
import { Portal } from "types/Portal/PortalTypes";
import { updateMediaDragState } from "types/Timeline/TimelineSlice";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectMediaDragState,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectTrackById } from "types/Track/TrackSelectors";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { onPortalClick } from "types/Timeline/TimelineThunks";

type PortalFragmentProps = { top: number; left: number };
type PortalProps = { portal: Portal };

/** A timeline portal can be either a fragment or a real portal. */
type TimelinePortalProps = (PortalFragmentProps | PortalProps) & {
  width: number;
  height: number;
  isSelected?: boolean;
  isPortaling?: boolean;
  isClipping?: boolean;
  isTransposing?: boolean;
};

export function TimelinePortal(props: TimelinePortalProps) {
  const dispatch = useProjectDispatch();
  const { width, height } = props;
  const { isSelected, isPortaling, isClipping, isTransposing } = props;
  const isPortal = "portal" in props;
  const portal = isPortal ? props.portal : undefined;

  /** Update the timeline when dragging portals. */
  const onDragStart = () => {
    dispatch(updateMediaDragState({ draggingPortal: true }));
  };

  /** Update the timeline when releasing portals and call the thunk. */
  const onDragEnd = (item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingPortal: false }));
    dispatch(onMediaDragEnd(item, monitor));
  };

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
  const dragState = use(selectMediaDragState);
  const draggingPatternClip = !!dragState?.draggingPatternClip;
  const draggingPoseClip = !!dragState?.draggingPoseClip;
  const isDragging = Entry.isDragging || Exit.isDragging;
  const isActive = isPortaling || isClipping || isTransposing;
  const isDraggingOther = draggingPatternClip || draggingPoseClip;

  // Get the entry portal info
  const tId = portal?.trackId;
  const entryTrack = use((_) =>
    tId ? selectTrackById(_, portal?.trackId) : undefined
  );
  const entryTop = use((_) => selectTrackTop(_, entryTrack?.id));
  const entryLeft = use((_) => selectTimelineTickLeft(_, portal?.tick));

  // Get the exit portal info
  const exitTrack = use((_) =>
    tId ? selectTrackById(_, portal?.portaledTrackId) : undefined
  );
  const exitTop = use((_) => selectTrackTop(_, exitTrack?.id));
  const exitLeft = use((_) => selectTimelineTickLeft(_, portal?.portaledTick));

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
