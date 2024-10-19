import { TrackButton } from "./components/TrackButton";
import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackDropdownButton } from "./components/TrackDropdownButton";
import { BiCopy } from "react-icons/bi";
import { BsArrowsCollapse, BsEraser, BsPencil, BsTrash } from "react-icons/bs";
import { cancelEvent, dispatchCustomEvent } from "utils/html";
import { useCallback, useRef, useState } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDnd";
import {
  useProjectSelector as use,
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
} from "types/hooks";
import { useTransportTick } from "hooks/useTransportTick";
import { TrackFormatterProps } from "./TrackFormatter";
import classNames from "classnames";
import {
  Gi3DStairs,
  GiDominoMask,
  GiHand,
  GiMusicalKeyboard,
  GiRadioTower,
} from "react-icons/gi";
import { TooltipButton } from "components/TooltipButton";
import { FaAnchor } from "react-icons/fa";
import { useTourId } from "features/Tour";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectCellHeight,
  selectIsLive,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackDepthById,
  selectTrackDescendants,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import {
  selectTrackMidiScaleAtTick,
  selectTrackScaleNameAtTick,
} from "types/Arrangement/ArrangementTrackSelectors";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  updateTrackByString,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { toggleTrackScaleEditor } from "types/Editor/EditorThunks";
import {
  insertScaleTrack,
  collapseTracks,
  collapseTrackChildren,
  duplicateTrack,
  clearTrack,
  deleteTrack,
} from "types/Track/TrackThunks";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getPoseVectorAsJSX } from "types/Pose/PoseFunctions";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { mod } from "utils/math";
import { getMidiPitchClass } from "utils/midi";
import { getScaleKey } from "utils/scale";

interface ScaleTrackProps extends TrackFormatterProps {
  track: ScaleTrack;
}

const qwertyKeys = ["q", "w", "e", "r", "t", "y"];
const HELD_KEYS = ["m", "s", "v", ...qwertyKeys];

