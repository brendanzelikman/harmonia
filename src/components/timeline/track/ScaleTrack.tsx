import { connect, ConnectedProps } from "react-redux";
import { createPatternTrack, updateTrack } from "redux/slices/tracks";
import { AppDispatch, RootState } from "redux/store";
import { ScaleTrack as ScaleTrackType, Track, TrackId } from "types/tracks";
import { TrackProps } from ".";
import { TrackButton } from "./Track";
import useDebouncedField from "hooks/useDebouncedField";
import {
  GiMusicalScore,
  GiPencilBrush,
  GiLinkedRings,
  GiTrashCan,
  GiMagicBroom,
} from "react-icons/gi";
import { Tooltip } from "flowbite-react";
import {
  selectRoot,
  selectScaleTrackScaleAtTime,
  selectTransport,
} from "redux/selectors";
import { viewEditor } from "redux/slices/root";
import Scales from "types/scales";
import { MIDI } from "types/midi";
import { ChromaticScale } from "types/presets/scales";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const track = ownProps.track as ScaleTrackType;

  const { editorState, showEditor, activeTrackId } = selectRoot(state);
  const onEditor = editorState === "scale" && showEditor;
  const onScale = !!(onEditor && activeTrackId && track.id === activeTrackId);

  const transport = selectTransport(state);
  const scale = track
    ? selectScaleTrackScaleAtTime(state, track.id, transport.time - 1)
    : undefined;

  return {
    ...ownProps,
    track,
    onScale,
    scale,
    isStarted: transport.state === "started",
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: TrackProps) => ({
  onScaleClick: (onScale: boolean) => {
    const trackId = ownProps.track?.id;
    if (!trackId) return;
    if (onScale) {
      dispatch(ownProps.hideEditor);
    } else {
      dispatch(viewEditor({ id: "scale", trackId }));
    }
  },
  setTrackName: (track: Partial<Track>, name: string) => {
    dispatch(updateTrack({ ...track, name }));
  },
  createPatternTrack: (scaleTrackId: TrackId) => {
    dispatch(createPatternTrack({ scaleTrackId }));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(ScaleTrack);

function ScaleTrack(props: Props) {
  const track = props.track;
  const scale = props.scale;

  const NameInput = useDebouncedField<string>((name) => {
    props.setTrackName(track, name);
  }, track.name);

  const presetMatch = scale
    ? Scales.Presets.find((s) => Scales.areEqual(s, scale)) ||
      Scales.Presets.find((s) => Scales.areRelated(s, scale))
    : undefined;

  const placeholder = !scale?.notes.length
    ? "Chromatic Scale"
    : Scales.areRelated(scale, ChromaticScale)
    ? "Chromatic Scale"
    : presetMatch && scale
    ? `${MIDI.toPitchClass(scale.notes[0])} ${presetMatch.name}`
    : "Custom Scale";

  if (!track) return null;

  return (
    <div
      className={`rdg-track h-full p-2 bg-gradient-to-r from-sky-900/80 to-indigo-900/80 mix-blend-normal text-white border-b border-b-white/20`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center overflow-scroll">
        <div className="w-full">
          <input
            placeholder={placeholder}
            value={NameInput.value}
            onChange={NameInput.onChange}
            className="w-full bg-zinc-800 pl-1 caret-white outline-none rounded-md overflow-ellipsis text-sm text-white border-2 border-zinc-800 focus:border-indigo-500/50"
            onKeyDown={NameInput.onKeyDown}
          />
        </div>
        <div className="flex items-center justify-start mt-2 w-full">
          <>
            <Tooltip content="Change Scale">
              <TrackButton
                className={`w-12 border-sky-600 ${
                  props.onScale ? "bg-sky-600" : ""
                } active:bg-sky-600`}
                onClick={() => props.onScaleClick(props.onScale)}
              >
                <GiMusicalScore className="text-2xl" />
              </TrackButton>
            </Tooltip>

            <Tooltip content="Add a Pattern Track">
              <TrackButton
                className={`w-12 border-emerald-600 active:bg-emerald-600 select-none`}
                onClick={() => props.createPatternTrack(track.id)}
              >
                <GiPencilBrush className="text-xl" />
              </TrackButton>
            </Tooltip>

            <Tooltip content="Copy Track">
              <TrackButton
                className="w-12 border border-indigo-500 active:bg-indigo-500 select-none"
                onClick={() => props.duplicateTrack(track.id)}
              >
                <GiLinkedRings className="text-xl" />
              </TrackButton>
            </Tooltip>

            <Tooltip content="Clear Track">
              <TrackButton
                className={`w-12 px-2 pt-1 border-slate-200 active:bg-slate-200 active:text-gray-700 pb-1 select-none`}
                onClick={() => props.clearTrack(track.id)}
              >
                <GiMagicBroom className="text-xl" />
              </TrackButton>
            </Tooltip>
            <Tooltip content="Delete Track">
              <TrackButton
                className={`w-12 px-2 border-slate-500 active:bg-slate-200 active:text-gray-700 pb-1 select-none`}
                onClick={() => props.deleteTrack(track.id)}
              >
                <GiTrashCan className="text-2xl" />
              </TrackButton>
            </Tooltip>
          </>
        </div>
      </div>
    </div>
  );
}
