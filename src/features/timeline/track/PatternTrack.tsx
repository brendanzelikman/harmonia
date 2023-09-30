import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import { useMemo, useRef, useState } from "react";
import { TrackProps } from ".";
import {
  TrackButton,
  TrackDropdownButton,
  TrackDropdownMenu,
  TrackSlider,
} from "./Track";
import { getInstrumentName } from "types/instrument";
import { setMixerPan, setMixerVolume } from "redux/thunks/mixers";
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
} from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import {
  blurOnEnter,
  cancelEvent,
  isHoldingCommand,
  isHoldingOption,
  percentOfRange,
} from "utils";
import { useTrackDrag, useTrackDrop } from "./dnd";
import useKeyHolder from "hooks/useKeyHolder";
import { isEditorOn, MixerId, TrackId, unpackMixer } from "types";
import { MIN_VOLUME, MAX_VOLUME, MIN_PAN, MAX_PAN } from "appConstants";
import { DEFAULT_VOLUME, DEFAULT_PAN } from "appConstants";
import { VOLUME_STEP, PAN_STEP } from "appConstants";
import { Transition } from "@headlessui/react";
import {
  selectEditor,
  selectMixerById,
  selectSessionMap,
  selectTrack,
} from "redux/selectors";
import { selectScaleTrack } from "redux/selectors";
import { isPatternTrack, PatternTrack as PatternTrackType } from "types/tracks";
import { updatePatternTrack } from "redux/slices/patternTracks";
import { moveTrackInSession } from "redux/slices/sessionMap";
import useEventListeners from "hooks/useEventListeners";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const { selectedTrackId } = ownProps;
  const track = ownProps.track as PatternTrackType;
  const isSelected = !!selectedTrackId && track.id === selectedTrackId;

  // Track instrument
  const instrumentName = getInstrumentName(track.instrument);
  const mixer = selectMixerById(state, track.mixerId);
  const { volume, pan, mute, solo } = unpackMixer(mixer);
  const volumePercent = percentOfRange(volume, MIN_VOLUME, MAX_VOLUME);
  const panLeftPercent = percentOfRange(pan, MAX_PAN, MIN_PAN);
  const panRightPercent = percentOfRange(pan, MIN_PAN, MAX_PAN);

  // Track editor state
  const editor = selectEditor(state);
  const onInstrumentEditor = isEditorOn(editor, "instrument") && isSelected;

  return {
    ...ownProps,
    track,
    mixerId: mixer?.id,
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
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => {
      return dispatch(movePatternTrack(props));
    },
    setTrackName: (track: Partial<PatternTrackType>, name: string) => {
      dispatch(updatePatternTrack({ id: track.id, name }));
    },
    setVolume: (mixerId: MixerId, volume: number) => {
      dispatch(setMixerVolume(mixerId, volume));
    },
    setPan: (mixerId: MixerId, pan: number) => {
      dispatch(setMixerPan(mixerId, pan));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(PatternTrack);

function PatternTrack(props: Props) {
  const { track, mixerId, chromatic, scalar, chordal, cell } = props;
  const heldKeys = useKeyHolder(["k", "y", "u"]);

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

  // Pattern track volume slider
  const PatternTrackVolumeSlider = useMemo(() => {
    const height = cell.height - 55;
    const top = -height * (props.volumePercent / 100) + height + 15;
    const iconClass = `${
      draggingVolume ? "text-emerald-400" : "text-white"
    } transition-colors duration-200`;
    const icon =
      props.volume > -20 ? (
        <BsVolumeUpFill className={iconClass} />
      ) : props.volume > -40 ? (
        <BsVolumeDownFill className={iconClass} />
      ) : (
        <BsVolumeOffFill className={iconClass} />
      );
    return () => (
      <div className="w-6 h-full z-[90] relative">
        <div className="w-full h-full">
          <TrackSlider
            cell={cell}
            icon={icon}
            className={`h-5 rotate-[270deg] accent-emerald-500`}
            value={props.volume}
            min={MIN_VOLUME}
            max={MAX_VOLUME - VOLUME_STEP}
            step={VOLUME_STEP}
            onChange={(e) => props.setVolume(mixerId, e.target.valueAsNumber)}
            onDoubleClick={(e) => {
              cancelEvent(e);
              props.setVolume(mixerId, DEFAULT_VOLUME);
            }}
            onMouseDown={() => setDraggingVolume(true)}
            onMouseUp={() => setDraggingVolume(false)}
          />
        </div>
        {draggingVolume && (
          <div
            style={{ top }}
            className={`absolute left-7 w-16 h-5 flex font-semibold items-center justify-center bg-emerald-700/80 backdrop-blur border border-slate-300 rounded text-xs`}
          >
            {props.volume.toFixed(0)}dB
          </div>
        )}
      </div>
    );
  }, [props.volume, cell, draggingVolume]);

  // Pattern track pan slider
  const PatternTrackPanSlider = useMemo(() => {
    const height = cell.height - 55;
    const top = -height * (props.panRightPercent / 100) + height + 15;
    const iconClass = `${
      draggingPan ? "text-teal-400" : "text-white"
    } transition-colors duration-200`;
    const icon = <BsHeadphones className={iconClass} />;

    return () => (
      <div className="w-6 h-full z-[80] relative">
        <div className="w-full h-full">
          <TrackSlider
            cell={cell}
            icon={icon}
            className={`h-5 accent-teal-400`}
            value={props.pan}
            min={MIN_PAN}
            max={MAX_PAN}
            step={PAN_STEP}
            onChange={(e) => props.setPan(mixerId, parseFloat(e.target.value))}
            onDoubleClick={(e) => {
              cancelEvent(e);
              props.setPan(mixerId, DEFAULT_PAN);
            }}
            onMouseDown={() => setDraggingPan(true)}
            onMouseUp={() => setDraggingPan(false)}
          />
        </div>
        {draggingPan && (
          <div
            style={{ top }}
            className={`absolute left-7 w-16 h-5 flex font-semibold items-center justify-center bg-teal-700/80 backdrop-blur border border-slate-300 rounded text-xs`}
          >
            {props.panLeftPercent}L • {props.panRightPercent}R
          </div>
        )}
      </div>
    );
  }, [props.pan, cell, draggingPan]);

  // Pattern track volume + pan sliders
  const PatternTrackSliders = useMemo(() => {
    return () => (
      <div className="flex ml-0.5 mr-1" draggable onDragStart={cancelEvent}>
        {PatternTrackVolumeSlider()}
        {PatternTrackPanSlider()}
      </div>
    );
  }, [PatternTrackVolumeSlider, PatternTrackPanSlider]);

  const toggleEditor = () =>
    props.onInstrumentEditor
      ? props.hideEditor()
      : props.showEditor(track.id, "instrument");

  useEventListeners(
    {
      e: {
        keydown: (e) =>
          isHoldingCommand(e) && props.isSelected && toggleEditor(),
      },
    },
    [toggleEditor]
  );

  // Instrument editor button
  const InstrumentEditorButton = useMemo(() => {
    const isSmall = cell.height < 100;
    const className = isSmall ? "text-xs px-2" : "text-sm px-3";
    return () => (
      <TrackButton
        className={`${className} border border-orange-400 ${
          props.onInstrumentEditor
            ? "bg-gradient-to-r from-orange-500 to-orange-500/50 background-pulse"
            : ""
        } cursor-pointer`}
        onClick={toggleEditor}
      >
        <label className="flex items-center instrument-button select-none cursor-pointer">
          Instrument/FX <BsPencil className="ml-2" />
        </label>
      </TrackButton>
    );
  }, [props.onInstrumentEditor, toggleEditor, cell]);

  // Mute button
  const MuteButton = useMemo(() => {
    return () => (
      <div
        className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 mr-1 text-sm border-2 border-rose-500/80 ${
          props.mute
            ? "bg-rose-500 text-white"
            : heldKeys.y
            ? "text-shadow bg-rose-400/40"
            : "bg-emerald-600/20"
        }`}
        onClick={(e) =>
          isHoldingOption(e.nativeEvent)
            ? props.mute
              ? props.unmuteTracks()
              : props.muteTracks()
            : props.setTrackMute(track.mixerId, !props.mute)
        }
      >
        M
      </div>
    );
  }, [props.mute, heldKeys]);

  // Solo button
  const SoloButton = useMemo(() => {
    return () => (
      <div
        className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 text-sm border-2 border-yellow-400/80 ${
          props.solo
            ? "bg-yellow-400 text-white"
            : heldKeys.u
            ? "text-shadow bg-yellow-400/30"
            : "bg-emerald-600/20"
        }`}
        onClick={(e) =>
          isHoldingOption(e.nativeEvent)
            ? props.solo
              ? props.unsoloTracks()
              : props.soloTracks()
            : props.setTrackSolo(track.mixerId, !props.solo)
        }
      >
        S
      </div>
    );
  }, [props.solo, heldKeys]);

  // Pattern track name field
  const PatternTrackNameField = useMemo(() => {
    const isSmall = cell.height < 100;
    const size = isSmall ? "text-xs h-6" : "text-sm h-7";
    return () => (
      <>
        <input
          placeholder={props.instrumentName}
          value={track.name}
          onChange={(e) => props.setTrackName(track, e.target.value)}
          className={`bg-zinc-800 font-nunito text-sm px-1 ${size} w-full mr-2 flex-auto caret-white outline-none focus:ring-0 rounded-md overflow-ellipsis text-gray-300 border-2 border-zinc-800 focus:border-indigo-500`}
          onKeyDown={blurOnEnter}
        />
        <label className="font-light w-4 mb-1 text-center">
          {props.row.depth + 1}
        </label>
      </>
    );
  }, [props.instrumentName, cell, track, props.row.depth]);

  // Pattern track dropdown menu
  const PatternTrackDropdownMenu = useMemo(() => {
    return () => (
      <div className="flex flex-col w-12 mr-1 items-end">
        <TrackDropdownMenu>
          <div className="flex flex-col w-full">
            <TrackDropdownButton
              content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
              icon={track.collapsed ? <BsArrowsExpand /> : <BsArrowsCollapse />}
              onClick={() =>
                track.collapsed
                  ? props.expandTrack(track)
                  : props.collapseTrack(track)
              }
            />
            <TrackDropdownButton
              content="Copy Track"
              icon={<BiCopy />}
              onClick={() => props.duplicateTrack(track)}
            />
            <TrackDropdownButton
              content="Clear Track"
              icon={<BsEraser />}
              onClick={() => props.clearTrack(track)}
            />
            <TrackDropdownButton
              content="Delete Track"
              icon={<BsTrash />}
              onClick={() => props.deleteTrack(track)}
            />
          </div>
        </TrackDropdownMenu>
        {!!track.collapsed && (
          <label className="text-xs -mt-1">
            <span
              className={`mr-0.5 ${heldKeys.y ? "text-shadow-lg" : ""} ${
                !!props.mute
                  ? "text-shadow-sm text-rose-400 font-bold"
                  : heldKeys.y
                  ? "text-white font-semibold"
                  : "text-slate-200"
              }`}
            >
              M
            </span>
            •
            <span
              className={`ml-0.5 ${heldKeys.u ? "text-shadow-lg" : ""} ${
                !!props.solo
                  ? "text-shadow-sm text-yellow-300 font-bold"
                  : heldKeys.u
                  ? "text-white font-semibold"
                  : "text-slate-200"
              }`}
            >
              S
            </span>
          </label>
        )}
      </div>
    );
  }, [track, heldKeys, props.mute, props.solo]);

  // Pattern track header
  const PatternTrackHeader = useMemo(() => {
    return () => (
      <>
        <Transition
          show={!!heldKeys.k}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          as="label"
          className="w-full text-gray-300 text-xs font-extralight pl-1 pb-1"
        >
          Current: N{chromatic} • T{scalar} • t{chordal}
        </Transition>
        <div
          className="w-full min-h-[1.5rem] max-h-[2.5rem] flex flex-1 relative items-center text-sm"
          draggable
          onDragStart={cancelEvent}
        >
          {PatternTrackNameField()}
          {PatternTrackDropdownMenu()}
        </div>
      </>
    );
  }, [
    props.row,
    PatternTrackNameField,
    PatternTrackDropdownMenu,
    heldKeys,
    chromatic,
    scalar,
    chordal,
  ]);

  // Pattern track body
  const PatternTrackBody = useMemo(() => {
    return () => (
      <div
        className="flex items-center w-full pt-1.5"
        draggable
        onDragStart={cancelEvent}
      >
        {InstrumentEditorButton()}
        <div className="flex flex-col pl-2 ml-auto space-y-1">
          <div className="flex">
            <MuteButton />
            <SoloButton />
          </div>
        </div>
      </div>
    );
  }, [InstrumentEditorButton, MuteButton, SoloButton]);

  // Assembled pattern track
  const PatternTrack = useMemo(() => {
    return (
      <div
        className={`rdg-track border-b border-b-slate-300 p-2 bg-teal-600 flex w-full h-full text-white ${
          isDragging ? "opacity-75" : ""
        }`}
        ref={trackRef}
        onClick={() => props.selectTrack(track.id)}
      >
        <div
          className={`w-full h-full border-2 rounded items-center flex bg-gradient-to-r from-sky-700/80 to-emerald-700/50 ${
            props.isSelected
              ? props.onInstrumentEditor
                ? "border-orange-400"
                : "border-blue-400"
              : "border-emerald-950"
          }`}
          onDoubleClick={() =>
            props.onInstrumentEditor
              ? props.hideEditor()
              : props.showEditor(track.id, "instrument")
          }
        >
          <Transition
            show={!track.collapsed}
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            {!track.collapsed ? PatternTrackSliders() : null}
          </Transition>
          <div className="w-full h-full flex flex-col items-center justify-center px-2 duration-150">
            {PatternTrackHeader()}
            {!track.collapsed && PatternTrackBody()}
          </div>
        </div>
      </div>
    );
  }, [
    PatternTrackSliders,
    PatternTrackHeader,
    PatternTrackBody,
    isDragging,
    track,
    props.isSelected,
    props.onInstrumentEditor,
  ]);

  return PatternTrack;
}

// Move the track for react-dnd
export const movePatternTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverId } = props;
    const state = getState();
    const sessionMap = selectSessionMap(state).byId;

    // Get the corresponding pattern tracks
    const thisTrack = selectTrack(state, dragId);
    const otherTrack = selectTrack(state, hoverId);
    if (!thisTrack || !otherTrack) return false;

    const otherTrackParent = otherTrack.parentId
      ? sessionMap[otherTrack.parentId]
      : null;

    const isThisPattern = isPatternTrack(thisTrack);
    const isOtherPattern = isPatternTrack(otherTrack);

    // If this = scale track and other = pattern track, move the scale track if possible
    if (!isThisPattern && isOtherPattern) {
      const index = otherTrackParent?.trackIds.indexOf(otherTrack.id);
      if (index === undefined || index === -1) return false;
      dispatch(moveTrackInSession({ id: thisTrack.id, index }));
      return true;
    }

    // Get the corresponding scale tracks
    const thisParent = selectScaleTrack(state, thisTrack.parentId);
    const otherParent = selectScaleTrack(state, otherTrack.parentId);
    if (!thisParent || !otherParent) return false;

    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisParent.id === otherParent.id) {
      const index = sessionMap[thisParent.id].trackIds.indexOf(otherTrack.id);
      dispatch(
        moveTrackInSession({
          id: thisTrack.id,
          index,
        })
      );
    }

    // If the pattern tracks are in different scale tracks, do nothing
    return false;
  };
