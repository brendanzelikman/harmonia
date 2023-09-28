import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import { useCallback, useMemo, useRef, useState } from "react";
import { TrackProps } from ".";
import {
  TrackButton,
  TrackDropdownButton,
  TrackDropdownMenu,
  TrackSlider,
} from "./Track";
import useDebouncedField from "hooks/useDebouncedField";
import { getInstrumentName } from "types/instrument";
import { setMixerPan, setMixerVolume } from "redux/thunks/mixers";
import { BsEraser, BsPencil, BsTrash } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { cancelEvent, isHoldingOption, percentOfRange } from "utils";
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
import { selectPatternTrack, selectScaleTrack } from "redux/selectors";
import {
  isPatternTrack,
  isScaleTrack,
  PatternTrack as PatternTrackType,
} from "types/tracks";
import {
  setPatternTrackScaleTrack,
  updatePatternTrack,
} from "redux/slices/patternTracks";
import { moveTrackInSession } from "redux/slices/sessionMap";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const { selectedTrackId, scaleTrack } = ownProps;
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
    scaleTrack,
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
    setPatternTrackName: (track: Partial<PatternTrackType>, name: string) => {
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
  const holdingK = useKeyHolder("k").k;

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

  // Pattern track volume tooltip
  const PatternTrackVolumeTooltip = useMemo(() => {
    return () => (
      <div
        className={`w-[4.5rem] h-12 top-0 ml-6 absolute text-xs flex flex-col justify-center items-center rounded-lg border border-slate-50/50 bg-slate-900/80 backdrop-blur text-white`}
      >
        <div className={`relative w-[3rem] text-center pb-[3px] mb-0.5`}>
          <span
            style={{ width: `${props.volumePercent}%` }}
            className={`absolute rounded left-0 -bottom-[1px] h-1 bg-emerald-500`}
          />
          <label className="bg-slate-800">Volume</label>
        </div>
        <label className="pb-1">{props.volume.toFixed(1)}dB</label>
      </div>
    );
  }, [props.volume, props.volumePercent]);

  // Pattern track pan tooltip
  const PatternTrackPanTooltip = useMemo(() => {
    const panPercent = !props.pan
      ? "50L • 50R"
      : `${props.panLeftPercent}L • ${props.panRightPercent}R`;
    return () => (
      <div
        className={`top-0 ml-6 absolute text-xs flex flex-col justify-center items-center w-[4.5rem] h-12 rounded-lg border border-slate-50/50 bg-slate-900/80 backdrop-blur text-white`}
      >
        <div className={`relative w-8 text-center pb-[2px] mb-1`}>
          <div
            style={{ width: `${props.panRightPercent}%` }}
            className={`absolute rounded left-0 -bottom-[1px] h-1 bg-teal-400`}
          />
          <label className="bg-slate-800">Pan</label>
        </div>
        <label className="pb-1">{panPercent}</label>
      </div>
    );
  }, [props.pan, props.panLeftPercent, props.panRightPercent]);

  // Pattern track volume slider
  const PatternTrackVolumeSlider = useMemo(() => {
    return () => (
      <div className="ml-1 w-6 z-[90] relative">
        <div className="w-full h-full">
          <TrackSlider
            cell={cell}
            className={`h-5 rotate-[270deg] accent-emerald-500`}
            value={props.volume}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={VOLUME_STEP}
            onChange={(e) => props.setVolume(mixerId, e.target.valueAsNumber)}
            onDoubleClick={() => props.setVolume(mixerId, DEFAULT_VOLUME)}
            onMouseDown={() => setDraggingVolume(true)}
            onMouseUp={() => setDraggingVolume(false)}
          />
          {draggingVolume ? <PatternTrackVolumeTooltip /> : null}
        </div>
      </div>
    );
  }, [props.volume, cell, draggingVolume, PatternTrackVolumeTooltip]);

  // Pattern track pan slider
  const PatternTrackPanSlider = useMemo(() => {
    return () => (
      <div className="mr-1.5 w-6 h-full z-[80] relative">
        <div className="w-full h-full">
          <TrackSlider
            cell={cell}
            className={`h-5 accent-teal-400`}
            value={props.pan}
            min={MIN_PAN}
            max={MAX_PAN}
            step={PAN_STEP}
            onChange={(e) => props.setPan(mixerId, parseFloat(e.target.value))}
            onDoubleClick={() => props.setPan(mixerId, DEFAULT_PAN)}
            onMouseDown={() => setDraggingPan(true)}
            onMouseUp={() => setDraggingPan(false)}
          />
          {draggingPan ? <PatternTrackPanTooltip /> : null}
        </div>
      </div>
    );
  }, [props.pan, cell, draggingPan, PatternTrackPanTooltip]);

  // Pattern track volume + pan sliders
  const PatternTrackSliders = useMemo(() => {
    return () => (
      <div className="flex" draggable onDragStart={cancelEvent}>
        {PatternTrackVolumeSlider()}
        {PatternTrackPanSlider()}
      </div>
    );
  }, [PatternTrackVolumeSlider, PatternTrackPanSlider]);

  // Instrument button
  const InstrumentEditorButton = useMemo(() => {
    const isSmall = cell.height < 100;
    const className = isSmall ? "text-xs px-2" : "text-sm px-3";
    return () => (
      <TrackButton
        className={`${className} border border-orange-400 ${
          props.onInstrumentEditor
            ? "bg-gradient-to-r from-orange-500 to-orange-500/50 background-pulse"
            : ""
        }`}
        onClick={() =>
          props.onInstrumentEditor
            ? props.hideEditor()
            : props.showEditor(track.id, "instrument")
        }
      >
        <label className="cursor-pointer flex items-center instrument-button">
          Instrument/FX <BsPencil className="ml-2" />
        </label>
      </TrackButton>
    );
  }, [props.onInstrumentEditor, cell]);

  // Mute button
  const MuteButton = useMemo(() => {
    return () => (
      <div
        className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-rose-500 ${
          props.mute ? "bg-rose-500 text-white" : ""
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
  }, [props.mute]);

  // Solo button
  const SoloButton = useMemo(() => {
    return () => (
      <div
        className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-yellow-400 ${
          props.solo ? "bg-yellow-400 text-white" : ""
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
  }, [props.solo]);

  // Pattern track name
  const PatternTrackName = useDebouncedField<string>((name) => {
    props.setPatternTrackName(track, name);
  }, track.name);

  // Pattern track name field
  const PatternTrackNameField = useMemo(() => {
    const isSmall = cell.height < 100;
    const size = isSmall ? "text-xs h-6" : "text-sm h-7";
    return () => (
      <>
        <input
          placeholder={props.instrumentName}
          value={PatternTrackName.value}
          onChange={PatternTrackName.onChange}
          className={`bg-zinc-800 text-sm px-1 ${size} mr-2 flex-auto caret-white outline-none rounded-md overflow-ellipsis text-gray-300 border-2 border-zinc-800 focus:border-indigo-500/50`}
          onKeyDown={PatternTrackName.onKeyDown}
        />
        <label className="font-light w-4 text-center">
          {props.row.depth + 1}
        </label>
      </>
    );
  }, [props.instrumentName, cell, PatternTrackName.value, props.row.depth]);

  // Pattern track dropdown menu
  const PatternTrackDropdownMenu = useMemo(() => {
    return () => (
      <TrackDropdownMenu>
        <div className="flex flex-col w-full">
          <TrackDropdownButton
            content="Copy Track"
            icon={<BiCopy />}
            onClick={() => props.duplicateTrack(track.id)}
          />
          <TrackDropdownButton
            content="Clear Track"
            icon={<BsEraser />}
            onClick={() => props.clearTrack(track.id)}
          />
          <TrackDropdownButton
            content="Delete Track"
            icon={<BsTrash />}
            onClick={() => props.deleteTrack(track.id)}
          />
        </div>
      </TrackDropdownMenu>
    );
  }, [track]);

  // Pattern track header
  const PatternTrackHeader = useMemo(() => {
    return () => (
      <>
        <Transition
          show={!!holdingK}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          as="label"
          className="w-full text-gray-400 text-xs font-extralight pl-1"
        >
          Current: N{chromatic} • T{scalar} • t{chordal}
        </Transition>
        <div
          className="w-full min-h-[1.5rem] max-h-[2.5rem] flex flex-1 relative text-sm justify-end"
          draggable
          onDragStart={cancelEvent}
        >
          {PatternTrackNameField()}
          {PatternTrackDropdownMenu()}
        </div>
      </>
    );
  }, [props.row, PatternTrackNameField, holdingK, chromatic, scalar, chordal]);

  // Pattern track body
  const PatternTrackBody = useMemo(() => {
    return () => (
      <div
        className="flex items-center w-full pt-1.5"
        draggable
        onDragStart={cancelEvent}
      >
        <InstrumentEditorButton />
        <div className="flex flex-col pl-2 ml-auto mr-1 space-y-1">
          <div className="flex space-x-1">
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
        className={`rdg-track pt-0.5 bg-teal-700 flex w-full h-full text-white border-b border-b-white/20 ${
          isDragging ? "opacity-75" : ""
        } ${props.isSelected ? "bg-slate-500/50" : ""}`}
        ref={trackRef}
        onClick={() => props.selectTrack(track.id)}
      >
        <div className="w-full h-full pl-1 pt-1 pr-3 flex bg-gradient-to-r from-sky-700/80 to-emerald-600/80">
          {PatternTrackSliders()}
          <div className="w-full h-full flex flex-col items-center justify-center py-2">
            {PatternTrackHeader()}
            {PatternTrackBody()}
          </div>
        </div>
      </div>
    );
  }, [
    PatternTrackSliders,
    PatternTrackHeader,
    PatternTrackBody,
    isDragging,
    props.isSelected,
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
