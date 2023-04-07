import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";

import { TrackProps } from ".";
import { TrackButton } from "./Track";
import {
  selectRoot,
  selectTransport,
  selectMixerByTrackId,
} from "redux/selectors";
import { updatePatternTrack } from "redux/slices/patternTracks";
import * as Constants from "appConstants";
import { PatternTrack as PatternTrackType } from "types/tracks";
import useDebouncedField from "hooks/useDebouncedField";
import {
  GiLinkedRings,
  GiMagicBroom,
  GiTrashCan,
  GiTrumpet,
} from "react-icons/gi";
import { Tooltip } from "flowbite-react";
import { getInstrumentName, InstrumentName } from "types/instrument";
import { setMixerVolume } from "redux/slices/mixers";

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

  return (
    <div
      className={`rdg-track p-2 flex w-full h-full bg-gradient-to-r from-sky-800 to-green-800 text-white border-b border-b-white/20 overflow-auto`}
    >
      <div className="w-auto flex-shrink-0">
        <input
          className="rotate-[270deg] w-16 -mr-3 -ml-6 my-6"
          type="range"
          value={mixer?.volume ?? Constants.DEFAULT_VOLUME}
          min={Constants.MIN_VOLUME}
          max={Constants.MAX_VOLUME}
          onChange={(e) =>
            props.setPatternTrackVolume(track, parseInt(e.target.value))
          }
        />
      </div>
      <div className="h-full flex flex-auto flex-col">
        <input
          placeholder={props.instrumentName}
          value={PatternInput.value}
          onChange={PatternInput.onChange}
          className="bg-zinc-800 pl-1 caret-white outline-none rounded-md overflow-ellipsis text-sm text-gray-300 border-2 border-zinc-800 focus:border-indigo-500/50"
          onKeyDown={PatternInput.onKeyDown}
        />
        <div className="flex items-center justify-evenly w-full h-full pt-1.5">
          <>
            <Tooltip content="Change Instrument">
              <TrackButton
                className={`w-10 border border-orange-400 ${
                  props.onInstrument
                    ? "bg-orange-500 text-white font-medium"
                    : ""
                }`}
                onClick={() =>
                  props.onInstrument
                    ? props.hideEditor()
                    : props.viewEditor(track.id, "instrument")
                }
              >
                <GiTrumpet className="text-xl" />
              </TrackButton>
            </Tooltip>
            <Tooltip content="Copy Track">
              <TrackButton
                className="w-10 border border-indigo-500 active:bg-indigo-500"
                onClick={() => props.duplicateTrack(track.id)}
              >
                <GiLinkedRings className="text-xl" />
              </TrackButton>
            </Tooltip>
            <Tooltip content="Clear Track">
              <TrackButton
                className="w-10 border border-slate-200 active:bg-indigo-500"
                onClick={() => props.clearTrack(track.id)}
              >
                <GiMagicBroom className="text-xl" />
              </TrackButton>
            </Tooltip>
            <Tooltip content="Delete Track">
              <TrackButton
                className="w-10 pb-1 border border-slate-400 active:bg-slate-200 active:text-gray-700"
                onClick={() => props.deleteTrack(track.id)}
              >
                <GiTrashCan className="text-2xl" />
              </TrackButton>
            </Tooltip>
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
