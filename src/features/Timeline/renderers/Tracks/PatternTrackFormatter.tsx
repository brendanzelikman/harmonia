import { useCallback, useRef, useState } from "react";
import { TrackButton } from "./components/TrackButton";
import { TrackName, TrackSlider, TrackDropdownMenu } from "./components";
import {
  BsHeadphones,
  BsPencil,
  BsVolumeDownFill,
  BsVolumeOffFill,
  BsVolumeUpFill,
} from "react-icons/bs";
import { cancelEvent, dispatchCustomEvent } from "utils/html";
import { percent } from "utils/math";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDnd";
import { MIN_VOLUME, MAX_VOLUME, MIN_PAN, MAX_PAN } from "utils/constants";
import { DEFAULT_VOLUME, DEFAULT_PAN } from "utils/constants";
import { VOLUME_STEP, PAN_STEP } from "utils/constants";
import { TrackFormatterProps } from "./TrackFormatter";
import { useProjectDispatch, use, useDeep } from "types/hooks";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import classNames from "classnames";
import { useAuth } from "providers/auth";
import { TooltipButton } from "components/TooltipButton";
import { useTourId } from "features/Tour";
import { isInstrumentEditorOpen } from "types/Editor/EditorFunctions";
import {
  getInstrumentName,
  getInstrumentChannel,
} from "types/Instrument/InstrumentFunctions";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { selectEditor } from "types/Editor/EditorSelectors";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import {
  selectCellHeight,
  selectIsLive,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackChain,
  selectTrackDepthById,
  selectTrackInstrumentKey,
} from "types/Track/TrackSelectors";
import { toggleTrackInstrumentEditor } from "types/Editor/EditorThunks";
import { toggleTrackMute, toggleTrackSolo } from "types/Track/TrackThunks";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { GiHand, GiPianoKeys, GiSoundWaves } from "react-icons/gi";
import { useTransportTick } from "hooks/useTransportTick";
import { selectTrackJSXAtTick } from "types/Arrangement/ArrangementTrackSelectors";

interface PatternTrackProps extends TrackFormatterProps {
  track: PatternTrack;
}

const qwertyKeys = ["q", "w", "e", "r", "t", "y"];
const HELD_KEYS = ["m", "s", "v", ...qwertyKeys];

