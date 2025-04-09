import { createPortal } from "react-dom";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "utils/constants";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { useStore } from "hooks/useStore";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectCellWidth,
  selectCellHeight,
  selectSelectedTrack,
  selectTimelineColumns,
  selectIsAddingPatternClips,
  selectIsAddingPoseClips,
  selectIsSlicingClips,
  selectIsAddingPortals,
  selectHasPortalFragment,
  selectSelectedClips,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackIds,
  selectCollapsedTrackMap,
} from "types/Track/TrackSelectors";
import { TimelineCursor } from "./TimelineCursor";
import { useMemo } from "react";
import classNames from "classnames";
import { useToggle } from "hooks/useToggle";

interface BackgroundProps {
  element?: HTMLDivElement;
}

// Timeline background so that the tracks can be scrolled
export const TimelineGraphics = (props: BackgroundProps) => {
  const cellWidth = useStore(selectCellWidth);
  const cellHeight = useStore(selectCellHeight);

  // The track dimensions are derived from the last track
  const collapsedMap = useStore(selectCollapsedTrackMap);
  const trackIds = useStore(selectTrackIds);

  // Selected track dimensions
  const st = useStore(selectSelectedTrack);
  const stTop = useStore((_) => selectTrackTop(_, st?.id));
  const stHeight = st?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

  // GetBackground dimensions
  const columns = useStore(selectTimelineColumns);
  const width = columns * cellWidth;
  const height = trackIds.reduce(
    (acc, id) =>
      collapsedMap[id] ? acc + COLLAPSED_TRACK_HEIGHT : acc + cellHeight,
    0
  );

  /** The timeline header background.  */
  const TimelineHeaderBackground = useMemo(
    () => (
      <div
        className="sticky inset-0 bg-black pointer-events-none"
        style={{ width, height: HEADER_HEIGHT }}
      ></div>
    ),
    [width]
  );

  /** The selected track has a lighter background than other tracks. */
  const SelectedTrackBackground = useMemo(
    () => (
      <div
        className="-z-10 absolute inset-0 bg-slate-300/25 flex flex-col pointer-events-none"
        style={{ width, height: stHeight, top: stTop }}
      />
    ),
    [width, stHeight, stTop]
  );

  const children = useMemo(
    () => (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ height, width }}
      >
        <div className="relative w-full h-full">
          <TimelineTopLeftCorner />
          {TimelineHeaderBackground}
          {!!st && SelectedTrackBackground}
          <TimelineCursor />
          <TimelinePlayhead />
        </div>
      </div>
    ),
    [st, width, height, SelectedTrackBackground, TimelineHeaderBackground]
  );

  /**
   * Render the graphical elements of the timeline that depend on scrolling, including:
   * * The top left corner.
   * * The header background.
   * * The selected track background.
   * * The tracks background.
   * * The cursor.
   */
  if (!props.element) return null;
  return createPortal(children, props.element);
};

const TimelineTopLeftCorner = () => {
  const isAddingPatterns = useStore(selectIsAddingPatternClips);
  const isAddingPoses = useStore(selectIsAddingPoseClips);
  const isAddingPortals = useStore(selectIsAddingPortals);
  const hasFragment = useStore(selectHasPortalFragment);
  const isSlicingClips = useStore(selectIsSlicingClips);
  const tree = useToggle("inputTree");
  const hasClips = !!useStore(selectSelectedClips).length;
  return (
    <div
      className={classNames(
        "sticky border-2 *:animate-in *:fade-in *:duration-300 transition-colors duration-300 size-full total-center-col text-white inset-0 -mb-20 z-[95] bg-gray-900",
        tree.isOpen
          ? "border-sky-500"
          : isAddingPatterns
          ? "border-emerald-500"
          : isAddingPoses
          ? "border-fuchsia-500"
          : isSlicingClips
          ? "border-teal-500"
          : isAddingPortals
          ? hasFragment
            ? "border-orange-500"
            : "border-sky-500"
          : hasClips
          ? "border-teal-500"
          : "border-white/0"
      )}
      style={{ width: TRACK_WIDTH, height: HEADER_HEIGHT }}
    >
      {tree.isOpen ? (
        <>
          <div className="text-base font-light">Creating Tree...</div>
          <div className="text-slate-400 text-sm">
            (Submit your prompt in the box)
          </div>
        </>
      ) : isAddingPatterns ? (
        <>
          <div className="text-base font-light">Creating Pattern...</div>
          <div className="text-slate-400 text-sm">
            (Click on a Cell in a Track)
          </div>
        </>
      ) : isAddingPoses ? (
        <>
          <div className="text-base font-light">Creating Pose...</div>
          <div className="text-slate-400 text-sm">
            (Click on a Cell in a Track)
          </div>
        </>
      ) : isSlicingClips ? (
        <>
          <div className="text-base font-light">Slicing Pattern...</div>
          <div className="text-slate-400 text-sm">
            (Click on a Pattern to slice)
          </div>
        </>
      ) : isAddingPortals ? (
        <>
          <div className="text-base font-light">
            Create {hasFragment ? "Exit Portal" : "Entry Portal"}
          </div>
          <div className="text-slate-400 text-sm">
            (Click on a Cell in a Track)
          </div>
        </>
      ) : hasClips ? (
        <>
          <div className="text-base font-light">Selected Clips</div>
          <div className="text-slate-400 text-sm">
            (Right Click for Context Menu)
          </div>
        </>
      ) : (
        <>
          <div className="text-base font-light">Timeline</div>
          <div className="text-slate-400 text-sm">
            (Scroll Grid to Navigate)
          </div>
        </>
      )}
    </div>
  );
};
