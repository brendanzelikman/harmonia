import { connect, ConnectedProps } from "react-redux";
import { createPatternTrack, updateTrack } from "redux/thunks/tracks";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import {
  isPatternTrack,
  ScaleTrack as ScaleTrackType,
  Track,
  TrackId,
} from "types/tracks";
import { TrackProps } from ".";
import { TrackButton, TrackDropdownButton, TrackDropdownMenu } from "./Track";
import useDebouncedField from "hooks/useDebouncedField";
import {
  selectRoot,
  selectScaleTrackScaleAtTick,
  selectTransport,
  selectTrack,
  selectEditor,
} from "redux/selectors";
import Scales from "types/scales";
import { MIDI } from "types/midi";
import { ChromaticScale } from "types/presets/scales";
import { BiCopy } from "react-icons/bi";
import { BsEraser, BsPencil, BsPlusCircle, BsTrash } from "react-icons/bs";
import useEventListeners from "hooks/useEventListeners";
import { cancelEvent, isInputEvent } from "appUtil";
import { useRef, useState } from "react";
import { moveScaleTrackInTrackMap } from "redux/slices/maps/trackMap";
import { useTrackDrag, useTrackDrop } from "./dnd";
import { setPatternTrackScaleTrack } from "redux/slices/patternTracks";
import { hideEditor, showEditor } from "redux/slices/editor";

export const moveScaleTrack =
  (props: {
    dragId: TrackId;
    hoverId: TrackId;
    hoverIndex: number;
  }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverIndex, hoverId } = props;
    const state = getState();

    // Get the corresponding scale tracks
    const thisTrack = selectTrack(state, dragId);
    const otherTrack = selectTrack(state, hoverId);
    if (!thisTrack || !otherTrack) return false;

    // If one of the tracks is a pattern track, move the pattern track
    const isThisPatternTrack = isPatternTrack(thisTrack);
    const isOtherPatternTrack = isPatternTrack(otherTrack);
    if (isThisPatternTrack || isOtherPatternTrack) {
      const patternTrackId = isThisPatternTrack ? thisTrack.id : otherTrack.id;
      const scaleTrackId = isThisPatternTrack ? otherTrack.id : thisTrack.id;
      dispatch(setPatternTrackScaleTrack(patternTrackId, scaleTrackId));
      return true;
    }

    // Move the scale track
    dispatch(moveScaleTrackInTrackMap({ id: thisTrack.id, index: hoverIndex }));
    return true;
  };

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const track = ownProps.track as ScaleTrackType;

  const editor = selectEditor(state);
  const { selectedTrackId } = selectRoot(state);
  const onEditor = editor.id === "scale" && editor.show;
  const onScale = !!(
    onEditor &&
    selectedTrackId &&
    track.id === selectedTrackId
  );

  const transport = selectTransport(state);
  const scale = track
    ? selectScaleTrackScaleAtTick(state, track.id, transport.tick - 1)
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
      dispatch(hideEditor());
    } else {
      dispatch(showEditor({ id: "scale", trackId }));
    }
  },
  setTrackName: (track: Partial<Track>, name: string) => {
    dispatch(updateTrack({ ...track, name }));
  },
  createPatternTrack: (scaleTrackId: TrackId) => {
    dispatch(createPatternTrack({ scaleTrackId }));
  },
  moveTrack: (props: {
    dragId: TrackId;
    hoverIndex: number;
    hoverId: TrackId;
  }) => {
    return dispatch(moveScaleTrack(props));
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

  // Drag and drop scale tracks
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useTrackDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useTrackDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const isSelected = props.selectedTrackId === track.id;

  return (
    <div
      className={`rdg-track h-full p-2 bg-gradient-to-r from-sky-900/80 to-indigo-800/80 mix-blend-normal text-white border-b border-b-white/20 ${
        isDragging ? "opacity-75" : ""
      } ${isSelected ? "bg-slate-500/80" : ""}`}
      ref={ref}
    >
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
            placeholder={placeholder}
            value={NameInput.value}
            onChange={NameInput.onChange}
            className="flex-auto h-7 bg-zinc-800 px-1 mr-2 caret-white outline-none rounded-md overflow-ellipsis text-sm text-white border-2 border-zinc-800 focus:border-indigo-500/50"
            onKeyDown={NameInput.onKeyDown}
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
          className="flex items-center mt-2 w-full"
          draggable
          onDragStart={cancelEvent}
        >
          <>
            <TrackButton
              className={`px-3 border-sky-600 ${
                props.onScale ? "bg-sky-600" : ""
              } active:bg-sky-600`}
              onClick={() => props.onScaleClick(props.onScale)}
            >
              <label className="flex items-center cursor-pointer scale-button">
                Track Scale <BsPencil className="ml-2" />
              </label>
            </TrackButton>

            <TrackButton
              className={`px-3 border-emerald-600 active:bg-emerald-600 select-none`}
              onClick={() => props.createPatternTrack(track.id)}
            >
              <label className="flex items-center cursor-pointer">
                Pattern Track <BsPlusCircle className="ml-2" />
              </label>
            </TrackButton>
          </>
        </div>
      </div>
    </div>
  );
}
