import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { cancelEvent, dispatchCustomEvent } from "utils/html";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDnd";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { useTransportTick } from "hooks/useTransportTick";
import { TrackFormatterProps } from "./TrackFormatter";
import classNames from "classnames";
import {
  Gi3DStairs,
  GiDominoMask,
  GiHand,
  GiMusicalKeyboard,
} from "react-icons/gi";
import { TooltipButton } from "components/TooltipButton";
import { useTourId } from "features/Tour";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectCellHeight,
  selectIsLive,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackDepthById,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import {
  selectTrackJSXAtTick,
  selectTrackScaleNameAtTick,
} from "types/Arrangement/ArrangementTrackSelectors";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  updateTrackByString,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
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
  const isLive = use(selectIsLive);
  const midiScale = useDeep((_) => selectTrackMidiScale(_, track.id));
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
  const holding = useHeldHotkeys(HELD_KEYS);
  const isHoldingQwerty = qwertyKeys.some((key) => holding[key]);

  const scaleTypes = ["name", "class", "midi"] as const;
  const [scaleTypeIndex, setScaleTypeIndex] = useState(0);
  const scaleType = scaleTypes[scaleTypeIndex];
  const { component, name, jsx } = ScaleTrackName({
    track,
    label,
    midiScale,
    scaleType,
    cellHeight,
    renameTrack: (name) => props.renameTrack(name),
  });
  const cycleType = () => setScaleTypeIndex((prev) => mod(prev + 1, 3));

  /** The Scale Track header displays the name and dropdown menu. */
  const ScaleTrackHeader = useCallback(
    () => (
      <div
        className="w-full flex items-center relative justify-end"
        draggable
        onDragStart={cancelEvent}
      >
        {component}
        <div className="flex flex-col w-12 mr-1 items-end">
          <TrackDropdownMenu track={track} />
        </div>
      </div>
    ),
    [track, label, component, cellHeight]
  );

  /** The Scale Track buttons include the scale editor button, pattern track button, and scale track button. */
  const ScaleTrackButtons = useCallback(() => {
    if (track.collapsed) return null;
    return (
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
          <div
            className="flex w-min hover:saturate-150 cursor-pointer items-center gap-1 text-fuchsia-300"
            onMouseEnter={() =>
              isLive && dispatchCustomEvent("live-shortcuts", true)
            }
            onMouseLeave={() => dispatchCustomEvent("live-shortcuts", false)}
          >
            <GiHand />
            {jsx}
          </div>
        </div>
        <div className="shrink-0 flex gap-1 self-end">
          <TooltipButton
            className={`text-xl size-6 border rounded-full border-sky-500 active:bg-sky-500 select-none`}
            label="Change Scale"
            onClick={(e) => {
              cancelEvent(e);
              dispatch(updateTrackByString(track.id));
            }}
          >
            <GiDominoMask />
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
    );
  }, [track.id, track.collapsed, name, jsx, isLive]);

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
        paddingLeft: depth * 8,
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
          "size-full transition-all flex items-center bg-gradient-to-r from-sky-900 to-indigo-800 border-2 rounded",
          { "border-fuchsia-400": isSelected && isHoldingQwerty },
          { "border-blue-400": isSelected },
          { "border-slate-50/20": !isSelected && isAncestorSelected },
          { "border-sky-950": !isAncestorSelected && !isSelected }
        )}
      >
        <div
          className={classNames(
            track.collapsed ? "px-1" : "p-2",
            "size-full flex flex-1 flex-col items-start justify-evenly"
          )}
        >
          {ScaleTrackHeader()}
          {ScaleTrackButtons()}
        </div>
      </div>
    </div>
  );
};

const ScaleTrackName = (props: {
  track: ScaleTrack;
  label?: string;
  midiScale: number[];
  scaleType: string;
  cellHeight: number;
  renameTrack: (name: string) => void;
}) => {
  const { track, label, scaleType, cellHeight, midiScale } = props;
  const { tick } = useTransportTick();
  const scaleName = use((_) => selectTrackScaleNameAtTick(_, track.id, tick));
  const jsx = useDeep((_) => selectTrackJSXAtTick(_, track.id, tick));
  const key = getScaleKey(midiScale);

  const name = useMemo(
    () =>
      scaleType === "name"
        ? scaleName
        : scaleType === "midi"
        ? midiScale.join(", ")
        : midiScale.map((n) => getMidiPitchClass(n, key)).join(", "),
    [scaleType, scaleName, midiScale, key]
  );

  const component = (
    <TrackName
      id={track.id}
      height={cellHeight}
      value={track.collapsed ? scaleName : track.name ?? ""}
      disabled={track.collapsed}
      placeholder={`(${label}): Scale Track`}
      onChange={(e) => props.renameTrack(e.target.value)}
    />
  );

  return { component, name, jsx };
};
