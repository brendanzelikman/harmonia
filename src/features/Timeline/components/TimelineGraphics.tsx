import { createPortal } from "react-dom";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "utils/constants";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
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
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackIds,
  selectCollapsedTrackMap,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { TimelineCursor } from "./TimelineCursor";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { useToggle } from "hooks/useToggle";
import { useTick } from "types/Transport/TransportTick";
import { clamp } from "lodash";
import { selectGame } from "types/Game/GameSelectors";
import {
  STOP_TRANSPORT,
  useTransportState,
} from "types/Transport/TransportState";
import { GameRank } from "types/Game/GameTypes";
import { evaluateGameRank, resetGame } from "types/Game/GameThunks";
import { GiStarSwirl } from "react-icons/gi";
import { useEvent } from "hooks/useEvent";

interface BackgroundProps {
  element?: HTMLDivElement;
}

// Timeline background so that the tracks can be scrolled
export const TimelineGraphics = (props: BackgroundProps) => {
  const cellWidth = useAppValue(selectCellWidth);
  const cellHeight = useAppValue(selectCellHeight);

  // The track dimensions are derived from the last track
  const collapsedMap = useAppValue(selectCollapsedTrackMap);
  const trackIds = useAppValue(selectTrackIds);

  // Selected track dimensions
  const st = useAppValue(selectSelectedTrack);
  const stTop = useAppValue((_) => selectTrackTop(_, st?.id));
  const stHeight = st?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

  // GetBackground dimensions
  const columns = useAppValue(selectTimelineColumns);
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
  const isAddingPatterns = useAppValue(selectIsAddingPatternClips);
  const isAddingPoses = useAppValue(selectIsAddingPoseClips);
  const isAddingPortals = useAppValue(selectIsAddingPortals);
  const hasFragment = useAppValue(selectHasPortalFragment);
  const isSlicingClips = useAppValue(selectIsSlicingClips);
  const tree = useToggle("inputTree");
  const selectedTrackId = useAppValue(selectSelectedTrackId);
  const labelMap = useAppValue(selectTrackLabelMap);
  const hasClips = !!useAppValue(selectSelectedClips).length;

  const dispatch = useAppDispatch();
  const tick = useTick();
  const state = useTransportState();
  const game = useAppValue(selectGame);
  const actions = game?.actions ?? [];
  const hasGame = !!game && actions.length > 0;
  const canGame = selectedTrackId === game?.trackId;
  const lastTick = Math.max(0, ...actions.map((a) => a?.tick ?? 0));
  const [rank, setRank] = useState<GameRank | undefined>();
  const [shouldRank, setShouldRank] = useState(false);
  useEvent(STOP_TRANSPORT, () => dispatch(resetGame()));
  useEffect(() => {
    if (state !== "started") {
      setShouldRank(false);
      setRank(undefined);
    } else if (tick > lastTick && !shouldRank) {
      setShouldRank(true);
      setRank(dispatch(evaluateGameRank()));
    }
  }, [state, tick, shouldRank]);

  const Rank = rank ? (
    <div className="flex gap-2 text-2xl">
      {new Array(rank.rank).fill(0).map((_, i) => (
        <GiStarSwirl key={i} />
      ))}
    </div>
  ) : (
    "Fail!"
  );

  const Game = (
    <div className="w-full relative overflow-hidden">
      <div className="w-2 rounded-sm h-16 ml-4 bg-emerald-500" />
      {tick === 0 && (
        <div className="absolute flex flex-col top-2.5 left-8">
          <div className="text-fuchsia-300 text-base">
            {" "}
            Rhythm Game Available
          </div>
          <div className="text-slate-300 font-light text-sm">
            {!canGame
              ? `Select Track (${labelMap[game.trackId!]}) To Play`
              : `Ready When You Are!`}
          </div>
        </div>
      )}
      {canGame &&
        !!tick &&
        actions.map((action, i) =>
          !!action ? (
            <div
              key={i}
              className="absolute capitalize w-min flex flex-col border border-fuchsia-300 text-xl rounded inset-0 font-bold bg-fuchsia-400/50 p-2"
              style={{
                left: action.tick - tick,
                opacity:
                  tick + 8 > action.tick || tick - action.tick > TRACK_WIDTH
                    ? 0
                    : !tick || action.tick - tick < 30
                    ? 1
                    : clamp(
                        (TRACK_WIDTH - (action.tick - tick)) / TRACK_WIDTH,
                        0,
                        1
                      ),
              }}
            >
              <span>{action.key}</span>
              <span>{action.value}</span>
            </div>
          ) : null
        )}
    </div>
  );

  const Action = tree.isOpen ? (
    <>
      <div className="text-base font-light">Creating Tree...</div>
      <div className="text-slate-400 text-sm">
        (Submit your prompt in the menu)
      </div>
    </>
  ) : isAddingPatterns ? (
    <>
      <div className="text-base font-light">Creating Pattern...</div>
      <div className="text-slate-400 text-sm">(Click on a Cell in a Track)</div>
    </>
  ) : isAddingPoses ? (
    <>
      <div className="text-base font-light">Creating Pose...</div>
      <div className="text-slate-400 text-sm">(Click on a Cell in a Track)</div>
    </>
  ) : isSlicingClips ? (
    <>
      <div className="text-base font-light">Slicing Pattern...</div>
      <div className="text-slate-400 text-sm">
        (Click on a Pattern to Slice)
      </div>
    </>
  ) : isAddingPortals ? (
    <>
      <div className="text-base font-light">
        Create {hasFragment ? "Exit Portal" : "Entry Portal"}
      </div>
      <div className="text-slate-400 text-sm">(Click on a Cell in a Track)</div>
    </>
  ) : hasClips ? (
    <>
      <div className="text-base font-light">Selected Clips</div>
      <div className="text-slate-400 text-sm">(Drag and Drop to Move )</div>
    </>
  ) : (
    <></>
  );
  return (
    <div
      className={classNames(
        "sticky border-2 *:animate-in *:fade-in *:select-none *:duration-300 transition-colors duration-300 size-full total-center-col text-white inset-0 -mb-20 z-[95] bg-gray-900",
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
      {hasGame && (!tick || canGame) ? (shouldRank ? Rank : Game) : Action}
    </div>
  );
};
