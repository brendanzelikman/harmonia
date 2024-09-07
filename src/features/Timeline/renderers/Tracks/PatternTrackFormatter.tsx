import { useEffect, useRef, useState } from "react";
import { TrackButton } from "./components/TrackButton";
import {
  TrackName,
  TrackSlider,
  TrackDropdownMenu,
  TrackDropdownButton,
} from "./components";
import {
  BsArrowsCollapse,
  BsArrowsExpand,
  BsEraser,
  BsHeadphones,
  BsPencil,
  BsPlugin,
  BsTrash,
  BsVolumeDownFill,
  BsVolumeOffFill,
  BsVolumeUpFill,
  BsWifi,
} from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { cancelEvent } from "utils/html";
import { percent } from "utils/math";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDnd";
import {
  MIN_VOLUME,
  MAX_VOLUME,
  MIN_PAN,
  MAX_PAN,
  PLUGIN_PORT_RANGE,
  PLUGIN_STARTING_PORT,
} from "utils/constants";
import { DEFAULT_VOLUME, DEFAULT_PAN } from "utils/constants";
import { VOLUME_STEP, PAN_STEP } from "utils/constants";
import { TrackFormatterProps } from "./TrackFormatter";
import {
  useProjectDispatch,
  use,
  useProjectDeepSelector,
  useDeep,
} from "types/hooks";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import classNames from "classnames";
import { promptModal } from "components/PromptModal";
import isElectron from "is-electron";
import { useHotkeys } from "react-hotkeys-hook";
import { useAuth } from "providers/auth";
import { FaAnchor } from "react-icons/fa";
import { TooltipButton } from "components/TooltipButton";
import { useTourId } from "features/Tour";
import { isInstrumentEditorOpen } from "types/Editor/EditorFunctions";
import {
  getInstrumentName,
  getInstrumentChannel,
} from "types/Instrument/InstrumentFunctions";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import { sendPluginData } from "types/Plugin/PluginFunctions";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { selectEditor } from "types/Editor/EditorSelectors";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { selectPluginData } from "types/Plugin/PluginSelectors";
import {
  selectIsLive,
  selectCellHeight,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackChain,
  selectTrackDepthById,
  selectTrackInstrumentKey,
} from "types/Track/TrackSelectors";
import { toggleTrackInstrumentEditor } from "types/Editor/EditorThunks";
import {
  bindTrackToPort,
  insertScaleTrack,
  collapseTracks,
  duplicateTrack,
  clearTrack,
  deleteTrack,
  toggleTrackMute,
  toggleTrackSolo,
  collapseTrackParents,
} from "types/Track/TrackThunks";
import { updateTrack } from "types/Track/TrackThunks";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";

interface PatternTrackProps extends TrackFormatterProps {
  track: PatternTrack;
}

