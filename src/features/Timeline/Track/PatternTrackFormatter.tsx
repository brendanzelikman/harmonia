import { useRef, useState } from "react";
import { TrackButton } from "./components/TrackButton";
import {
  TrackName,
  TrackSlider,
  TrackDropdownMenu,
  TrackDropdownButton,
} from "./components";
import {
  getInstrumentName,
  getInstrumentChannel,
  LIVE_AUDIO_INSTANCES,
} from "types/Instrument";
import {
  BsArrowsCollapse,
  BsArrowsExpand,
  BsEraser,
  BsHeadphones,
  BsPencil,
  BsTrash,
  BsVolumeDownFill,
  BsVolumeOffFill,
  BsVolumeUpFill,
  BsWifi,
} from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { cancelEvent, promptUserForNumber } from "utils/html";
import { percent } from "utils/math";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDragAndDrop";
import { MIN_VOLUME, MAX_VOLUME, MIN_PAN, MAX_PAN } from "utils/constants";
import { DEFAULT_VOLUME, DEFAULT_PAN } from "utils/constants";
import { VOLUME_STEP, PAN_STEP } from "utils/constants";
import {
  selectEditor,
  selectInstrumentById,
  selectTrackInstrumentKey,
} from "redux/selectors";
import { isInstrumentEditorOpen } from "types/Editor";
import { TrackFormatterProps } from "./TrackFormatter";
import { useProjectDispatch, useProjectSelector as use } from "redux/hooks";
import {
  toggleTrackInstrumentEditor,
  toggleTrackMute,
  toggleTrackSolo,
} from "redux/thunks";
import { updateInstrument } from "redux/Instrument";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import classNames from "classnames";
import { PatternTrack } from "types/Track";
import { useAuthenticationStatus } from "hooks";
import { bindTrackToPort, clearTrackPort } from "redux/Track";
import { promptModal } from "components/Modal";
import isElectron from "is-electron";

interface PatternTrackProps extends TrackFormatterProps {
  track: PatternTrack;
}