export const ScaleTrackFormatter: React.FC<ScaleTrackProps> = (props) => {
  const { track, label, isSelected, isAncestorSelected } = props;
  const dispatch = useProjectDispatch();
  const cellHeight = use(selectCellHeight);
  const trackMap = useDeep(selectTrackMap);
  const isLive = use(selectIsLive);
  const midiScale = use((_) => selectTrackMidiScaleAtTick(_, track.id, 0));
  const trackId = track.id;
  const tourId = useTourId();

  // Drag and drop
  const ref = useRef<HTMLDivElement>(null);
  const element = ref.current;
  const [{}, drop] = useTrackDrop({ ...props, element });
  const [{ isDragging }, drag] = useTrackDrag({ ...props, element });
  drag(drop(ref));

  // Track info
  const depth = use((_) => selectTrackDepthById(_, trackId));
  const tick = useTransportTick();
  const scaleName = useDeep((_) =>
    selectTrackScaleNameAtTick(_, trackId, tick)
  );
  const children = useDeep((_) => selectTrackDescendants(_, trackId));
  const holding = useHeldHotkeys(HELD_KEYS);
  const isHoldingQwerty = qwertyKeys.some((key) => holding[key]);

  /** The Scale Track displays the name of the track or the name of its scale. */
  const ScaleTrackName = useCallback(() => {
    return (
      <TrackName
        id={track.id}
        height={cellHeight}
        value={track.collapsed ? scaleName : track.name ?? ""}
        disabled={track.collapsed}
        placeholder={`(${label}): Scale Track`}
        onChange={(e) => props.renameTrack(e.target.value)}
      />
    );
  }, [track, scaleName, cellHeight, label, isSelected, holding]);

  /** The Scale Track dropdown menu allows the user to perform general actions on the track. */
  const ScaleTrackDropdownMenu = useCallback(() => {
    const isChildCollapsed =
      children.length && children.some((track) => track?.collapsed);
    return (
      <TrackDropdownMenu>
        <TrackDropdownButton
          content="Insert Parent"
          icon={<FaAnchor />}
          onClick={() => dispatch(insertScaleTrack(trackId))}
        />
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(collapseTracks({ data: [trackId] }, !track.collapsed))
          }
        />
        <TrackDropdownButton
          content={`${isChildCollapsed ? "Expand " : "Collapse"} Children`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(collapseTrackChildren(trackId, !isChildCollapsed))
          }
        />
        <TrackDropdownButton
          content="Duplicate Track"
          icon={<BiCopy />}
          onClick={() => dispatch(duplicateTrack(trackId))}
        />
        <TrackDropdownButton
          content="Clear Track"
          icon={<BsEraser />}
          onClick={() => dispatch(clearTrack(trackId))}
        />
        <TrackDropdownButton
          content="Delete Track"
          icon={<BsTrash />}
          onClick={() => dispatch(deleteTrack({ data: trackId }))}
        />
      </TrackDropdownMenu>
    );
  }, [trackId, children, track, dispatch]);

  /** The Scale Track header displays the name and dropdown menu. */
  const ScaleTrackHeader = useCallback(
    () => (
      <div
        className="w-full flex items-center relative justify-end"
        draggable
        onDragStart={cancelEvent}
      >
        {ScaleTrackName()}
        <div className="flex flex-col w-12 mr-1 items-end">
          {ScaleTrackDropdownMenu()}
        </div>
      </div>
    ),
    [ScaleTrackName, ScaleTrackDropdownMenu]
  );

  /** The Scale Editor button toggles the scale editor. */
  const ScaleEditorButton = useCallback(() => {
    const buttonClass = classNames(
      "scale-track-scale-button",
      "relative px-2 border-sky-400"
    );
    return (
      <TrackButton
        className={buttonClass}
        onClick={(e) => {
          cancelEvent(e);
          dispatch(toggleTrackScaleEditor(trackId));
        }}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{scaleName}</span>
      </TrackButton>
    );
  }, [trackId, isSelected, scaleName]);

  const scaleTypes = ["name", "class", "midi"] as const;
  const [scaleTypeIndex, setScaleTypeIndex] = useState(0);
  const scaleType = scaleTypes[scaleTypeIndex];
  const cycleType = () => setScaleTypeIndex((prev) => mod(prev + 1, 3));
  const key = getScaleKey(midiScale);
  const name =
    scaleType === "name"
      ? scaleName
      : scaleType === "midi"
      ? midiScale.join(", ")
      : midiScale.map((n) => getMidiPitchClass(n, key)).join(", ");

  /** The Scale Track buttons include the scale editor button, pattern track button, and scale track button. */
  const ScaleTrackButtons = useCallback(
    () =>
      !track.collapsed && (
        <div
          className={`flex w-full flex-1 gap-2 items-center mt-2`}
          draggable
          onDragStart={cancelEvent}
          onDoubleClick={cancelEvent}
        >
          <div className="min-w-0 grow flex flex-col text-sm">
            <div
              className="flex text-sky-300 cursor-pointer"
              onClick={(e) => {
                cancelEvent(e);
                cycleType();
              }}
            >
              <GiDominoMask className="mr-1 my-auto inline shrink-0" />
              <div className="overflow-scroll">{name}</div>
            </div>
            <div className="flex hover:saturate-150 cursor-pointer items-center gap-1 text-fuchsia-300">
              <GiHand
                onMouseEnter={() =>
                  isLive && dispatchCustomEvent("live-shortcuts", true)
                }
                onMouseLeave={() =>
                  dispatchCustomEvent("live-shortcuts", false)
                }
              />
              {getPoseVectorAsJSX(track.vector ?? {}, trackMap)}
            </div>
          </div>
          <div className="shrink-0 flex gap-1 self-end">
            <TooltipButton
              className={`text-xl size-6 border rounded-full border-sky-500 active:bg-sky-500 select-none`}
              label="Update Scale"
              onClick={(e) => {
                cancelEvent(e);
                dispatch(updateTrackByString(track.id));
              }}
            >
              <GiRadioTower />
            </TooltipButton>
            <TooltipButton
              className={`text-xl size-6 flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`}
              label="Nest a Scale Track"
              onClick={(e) => {
                cancelEvent(e);
                dispatch(createScaleTrack({ parentId: track.id }));
              }}
            >
              <Gi3DStairs />
            </TooltipButton>
            <TooltipButton
              className={`text-xl size-6 border rounded-full border-emerald-500 active:bg-emerald-500 select-none`}
              label="Nest a Pattern Track"
              onClick={(e) => {
                cancelEvent(e);
                dispatch(createPatternTrack({ parentId: track.id }));
              }}
            >
              <GiMusicalKeyboard />
            </TooltipButton>
          </div>
        </div>
      ),
    [track, name, trackMap, ScaleEditorButton]
  );

  // Render the Scale Track
  return (
    <div
      className={classNames(
        "rdg-track size-full p-2 bg-indigo-700 text-white border-b border-b-slate-300",
        "animate-in fade-in slide-in-from-top-8",
        cellHeight < 100 ? "text-xs" : "text-sm",
        isDragging ? "opacity-50" : "opacity-100",
        "brightness-150 transition-all"
      )}
      ref={ref}
      style={{
        paddingLeft: depth * 4,
        filter: `hue-rotate(${(depth - 1) * 8}deg)${
          [
            "tour-step-the-pattern-track",
            "tour-step-instrument-editor-prompt",
            "tour-step-instrument-editor-intro",
          ].includes(tourId ?? "")
            ? " grayscale(90%)"
            : ""
        }`,
      }}
      onClick={() => dispatch(setSelectedTrackId({ data: trackId }))}
    >
      <div
        className={classNames(
          "size-full flex items-center bg-gradient-to-r from-sky-900 to-indigo-800 border-2 rounded transition-all",
          { "border-fuchsia-400": isSelected && isHoldingQwerty },
          { "border-blue-400": isSelected },
          { "border-slate-50/20": !isSelected && isAncestorSelected },
          { "border-sky-950": !isAncestorSelected && !isSelected }
        )}
      >
        <div
          className={classNames(
            track.collapsed ? "px-1" : "p-2",
            "size-full flex flex-1 flex-col items-start justify-evenly duration-300"
          )}
        >
          {ScaleTrackHeader()}
          {ScaleTrackButtons()}
        </div>
      </div>
    </div>
  );
};
