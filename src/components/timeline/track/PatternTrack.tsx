import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";
import { useRef, useState } from "react";

import { TrackProps } from ".";
import { TrackButton, TrackDropdownButton, TrackDropdownMenu } from "./Track";
import {
  selectRoot,
  selectTransport,
  selectMixerByTrackId,
  selectPatternTrack,
  selectScaleTrack,
  selectTrack,
} from "redux/selectors";
import {
  setPatternTrackScaleTrack,
  updatePatternTrack,
} from "redux/slices/patternTracks";
import * as Constants from "appConstants";
import {
  isPatternTrack,
  PatternTrack as PatternTrackType,
  TrackId,
} from "types/tracks";
import useDebouncedField from "hooks/useDebouncedField";
import { getInstrumentName, InstrumentName } from "types/instrument";
import { setMixerPan, setMixerVolume } from "redux/thunks/mixers";
import { BsEraser, BsPencil, BsTrash } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import {
  cancelEvent,
  isHoldingOption,
  isInputEvent,
  percentOfRange,
} from "appUtil";
import useEventListeners from "hooks/useEventListeners";
import { AppThunk } from "redux/store";
import { useTrackDrag, useTrackDrop } from "./dnd";
import { movePatternTrackInTrackMap } from "redux/slices/maps/trackMap";