export const PatternTrackFormatter: React.FC<PatternTrackProps> = (props) => {
  const { track, cell, label, isSelected } = props;
  const auth = useAuthenticationStatus();
  const dispatch = useProjectDispatch();

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
  const heldKeys = useHeldHotkeys(["y", "u"]);
  const isHoldingY = heldKeys.y;
  const isHoldingU = heldKeys.u;

  // Instrument info
  const instrument = use((_) => selectInstrumentById(_, track.instrumentId));
  const instrumentId = instrument?.id ?? "global";
  const iKey = use((_) => selectTrackInstrumentKey(_, track.id));
  const instrumentName = getInstrumentName(iKey);
  const { volume, pan, mute, solo } = getInstrumentChannel(instrument);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [draggingPan, setDraggingPan] = useState(false);

  // Cell info
  const isSmall = cell.height < 100;
  const sliderHeight = cell.height - 55;

  /** A Pattern Track will display its name or the name of its instrument. */
  const PatternTrackName = () => {
    return (
      <div className="w-full flex flex-col space-y-1">
        <span className="text-xs text-orange-300 font-nunito"></span>
        <TrackName
          id={track.id}
          value={track.name}
          placeholder={`Pattern Track (${label})`}
          onChange={(e) => props.renameTrack(e.target.value)}
        />
      </div>
    );
  };

  /** The Pattern Track dropdown menu allows the user to perform general actions on the track. */
  const PatternTrackDropdownMenu = () => {
    const onPortClick = async () => {
      const instrument = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instrument) return;
      if (track.port === undefined) {
        const result = await promptModal(
          "Bind Your Track",
          "Please input a port number between 1 and 16."
        );
        const parsedPort = parseInt(result);
        if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 16) return;
        const port = 9000 + parsedPort;
        dispatch(bindTrackToPort({ id: track.id, port }));
      } else {
        dispatch(clearTrackPort(track.id));
      }
    };
    const showPortMenu = auth.isVirtuoso && !!isElectron();
    return (
      <TrackDropdownMenu>
        {showPortMenu && (
          <TrackDropdownButton
            content={`${track.port === undefined ? "Link" : "Linking"} Track${
              track.port !== undefined ? ` (${track.port})` : ""
            }`}
            icon={<BsWifi />}
            onClick={onPortClick}
          />
        )}
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={track.collapsed ? <BsArrowsExpand /> : <BsArrowsCollapse />}
          onClick={track.collapsed ? props.expandTrack : props.collapseTrack}
        />
        <TrackDropdownButton
          content="Duplicate Track"
          icon={<BiCopy />}
          onClick={props.duplicateTrack}
        />
        <TrackDropdownButton
          content="Clear Track"
          icon={<BsEraser />}
          onClick={props.clearTrack}
        />
        <TrackDropdownButton
          content="Delete Track"
          icon={<BsTrash />}
          onClick={props.deleteTrack}
        />
      </TrackDropdownMenu>
    );
  };

  /** The audio buttons will be condensed into text when the track is collapsed. */
  const CollapsedMuteAndSoloButtons = () => {
    if (!track.collapsed) return null;
    const muteButton = classNames(
      { "text-shadow-lg": isHoldingY },
      { "text-slate-200 font-normal": !mute && !isHoldingY },
      { "text-rose-400 font-bold": mute },
      { "text-white font-semibold": !mute && isHoldingY }
    );
    const soloButton = classNames(
      { "text-shadow-lg": isHoldingU },
      { "text-slate-200 font-normal": !solo && !isHoldingU },
      { "text-yellow-400 font-bold": solo },
      { "text-white font-semibold": !solo && isHoldingU }
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
        className="w-full min-h-[2rem] max-h-[3rem] flex flex-1 relative items-center text-sm"
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
      dispatch(updateInstrument({ id: instrumentId, update }));
    };

    // Reset the instrument's volume when the slider is double clicked
    const onDoubleClick = () => {
      const update = { volume: DEFAULT_VOLUME };
      dispatch(updateInstrument({ id: instrumentId, update }));
    };

    return (
      <div className="w-6 h-full z-[90] relative">
        <TrackSlider
          className={`h-5 accent-emerald-500`}
          value={volume}
          height={cell.height}
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
      dispatch(updateInstrument({ id: instrumentId, update }));
    };

    // Reset the instrument's pan when the slider is double clicked
    const onDoubleClick = () => {
      const update = { pan: DEFAULT_PAN };
      dispatch(updateInstrument({ id: instrumentId, update }));
    };

    return (
      <div className="w-6 h-full z-[89] relative">
        <TrackSlider
          className={`h-5 accent-teal-400`}
          height={cell.height}
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
    const buttonClass = classNames("px-2 border border-orange-400", {
      "bg-gradient-to-r from-orange-500 to-orange-500/50 background-pulse":
        isSelected && onInstrumentEditor,
    });
    return (
      <TrackButton
        className={buttonClass}
        onClick={() => dispatch(toggleTrackInstrumentEditor(track.id))}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{instrumentName}</span>
      </TrackButton>
    );
  };

  /** The mute button can toggle the track's instrument mute. */
  const MuteButton = () => {
    const buttonClass = classNames(
      "w-6 h-6 rounded-full text-center border-2 border-rose-400/80",
      { "bg-rose-400 text-white": mute },
      { "bg-rose-400/30 text-shadow": !mute && isHoldingY },
      { "bg-emerald-600/20": !mute && !isHoldingY }
    );
    return (
      <button
        className={buttonClass}
        onClick={(e) => dispatch(toggleTrackMute(e, track.id))}
        onDoubleClick={cancelEvent}
      >
        M
      </button>
    );
  };

  /** The solo button can toggle the track's instrument solo. */
  const SoloButton = () => {
    const buttonClass = classNames(
      "w-6 h-6 rounded-full text-center border-2 border-yellow-400/80",
      { "bg-yellow-400 text-white": solo },
      { "bg-yellow-400/30 text-shadow": !solo && isHoldingU },
      { "bg-emerald-600/20": !solo && !isHoldingU }
    );
    return (
      <button
        className={buttonClass}
        onClick={(e) => dispatch(toggleTrackSolo(e, track.id))}
        onDoubleClick={cancelEvent}
      >
        S
      </button>
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
        <InstrumentEditorButton />
        <div className="flex ml-2 space-x-1 justify-self-end">
          <SoloButton />
          <MuteButton />
        </div>
      </div>
    );
  };

  /** The Pattern Track body stores the track content within some outer padding. */
  const PatternTrackBody = () => {
    const bodyClass = classNames(
      "bg-gradient-to-r from-sky-700/80 to-emerald-700/50",
      "w-full h-full items-center flex border-2 rounded",
      { "border-orange-400": isSelected && onInstrumentEditor },
      { "border-blue-400": isSelected && !onInstrumentEditor },
      { "border-emerald-950": !isSelected }
    );
    return (
      <div
        className={bodyClass}
        onDoubleClick={() => dispatch(toggleTrackInstrumentEditor())}
      >
        {PatternTrackSliders()}
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-150">
          {PatternTrackHeader()}
          {!track.collapsed && PatternTrackButtons()}
        </div>
      </div>
    );
  };

  // Assemble the class name
  const trackClass = classNames(
    "rdg-track w-full h-full p-2 bg-teal-600 text-white",
    "border-b border-b-slate-300",
    { "opacity-50": isDragging, "opacity-100": !isDragging },
    { "text-xs": isSmall, "text-sm": !isSmall }
  );

  // Return the pattern track
  return (
    <div className={trackClass} ref={trackRef} onClick={props.selectTrack}>
      {PatternTrackBody()}
    </div>
  );
};