export const PatternTrackFormatter: React.FC<PatternTrackProps> = (props) => {
  const { track, label, isSelected, isAncestorSelected } = props;
  const dispatch = useProjectDispatch();
  const depth = use((_) => selectTrackDepthById(_, track.id));
  const isLive = use(selectIsLive);
  const trackId = track.id;
  const tourId = useTourId();

  // Track drag and drop
  const trackRef = useRef<HTMLDivElement>(null);
  const element = trackRef.current;
  const [{}, drop] = useTrackDrop({ ...props, element });
  const [{ isDragging }, drag] = useTrackDrag({ ...props, element });
  drag(drop(trackRef));

  // Editor info
  const editor = use(selectEditor);
  const onInstrumentEditor = isInstrumentEditorOpen(editor);

  // Hotkey info
  const holding = useHeldHotkeys(HELD_KEYS);
  const isHoldingM = holding.m;
  const isHoldingS = holding.s;
  const isHoldingQwerty = qwertyKeys.some((key) => holding[key]);

  // Instrument info
  const instrument = use((_) => selectInstrumentById(_, track.instrumentId));
  const instrumentId = instrument?.id ?? "global";
  const iKey = use((_) => selectTrackInstrumentKey(_, trackId));
  const instrumentName = getInstrumentName(iKey);
  const { volume, pan, mute, solo } = getInstrumentChannel(instrument);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [draggingPan, setDraggingPan] = useState(false);

  // Cell info
  const cellHeight = use(selectCellHeight);
  const isSmall = cellHeight < 100;
  const sliderHeight = cellHeight - 55;

  /** A Pattern Track will display its name or the name of its instrument. */
  const PatternTrackName = useCallback(() => {
    return (
      <div className="w-full flex flex-col">
        <span className="text-xs text-orange-300 font-nunito"></span>
        <TrackName
          id={track.id}
          height={cellHeight}
          value={track.name ?? ""}
          placeholder={`(${label}): Pattern Track`}
          onChange={(e) => props.renameTrack(e.target.value)}
        />
      </div>
    );
  }, [track.name, label, isSelected, cellHeight]);

  /** The audio buttons will be condensed into text when the track is collapsed. */
  const CollapsedMuteAndSoloButtons = useCallback(() => {
    if (!track.collapsed) return null;
    const muteButton = classNames(
      { "text-shadow-lg": isHoldingM },
      { "text-slate-200 font-normal": !mute && !isHoldingM },
      { "text-rose-400 font-bold": mute },
      { "text-white font-semibold": !mute && isHoldingM }
    );
    const soloButton = classNames(
      { "text-shadow-lg": isHoldingS },
      { "text-slate-200 font-normal": !solo && !isHoldingS },
      { "text-yellow-400 font-bold": solo },
      { "text-white font-semibold": !solo && isHoldingS }
    );
    return (
      <div className="text-xs -mt-1 space-x-1 -mr-1">
        <span className={muteButton}>M</span>
        <span>•</span>
        <span className={soloButton}>S</span>
      </div>
    );
  }, [track, mute, solo, isHoldingM, isHoldingS]);

  /** The Pattern Track header displays the name, dropdown menu, and mute/solo buttons when collapsed. */
  const PatternTrackHeader = useCallback(() => {
    return (
      <div
        className={classNames(
          "w-full min-h-[2rem] max-h-[3rem] flex flex-1 relative items-center text-sm",
          track.collapsed ? "pb-3" : ""
        )}
        draggable
        onDragStart={cancelEvent}
      >
        {PatternTrackName()}
        <div className="flex flex-col w-12 mr-1 items-end">
          <TrackDropdownMenu track={track} />
          {CollapsedMuteAndSoloButtons()}
        </div>
      </div>
    );
  }, [PatternTrackName, CollapsedMuteAndSoloButtons]);

  /** The Pattern Track volume slider controls the volume of the track's instrument. */
  const PatternTrackVolumeSlider = useCallback(() => {
    const volumePercent = percent(volume, MIN_VOLUME, MAX_VOLUME);
    const sliderTop = -sliderHeight * (volumePercent / 100) + sliderHeight + 15;

    // Change the volume icon based on the loudness
    const IconType =
      volume > -20
        ? BsVolumeUpFill
        : volume > -40
        ? BsVolumeDownFill
        : BsVolumeOffFill;

    // Fade to emerald when dragging
    const iconClass = classNames(
      "transition-colors",
      { "text-emerald-400": draggingVolume },
      { "text-white": !draggingVolume }
    );

    // Update the instrument's volume when the slider changes
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const update = { volume: e.target.valueAsNumber };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
    };

    // Reset the instrument's volume when the slider is double clicked
    const onDoubleClick = () => {
      const update = { volume: DEFAULT_VOLUME };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
    };

    return (
      <div className="w-5 h-full z-[90] relative">
        <TrackSlider
          className={`h-5 accent-emerald-500`}
          value={volume}
          height={cellHeight}
          icon={<IconType className={iconClass} />}
          min={MIN_VOLUME}
          max={MAX_VOLUME - VOLUME_STEP}
          step={VOLUME_STEP}
          onChange={onChange}
          onDoubleClick={onDoubleClick}
          onMouseDown={() => setDraggingVolume(true)}
          onMouseUp={() => setDraggingVolume(false)}
          showTooltip={draggingVolume}
          tooltipTop={sliderTop}
          tooltipClassName="bg-emerald-700/80"
          tooltipContent={`${volume.toFixed(0)}dB`}
        />
      </div>
    );
  }, [volume, draggingVolume, cellHeight]);

  /** The Pattern Track pan slider controls the pan of the track's instrument. */
  const PatternTrackPanSlider = useCallback(() => {
    const leftPercent = percent(pan, MAX_PAN, MIN_PAN);
    const rightPercent = percent(pan, MIN_PAN, MAX_PAN);
    const sliderTop = -sliderHeight * (rightPercent / 100) + sliderHeight + 15;

    // Fade to teal when dragging
    const iconClass = classNames(
      "transition-colors",
      { "text-teal-400": draggingPan },
      { "text-white": !draggingPan }
    );

    // Update the instrument's pan when the slider changes
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const update = { pan: e.target.valueAsNumber };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
    };

    // Reset the instrument's pan when the slider is double clicked
    const onDoubleClick = () => {
      const update = { pan: DEFAULT_PAN };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
    };

    return (
      <div className="w-5 h-full z-[89] relative">
        <TrackSlider
          className={`h-5 accent-teal-400`}
          height={cellHeight}
          icon={<BsHeadphones className={iconClass} />}
          value={pan}
          min={MIN_PAN}
          max={MAX_PAN}
          step={PAN_STEP}
          onChange={onChange}
          onDoubleClick={onDoubleClick}
          onMouseDown={() => setDraggingPan(true)}
          onMouseUp={() => setDraggingPan(false)}
          showTooltip={draggingPan}
          tooltipTop={sliderTop}
          tooltipClassName="bg-teal-700/80"
          tooltipContent={`${leftPercent}L • ${rightPercent}R`}
        />
      </div>
    );
  }, [pan, draggingPan, cellHeight]);

  /** The Pattern Track volume and pan sliders are only visible when the track is expanded. */
  const PatternTrackSliders = useCallback(() => {
    if (track.collapsed) return null;
    return (
      <div className="flex-shrink-0 mr-1 z-50">
        <div className="flex" draggable onDragStart={cancelEvent}>
          {PatternTrackVolumeSlider()}
          {PatternTrackPanSlider()}
        </div>
      </div>
    );
  }, [track, PatternTrackVolumeSlider, PatternTrackPanSlider]);

  /** The instrument editor button toggles the instrument editor. */
  const InstrumentEditorButton = useCallback(() => {
    return (
      <TrackButton
        className={classNames(
          "pattern-track-instrument-button",
          "relative px-2 border border-orange-400",
          {
            "bg-gradient-to-r from-orange-500 to-orange-500/50 background-pulse":
              isSelected && onInstrumentEditor,
          }
        )}
        onClick={() => {
          dispatch(toggleTrackInstrumentEditor(trackId));
        }}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{instrumentName}</span>
      </TrackButton>
    );
  }, [trackId, isSelected, onInstrumentEditor, instrumentName]);

  const { tick } = useTransportTick();
  const jsx = useDeep((_) => selectTrackJSXAtTick(_, trackId, tick));

  /**
   * The Pattern Track has three main buttons.
   * * The first button toggles the instrument editor.
   * * The second button toggles the mute of the track's instrument.
   * * The third button toggles the solo of the track's instrument.
   */
  const PatternTrackButtons = useCallback(() => {
    return (
      <div
        className="w-full flex gap-2 items-center"
        draggable
        onDragStart={cancelEvent}
        onDoubleClick={cancelEvent}
      >
        <div className="min-w-0 w-full overflow-scroll flex flex-col text-sm mr-auto pr-2">
          <div className="flex text-orange-300 cursor-pointer">
            <GiPianoKeys className="mr-1 my-auto inline shrink-0" />
            <div className="overflow-scroll">{instrumentName}</div>
          </div>
          <div
            className="flex min-w-min hover:saturate-150 items-center gap-1 text-fuchsia-300 cursor-pointer"
            onMouseEnter={() =>
              isLive && dispatchCustomEvent("live-shortcuts", true)
            }
            onMouseLeave={() => dispatchCustomEvent("live-shortcuts", false)}
          >
            <GiHand />

            {jsx}
          </div>
        </div>
        <div className="flex min-w-0 shrink-0 *:size-6 gap-1 justify-self-end items-end h-full">
          <TooltipButton
            className={classNames(
              isSelected && onInstrumentEditor ? "bg-orange-400" : "",
              `text-lg size-full border rounded-full border-orange-400 active:bg-orange-400 select-none`
            )}
            label={onInstrumentEditor ? "Close" : "Edit Instrument"}
            onClick={(e) => {
              cancelEvent(e);
              dispatch(toggleTrackInstrumentEditor(trackId));
            }}
          >
            <GiSoundWaves />
          </TooltipButton>
          <TooltipButton
            label={solo ? "Unsolo Track" : "Solo Track"}
            className={classNames(
              "text-sm rounded-full text-center border-2 border-yellow-400/80",
              { "bg-yellow-400 text-white": solo },
              { "bg-yellow-400/30 text-shadow": !solo && isHoldingS },
              { "bg-emerald-600/20": !solo && !isHoldingS }
            )}
            onClick={(e) => {
              cancelEvent(e);
              dispatch(toggleTrackSolo(e.nativeEvent, track.id));
            }}
          >
            S
          </TooltipButton>
          <TooltipButton
            label={mute ? "Unmute Track" : "Mute Track"}
            className={classNames(
              "text-sm rounded-full text-center border-2 border-rose-400/80",
              { "bg-rose-400 text-white": mute },
              { "bg-rose-400/30 text-shadow": !mute && isHoldingM },
              { "bg-emerald-600/20": !mute && !isHoldingM }
            )}
            onClick={(e) => dispatch(toggleTrackMute(e.nativeEvent, track.id))}
          >
            M
          </TooltipButton>
        </div>
      </div>
    );
  }, [
    InstrumentEditorButton,
    instrumentName,
    track,
    isLive,
    jsx,
    mute,
    solo,
    isHoldingM,
    isHoldingS,
  ]);

  // Return the pattern track
  return (
    <div
      ref={trackRef}
      onClick={() => dispatch(setSelectedTrackId({ data: trackId }))}
      className={classNames(
        "rdg-track size-full p-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600",
        "animate-in fade-in slide-in-from-top-8",
        "border-b relative border-b-slate-300 transition-all",
        { "opacity-50": isDragging, "opacity-100": !isDragging },
        { "text-xs": isSmall, "text-sm": !isSmall }
      )}
      style={{
        paddingLeft: depth * 8,
        filter: `hue-rotate(${(depth - 2) * 4}deg)${
          [
            "tour-step-the-scale-track",
            "tour-step-scale-editor-intro",
            "tour-step-scale-editor-prompt",
          ].includes(tourId ?? "")
            ? " grayscale(90%)"
            : ""
        }`,
      }}
    >
      <div
        className={classNames(
          "bg-gradient-to-r from-sky-700/80 to-emerald-700/50",
          "w-full h-full items-center flex border-2 rounded transition-all",
          { "border-fuchsia-400": isSelected && isHoldingQwerty },
          { "border-orange-400": isSelected && onInstrumentEditor },
          { "border-blue-400": isSelected },
          { "border-slate-50/20": isAncestorSelected && !isSelected },
          { "border-emerald-950": !isSelected && !isAncestorSelected }
        )}
      >
        {PatternTrackSliders()}
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2">
          {PatternTrackHeader()}
          {!track.collapsed && PatternTrackButtons()}
        </div>
      </div>
    </div>
  );
};