export const PatternTrackFormatter: React.FC<PatternTrackProps> = (props) => {
  const { track, label, isSelected } = props;
  const { isVirtuoso } = useAuth();
  const dispatch = useProjectDispatch();
  const depth = use((_) => selectTrackDepthById(_, track.id));
  const isLive = use(selectIsLive);
  const chain = useDeep((_) => selectTrackChain(_, track.id));

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
  const heldKeys = useHeldHotkeys(["m", "s"]);
  const isHoldingM = heldKeys.m;
  const isHoldingS = heldKeys.s;

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

  // Plugin info
  const pluginData = useProjectDeepSelector((_) =>
    selectPluginData(_, trackId)
  );

  // Send plugin data when it changes
  useEffect(() => {
    if (!pluginData) return;
    sendPluginData(pluginData);
  }, [pluginData]);

  useHotkeys(
    "f",
    () => {
      if (!pluginData || !isSelected) return;
      sendPluginData(pluginData);
    },
    [pluginData, isSelected]
  );

  /** A Pattern Track will display its name or the name of its instrument. */
  const PatternTrackName = () => {
    return (
      <div className="w-full flex flex-col space-y-1">
        <span className="text-xs text-orange-300 font-nunito"></span>
        <TrackName
          id={trackId}
          value={track.name ?? ""}
          placeholder={`Track ${label} (Pattern)`}
          onChange={(e) => props.renameTrack(e.target.value)}
        />
      </div>
    );
  };

  /** The Pattern Track dropdown menu allows the user to perform general actions on the track. */
  const PatternTrackDropdownMenu = () => {
    const isParentCollapsed =
      chain.length && chain.some((track) => track?.collapsed);
    const showPortFeatures = isVirtuoso && !!isElectron();
    const channel = track.port ? track.port - PLUGIN_STARTING_PORT : 0;

    const onPortClick = async () => {
      // Clear the port if it is already bound
      if (track.port !== undefined) {
        dispatch(updateTrack({ data: { id: trackId, port: undefined } }));
        return;
      }

      // Prompt the user for a channel
      const result = await promptModal(
        "Bind Your Track",
        `Please input a channel between 1 and ${PLUGIN_PORT_RANGE}.`
      );
      const value = parseInt(result);
      if (isNaN(value) || value < 1 || value > PLUGIN_PORT_RANGE) return;

      // Bind the track to the port
      const port = PLUGIN_STARTING_PORT + value;
      dispatch(bindTrackToPort({ data: { id: trackId, port } }));
    };

    return (
      <TrackDropdownMenu>
        {showPortFeatures && (
          <TrackDropdownButton
            content={
              track.port === undefined
                ? "Connect to Plugin"
                : `Serving Channel ${channel}`
            }
            icon={<BsWifi />}
            onClick={onPortClick}
          />
        )}
        {!!pluginData && (
          <TrackDropdownButton
            content={`Flush To Plugin`}
            icon={<BsPlugin />}
            onClick={() => sendPluginData(pluginData)}
          />
        )}
        <TrackDropdownButton
          content="Insert Parent"
          icon={<FaAnchor />}
          onClick={() => dispatch(insertScaleTrack(trackId))}
        />
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={track.collapsed ? <BsArrowsExpand /> : <BsArrowsCollapse />}
          onClick={() =>
            dispatch(collapseTracks({ data: [trackId] }, !track.collapsed))
          }
        />
        <TrackDropdownButton
          content={`${isParentCollapsed ? "Expand " : "Collapse"} Parents`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(collapseTrackParents(trackId, !isParentCollapsed))
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
  };

  /** The audio buttons will be condensed into text when the track is collapsed. */
  const CollapsedMuteAndSoloButtons = () => {
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
  };

  /** The Pattern Track header displays the name, dropdown menu, and mute/solo buttons when collapsed. */
  const PatternTrackHeader = () => {
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
          {PatternTrackDropdownMenu()}
          {CollapsedMuteAndSoloButtons()}
        </div>
      </div>
    );
  };

  /** The Pattern Track volume slider controls the volume of the track's instrument. */
  const PatternTrackVolumeSlider = () => {
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
      "transition-colors duration-200",
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
      <div className="w-6 h-full z-[90] relative">
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
  };

  /** The Pattern Track pan slider controls the pan of the track's instrument. */
  const PatternTrackPanSlider = () => {
    const leftPercent = percent(pan, MAX_PAN, MIN_PAN);
    const rightPercent = percent(pan, MIN_PAN, MAX_PAN);
    const sliderTop = -sliderHeight * (rightPercent / 100) + sliderHeight + 15;

    // Fade to teal when dragging
    const iconClass = classNames(
      "transition-colors duration-200",
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
      <div className="w-6 h-full z-[89] relative">
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
  };

  /** The Pattern Track volume and pan sliders are only visible when the track is expanded. */
  const PatternTrackSliders = () => {
    if (track.collapsed) return null;
    return (
      <div className="flex-shrink-0 z-50">
        <div className="flex ml-0.5 mr-1" draggable onDragStart={cancelEvent}>
          {PatternTrackVolumeSlider()}
          {PatternTrackPanSlider()}
        </div>
      </div>
    );
  };

  /** The instrument editor button toggles the instrument editor. */
  const InstrumentEditorButton = () => {
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
  };

  /** The mute button can toggle the track's instrument mute. */
  const MuteButton = () => {
    return (
      <TooltipButton
        label={mute ? "Unmute the Pattern Track" : "Mute the Pattern Track"}
        className={classNames(
          "w-6 h-6 text-sm rounded-full text-center border-2 border-rose-400/80",
          { "bg-rose-400 text-white": mute },
          { "bg-rose-400/30 text-shadow": !mute && isHoldingM },
          { "bg-emerald-600/20": !mute && !isHoldingM }
        )}
        onClick={(e) => dispatch(toggleTrackMute(e.nativeEvent, trackId))}
      >
        M
      </TooltipButton>
    );
  };

  /** The solo button can toggle the track's instrument solo. */
  const SoloButton = () => {
    return (
      <TooltipButton
        label={solo ? "Unsolo the Pattern Track" : "Solo the Pattern Track"}
        className={classNames(
          "w-6 h-6 text-sm rounded-full text-center border-2 border-yellow-400/80",
          { "bg-yellow-400 text-white": solo },
          { "bg-yellow-400/30 text-shadow": !solo && isHoldingS },
          { "bg-emerald-600/20": !solo && !isHoldingS }
        )}
        onClick={(e) => {
          cancelEvent(e);
          dispatch(toggleTrackSolo(e.nativeEvent, trackId));
        }}
      >
        S
      </TooltipButton>
    );
  };

  /**
   * The Pattern Track has three main buttons.
   * * The first button toggles the instrument editor.
   * * The second button toggles the mute of the track's instrument.
   * * The third button toggles the solo of the track's instrument.
   */
  const PatternTrackButtons = () => {
    return (
      <div
        className="w-full flex items-center"
        draggable
        onDragStart={cancelEvent}
        onDoubleClick={cancelEvent}
      >
        {InstrumentEditorButton()}
        <div className="flex ml-2 space-x-1 justify-self-end">
          <SoloButton />
          <MuteButton />
        </div>
      </div>
    );
  };

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
          "w-full h-full items-center flex border-2 rounded transition-all duration-300",
          { "border-fuchsia-400": isSelected && isLive },
          { "border-orange-400": isSelected && onInstrumentEditor },
          { "border-blue-400": isSelected },
          { "border-emerald-950": !isSelected }
        )}
      >
        {PatternTrackSliders()}
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-75">
          {PatternTrackHeader()}
          {!track.collapsed && PatternTrackButtons()}
        </div>
      </div>
    </div>
  );
};
