import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, Project } from "redux/store";
import { MouseEvent, useRef, useState } from "react";
import { TrackProps } from ".";
import {
  TrackButton,
  TrackDropdownButton,
  TrackDropdownMenu,
  TrackName,
  TrackSlider,
} from "./Track";
import {
  getInstrumentName,
  InstrumentId,
  getInstrumentChannel,
} from "types/Instrument";
import {
  BsArrowsCollapse,
  BsArrowsExpand,
  BsEraser,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { cancelEvent, percentOfRange } from "utils";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDragAndDrop";
import { MIN_VOLUME, MAX_VOLUME, MIN_PAN, MAX_PAN } from "utils/constants";
import { DEFAULT_VOLUME, DEFAULT_PAN } from "utils/constants";
import { VOLUME_STEP, PAN_STEP } from "utils/constants";
import { Transition } from "@headlessui/react";
import {
  selectEditor,
  selectInstrumentById,
  selectPatternTrackInstrumentKey,
} from "redux/selectors";
import { movePatternTrack, updatePatternTrack } from "redux/PatternTrack";
import { PatternTrack as PatternTrackType } from "types/PatternTrack";
import { isEditorOn } from "types/Editor";
import { TrackId } from "types/Track";
import { updateInstrument } from "redux/Instrument";
import { toggleTrackMute, toggleTrackSolo } from "redux/Track";
import { toggleTrackInstrumentEditor } from "redux/Editor";
import { usePatternTrackStyles } from "./hooks/usePatternTrackStyles";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

const mapStateToProps = (state: Project, ownProps: TrackProps) => {
  const { selectedTrackId } = ownProps;
  const track = ownProps.track as PatternTrackType;
  const isSelected = !!selectedTrackId && track.id === selectedTrackId;

  // Track instrument
  const instrument = selectInstrumentById(state, track.instrumentId);
  const instrumentKey = selectPatternTrackInstrumentKey(state, track.id);
  const instrumentName = getInstrumentName(instrumentKey);
  const { volume, pan, mute, solo } = getInstrumentChannel(instrument);
  const volumePercent = percentOfRange(volume, MIN_VOLUME, MAX_VOLUME);
  const panLeftPercent = percentOfRange(pan, MAX_PAN, MIN_PAN);
  const panRightPercent = percentOfRange(pan, MIN_PAN, MAX_PAN);

  // Track editor state
  const editor = selectEditor(state);
  const onInstrumentEditor = isEditorOn(editor, "instrument") && isSelected;

  return {
    ...ownProps,
    track,
    instrumentId: track.instrumentId || "",
    isSelected,
    onInstrumentEditor,
    instrumentName,
    volume,
    volumePercent,
    pan,
    panLeftPercent,
    panRightPercent,
    mute,
    solo,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch, ownProps: TrackProps) => {
  const track = ownProps.track;
  return {
    moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => {
      return dispatch(movePatternTrack(props));
    },
    setTrackName: (track: Partial<PatternTrackType>, name: string) => {
      dispatch(updatePatternTrack({ id: track.id, name }));
    },
    setVolume: (instrumentId: InstrumentId, volume: number) => {
      dispatch(updateInstrument({ instrumentId, update: { volume } }));
    },
    setPan: (instrumentId: InstrumentId, pan: number) => {
      dispatch(updateInstrument({ instrumentId, update: { pan } }));
    },
    toggleTrackMute: (e: MouseEvent) => {
      dispatch(toggleTrackMute(e, track?.id));
    },
    toggleTrackSolo: (e: MouseEvent) => {
      dispatch(toggleTrackSolo(e, track?.id));
    },
    toggleInstrumentEditor: () => {
      dispatch(toggleTrackInstrumentEditor(track?.id));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PatternTrackProps = ConnectedProps<typeof connector>;

export default connector(PatternTrackComponent);

function PatternTrackComponent(props: PatternTrackProps) {
  const { track, instrumentId, cell } = props;
  const heldKeys = useHeldHotkeys(["y", "u"]);
  const isHoldingKey = (key: string) => heldKeys[key];

  // Drag and drop pattern tracks
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [draggingPan, setDraggingPan] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [{}, drop] = useTrackDrop({ ...props, element: trackRef.current });
  const [{ isDragging }, drag] = useTrackDrag({
    ...props,
    element: trackRef.current,
  });
  drag(drop(trackRef));

  // CSS properties
  const styles = usePatternTrackStyles({
    ...props,
    isDragging,
    isHoldingKey,
    draggingVolume,
    draggingPan,
  });

  /**
   * The Pattern Track name will display the name of the track
   * or its instrument if no name is set.
   */
  const PatternTrackName = (
    <TrackName
      cell={props.cell}
      value={track.name}
      placeholder={props.instrumentName}
      onChange={(e) => props.setTrackName(track, e.target.value)}
    />
  );

  /**
   * The Pattern Track depth corresponds to the number of parents
   */
  const PatternTrackDepth = (
    <label className="font-light w-4 text-center mb-1">
      {props.row.depth + 1}
    </label>
  );

  /**
   * The Pattern Track dropdown menu allows the user to perform general actions on the track.
   * * Expand/Collapse Track
   * * Copy Track
   * * Clear Track
   * * Delete Track
   */
  const PatternTrackDropdownMenu = (
    <TrackDropdownMenu>
      <TrackDropdownButton
        content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
        icon={track.collapsed ? <BsArrowsExpand /> : <BsArrowsCollapse />}
        onClick={track.collapsed ? props.expandTrack : props.collapseTrack}
      />
      <TrackDropdownButton
        content="Copy Track"
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

  /**
   * The audio buttons will be condensed into text when the track is collapsed.
   */
  const CollapsedAudioButtons = !!track.collapsed && (
    <label className="text-xs -mt-1 space-x-1">
      <span className={styles.collapsedMuteButton}>M</span>•
      <span className={styles.collapsedSoloButton}>S</span>
    </label>
  );

  /**
   * The Pattern Track header displays the name, depth, and dropdown menu.
   * If the track is collapsed, the header will also display the audio buttons.
   */
  const PatternTrackHeader = (
    <div
      className="w-full min-h-[2rem] max-h-[3rem] flex flex-1 relative items-center text-sm"
      draggable
      onDragStart={cancelEvent}
    >
      {PatternTrackName}
      {PatternTrackDepth}
      <div className="flex flex-col w-12 mr-1 items-end">
        {PatternTrackDropdownMenu}
        {CollapsedAudioButtons}
      </div>
    </div>
  );

  /**
   * The Pattern Track volume slider controls the volume of the track's instrument.
   */
  const PatternTrackVolumeSlider = () => (
    <div className="w-6 h-full z-[90] relative">
      <TrackSlider
        className={`h-5 accent-emerald-500`}
        value={props.volume}
        cell={cell}
        icon={styles.VolumeIcon}
        min={MIN_VOLUME}
        max={MAX_VOLUME - VOLUME_STEP}
        step={VOLUME_STEP}
        onChange={(e) => props.setVolume(instrumentId, e.target.valueAsNumber)}
        onDoubleClick={() => props.setVolume(instrumentId, DEFAULT_VOLUME)}
        onMouseDown={() => setDraggingVolume(true)}
        onMouseUp={() => setDraggingVolume(false)}
        showTooltip={draggingVolume}
        tooltipTop={styles.volumeSliderTop}
        tooltipClassName="bg-emerald-700/80"
        tooltipContent={`${props.volume.toFixed(0)}dB`}
      />
    </div>
  );

  /**
   * The Pattern Track pan slider controls the pan of the track's instrument.
   */
  const PatternTrackPanSlider = () => (
    <div className="w-6 h-full z-[89] relative">
      <TrackSlider
        className={`h-5 accent-teal-400`}
        cell={cell}
        icon={styles.PanIcon}
        value={props.pan}
        min={MIN_PAN}
        max={MAX_PAN}
        step={PAN_STEP}
        onChange={(e) => props.setPan(instrumentId, parseFloat(e.target.value))}
        onDoubleClick={() => props.setPan(instrumentId, DEFAULT_PAN)}
        onMouseDown={() => setDraggingPan(true)}
        onMouseUp={() => setDraggingPan(false)}
        showTooltip={draggingPan}
        tooltipTop={styles.panSliderTop}
        tooltipClassName="bg-teal-700/80"
        tooltipContent={`${props.panLeftPercent}L • ${props.panRightPercent}R`}
      />
    </div>
  );

  /**
   * The Pattern Track sliders will display the volume and pan of the track's instrument.
   * The sliders will only be visible when the track is expanded.
   */
  const PatternTrackSliders = (
    <Transition
      show={!track.collapsed}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      {!track.collapsed ? (
        <div className="flex ml-0.5 mr-1" draggable onDragStart={cancelEvent}>
          {PatternTrackVolumeSlider()}
          {PatternTrackPanSlider()}
        </div>
      ) : null}
    </Transition>
  );

  /**
   * The Pattern Track has three main buttons.
   * * The first button toggles the instrument editor.
   * * The second button toggles the mute of the track's instrument.
   * * The third button toggles the solo of the track's instrument.
   */
  const PatternTrackButtons = (
    <div
      className="w-full flex items-center"
      draggable
      onDragStart={cancelEvent}
    >
      <TrackButton
        className={styles.instrumentButton}
        onClick={props.toggleInstrumentEditor}
      >
        Instrument/FX <BsPencil className="ml-2" />
      </TrackButton>
      <div className="flex ml-2 justify-self-end">
        <button
          className={`mr-1 ${styles.audioButton} ${styles.muteBorder} ${styles.muteColor}`}
          onClick={props.toggleTrackMute}
          onDoubleClick={cancelEvent}
        >
          M
        </button>
        <button
          className={`${styles.audioButton} ${styles.soloBorder} ${styles.soloColor}`}
          onClick={props.toggleTrackSolo}
          onDoubleClick={cancelEvent}
        >
          S
        </button>
      </div>
    </div>
  );

  /**
   * The Pattern Track body stores the track content with some outer padding.
   */
  const PatternTrackBody = (
    <div
      className={`${styles.innerTrack} ${styles.gradient} ${styles.innerBorder}`}
      onDoubleClick={props.toggleInstrumentEditor}
    >
      {PatternTrackSliders}
      <div className="w-full h-full flex flex-col items-start justify-center px-2 duration-150">
        {PatternTrackHeader}
        {!track.collapsed && PatternTrackButtons}
      </div>
    </div>
  );

  // Assemble the class name
  const className = `rdg-track ${styles.outerBorder} ${styles.padding} ${styles.text} ${styles.opacity}`;

  // Render the Pattern Track
  return (
    <div className={className} ref={trackRef} onClick={props.selectTrack}>
      {PatternTrackBody}
    </div>
  );
}
