import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";

import { TrackProps } from ".";
import { TrackButton, TrackDropdownButton, TrackDropdownMenu } from "./Track";
import {
  selectRoot,
  selectTransport,
  selectMixerByTrackId,
} from "redux/selectors";
import { updatePatternTrack } from "redux/slices/patternTracks";
import * as Constants from "appConstants";
import { PatternTrack as PatternTrackType } from "types/tracks";
import useDebouncedField from "hooks/useDebouncedField";
import { getInstrumentName, InstrumentName } from "types/instrument";
import { setMixerVolume } from "redux/slices/mixers";
import { BsEraser, BsPencil, BsTrash } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { isInputEvent } from "appUtil";
import useEventListeners from "hooks/useEventListeners";
import { useState } from "react";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const track = ownProps.track as PatternTrackType;
  const mixer = selectMixerByTrackId(state, track.id);
  const instrumentName = getInstrumentName(track.instrument as InstrumentName);

  const { editorState, showEditor, activeTrackId } = selectRoot(state);
  const onEditor = editorState === "instrument" && showEditor;
  const onInstrument = !!(
    onEditor &&
    activeTrackId &&
    track.id === activeTrackId
  );
  const transport = selectTransport(state);
  return {
    ...ownProps,
    track,
    mixer,
    onInstrument,
    instrumentName,
    isStarted: transport.state === "started",
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setPatternTrackName: (track: Partial<PatternTrackType>, name: string) => {
    dispatch(updatePatternTrack({ id: track.id, name }));
  },
  setPatternTrackVolume: (track: Partial<PatternTrackType>, volume: number) => {
    if (!track?.id) return;
    dispatch(setMixerVolume(track.id, volume));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(PatternTrack);

function PatternTrack(props: Props) {
  const { track, mixer } = props;

  const PatternInput = useDebouncedField<string>((name) => {
    props.setPatternTrackName(track, name);
  }, track.name);

  const [holdingV, setHoldingV] = useState(false);

  useEventListeners(
    {
      v: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          setHoldingV(true);
        },
        keyup: (e) => {
          if (isInputEvent(e)) return;
          setHoldingV(false);
        },
      },
    },
    []
  );

  return (
    <div
      className={`rdg-track p-2 flex h-full bg-gradient-to-r from-sky-800 to-green-800 text-white border-b border-b-white/20`}
    >
      <div className="w-auto h-full flex-shrink-0">
        <input
          className="rotate-[270deg] w-20 -mr-4 -ml-8 my-10"
          type="range"
          value={mixer?.volume ?? Constants.DEFAULT_VOLUME}
          min={Constants.MIN_VOLUME}
          max={Constants.MAX_VOLUME}
          onChange={(e) =>
            props.setPatternTrackVolume(track, parseInt(e.target.value))
          }
        />
      </div>
      <div className="w-full h-full flex flex-col items-center justify-evenly">
        {holdingV ? (
          <label className="w-full text-gray-400 text-xs font-extralight pl-1">
            N{props.chromaticTranspose} • T{props.scalarTranspose} • t
            {props.chordalTranspose}
          </label>
        ) : null}
        <div className="w-full flex relative">
          <input
            placeholder={props.instrumentName}
            value={PatternInput.value}
            onChange={PatternInput.onChange}
            className="bg-zinc-800 px-1 mr-2 h-7 flex-auto caret-white outline-none rounded-md overflow-ellipsis text-sm text-gray-300 border-2 border-zinc-800 focus:border-indigo-500/50"
            onKeyDown={PatternInput.onKeyDown}
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
        <div className="flex items-center w-full pt-1.5">
          <>
            <TrackButton
              className={`px-3 border border-orange-400 ${
                props.onInstrument ? "bg-orange-500" : ""
              }`}
              onClick={() =>
                props.onInstrument
                  ? props.hideEditor()
                  : props.viewEditor(track.id, "instrument")
              }
            >
              <label className="cursor-pointer flex items-center instrument-button">
                Track Instrument <BsPencil className="ml-2" />
              </label>
            </TrackButton>
          </>
          <div className="flex flex-col pl-2 ml-auto mr-1 space-y-1">
            <div className="flex space-x-1">
              <div
                className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-rose-500 ${
                  mixer?.mute ? "bg-rose-500 text-white" : ""
                }`}
                onClick={() => props.setTrackMute(track.id, !mixer?.mute)}
              >
                M
              </div>
              <div
                className={`flex items-center justify-center rounded-full cursor-pointer w-6 h-6 font-bold text-sm border border-yellow-400 ${
                  mixer?.solo ? "bg-yellow-400 text-white" : ""
                }`}
                onClick={() => props.setTrackSolo(track.id, !mixer?.solo)}
              >
                S
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