export const moveTrack =
  (props: {
    dragId: TrackId;
    hoverIndex: number;
    hoverId: TrackId;
  }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverIndex, hoverId } = props;
    const state = getState();

    // Get the corresponding pattern tracks
    const thisPatternTrack = selectPatternTrack(state, dragId);
    const otherTrack = selectTrack(state, hoverId);
    if (!thisPatternTrack || !otherTrack) return false;

    // If the other track is a scale track, move the pattern track
    if (!isPatternTrack(otherTrack)) {
      dispatch(setPatternTrackScaleTrack(thisPatternTrack.id, otherTrack.id));
      return true;
    }

    // Get the corresponding scale tracks
    const thisScaleTrack = selectScaleTrack(
      state,
      thisPatternTrack.scaleTrackId
    );
    const otherScaleTrack = selectScaleTrack(state, otherTrack.scaleTrackId);
    if (!thisScaleTrack || !otherScaleTrack) return false;
    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisScaleTrack.id === otherScaleTrack.id) {
      dispatch(
        movePatternTrackInTrackMap({
          scaleTrackId: thisScaleTrack.id,
          patternTrackId: thisPatternTrack.id,
          index: hoverIndex,
        })
      );
    } else {
      // If the pattern tracks are in different scale tracks, change the scale track
      dispatch(
        setPatternTrackScaleTrack(
          thisPatternTrack.id,
          otherScaleTrack.id,
          hoverIndex
        )
      );
    }
    return true;
  };

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const track = ownProps.track as PatternTrackType;
  const mixer = selectMixerByTrackId(state, track.id);
  const volume = mixer?.volume ?? Constants.DEFAULT_VOLUME;
  const pan = mixer?.pan ?? Constants.DEFAULT_PAN;
  const mute = mixer?.mute ?? false;
  const solo = mixer?.solo ?? false;
  const instrumentName = getInstrumentName(track.instrument as InstrumentName);

  const { editorState, showingEditor, selectedTrackId } = selectRoot(state);
  const onEditor = editorState === "instrument" && showingEditor;
  const onInstrument = !!(
    onEditor &&
    selectedTrackId &&
    track.id === selectedTrackId
  );
  const transport = selectTransport(state);

  return {
    ...ownProps,
    track,
    volume,
    pan,
    mute,
    solo,
    onInstrument,
    instrumentName,
    isStarted: transport.state === "started",
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    moveTrack: (props: {
      dragId: TrackId;
      hoverIndex: number;
      hoverId: TrackId;
    }) => {
      return dispatch(moveTrack(props));
    },
    setPatternTrackName: (track: Partial<PatternTrackType>, name: string) => {
      dispatch(updatePatternTrack({ id: track.id, name }));
    },
    setPatternTrackVolume: (
      track: Partial<PatternTrackType>,
      volume: number
    ) => {
      if (!track?.id) return;
      dispatch(setMixerVolume(track.id, volume));
    },
    setPatternTrackPan: (track: Partial<PatternTrackType>, pan: number) => {
      if (!track?.id) return;
      dispatch(setMixerPan(track.id, pan));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(PatternTrack);

function PatternTrack(props: Props) {
  const { track } = props;

  const PatternName = useDebouncedField<string>((name) => {
    props.setPatternTrackName(track, name);
  }, track.name);

  const [holdingK, setHoldingK] = useState(false);

  useEventListeners(
    {
      k: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          setHoldingK(true);
        },
        keyup: (e) => {
          if (isInputEvent(e)) return;
          setHoldingK(false);
        },
      },
    },
    []
  );

  // Drag and drop pattern tracks
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useTrackDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useTrackDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const [draggingVolume, setDraggingVolume] = useState(false);
  const [draggingPan, setDraggingPan] = useState(false);

  const VolumeTooltip = () => (
    <div
      className={`w-[4.5rem] h-12 top-0 ml-6 absolute text-xs flex flex-col justify-center items-center rounded-lg border border-slate-50/50 bg-slate-900/80 backdrop-blur text-white`}
    >
      <div className={`relative w-[3rem] text-center pb-[3px] mb-0.5`}>
        <span
          style={{
            width: `${percentOfRange(
              props.volume,
              Constants.MIN_VOLUME,
              Constants.MAX_VOLUME
            )}%`,
          }}
          className={`absolute rounded left-0 -bottom-[1px] h-1 bg-emerald-500`}
        />
        <label className="bg-slate-800">Volume</label>
      </div>
      <label className="pb-1">{props.volume}dB</label>
    </div>
  );

  const PanTooltip = () => (
    <div
      className={`top-0 ml-6 absolute text-xs flex flex-col justify-center items-center w-[4.5rem] h-12 rounded-lg border border-slate-50/50 bg-slate-900/80 backdrop-blur text-white`}
    >
      <div className={`relative w-8 text-center pb-[2px] mb-1`}>
        <div
          style={{
            width: `${percentOfRange(
              props.pan,
              Constants.MIN_PAN,
              Constants.MAX_PAN
            )}%`,
          }}
          className={`absolute rounded left-0 -bottom-[1px] h-1 bg-teal-400`}
        ></div>
        <label className="bg-slate-800">Pan</label>
      </div>
      <label className="pb-1">
        {props.pan === 0
          ? "50L • 50R"
          : `${percentOfRange(
              props.pan,
              Constants.MAX_PAN,
              Constants.MIN_PAN
            )}L • ${percentOfRange(
              props.pan,
              Constants.MIN_PAN,
              Constants.MAX_PAN
            )}R`}
      </label>
    </div>
  );

  const InstrumentButton = () => (
    <TrackButton
      className={`px-3 border border-orange-400 ${
        props.onInstrument ? "bg-orange-500" : ""
      }`}
      onClick={() =>
        props.onInstrument
          ? props.hideEditor()
          : props.showEditor(track.id, "instrument")
      }
    >
      <label className="cursor-pointer flex items-center instrument-button">
        Track Instrument <BsPencil className="ml-2" />
      </label>
    </TrackButton>
  );

  const MuteButton = () => (
    <div
      className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-rose-500 ${
        props.mute ? "bg-rose-500 text-white" : ""
      }`}
      onClick={(e) =>
        isHoldingOption(e.nativeEvent)
          ? props.mute
            ? props.unmuteTracks()
            : props.muteTracks()
          : props.setTrackMute(track.id, !props.mute)
      }
    >
      M
    </div>
  );

  const SoloButton = () => (
    <div
      className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-yellow-400 ${
        props.solo ? "bg-yellow-400 text-white" : ""
      }`}
      onClick={(e) =>
        isHoldingOption(e.nativeEvent)
          ? props.solo
            ? props.unsoloTracks()
            : props.soloTracks()
          : props.setTrackSolo(track.id, !props.solo)
      }
    >
      S
    </div>
  );

  return (
    <div
      className={`rdg-track p-2 px-4 pl-1 flex h-full bg-gradient-to-r from-sky-800 to-green-700/90 text-white border-b border-b-white/20 ${
        isDragging ? "opacity-75" : ""
      } ${props.isTrackSelected ? "bg-slate-300/80" : ""}`}
      ref={ref}
    >
      <div className="flex w-24" draggable onDragStart={cancelEvent}>
        <div className="w-6 z-[90] relative">
          <div className="w-full h-full">
            <input
              className={`w-[5.4rem] h-5 -ml-7 mr-[2.5rem] mt-[2.5rem] rotate-[270deg] accent-emerald-500`}
              type="range"
              aria-orientation="vertical"
              value={props.volume}
              min={Constants.MIN_VOLUME}
              max={Constants.MAX_VOLUME}
              step={Constants.VOLUME_STEP}
              onChange={(e) =>
                props.setPatternTrackVolume(track, parseFloat(e.target.value))
              }
              onMouseDown={() => setDraggingVolume(true)}
              onMouseUp={() => setDraggingVolume(false)}
              onDoubleClick={() =>
                props.setPatternTrackVolume(track, Constants.DEFAULT_VOLUME)
              }
            />
            {draggingVolume ? <VolumeTooltip /> : null}
          </div>
        </div>
        <div className="ml-1 mr-2 w-6 h-full z-[80] relative">
          <div className="w-full h-full">
            <input
              className={`w-[5.4rem] h-5 mt-[2.5rem] -translate-x-[1.9rem] rotate-[270deg] accent-teal-400`}
              type="range"
              aria-orientation="vertical"
              value={props.pan}
              min={Constants.MIN_PAN}
              max={Constants.MAX_PAN}
              step={Constants.PAN_STEP}
              onChange={(e) =>
                props.setPatternTrackPan(track, parseFloat(e.target.value))
              }
              onMouseDown={() => setDraggingPan(true)}
              onMouseUp={() => setDraggingPan(false)}
              onDoubleClick={() =>
                props.setPatternTrackPan(track, Constants.DEFAULT_PAN)
              }
            />
            {draggingPan ? <PanTooltip /> : null}
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-evenly">
        {holdingK ? (
          <label className="w-full text-gray-400 text-xs font-extralight pl-1">
            N{props.chromaticTranspose} • T{props.scalarTranspose} • t
            {props.chordalTranspose}
          </label>
        ) : null}
        <div
          className="w-full flex relative"
          draggable
          onDragStart={cancelEvent}
        >
          <input
            placeholder={props.instrumentName}
            value={PatternName.value}
            onChange={PatternName.onChange}
            className="bg-zinc-800 px-1 mr-2 h-7 flex-auto caret-white outline-none rounded-md overflow-ellipsis text-sm text-gray-300 border-2 border-zinc-800 focus:border-indigo-500/50"
            onKeyDown={PatternName.onKeyDown}
          />
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
        </div>
        <div
          className="flex items-center w-full pt-1.5"
          draggable
          onDragStart={cancelEvent}
        >
          <InstrumentButton />
          <div className="flex flex-col pl-2 ml-auto mr-1 space-y-1 select-none">
            <div className="flex space-x-1">
              <MuteButton />
              <SoloButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
