import { connect, ConnectedProps } from "react-redux";
import {
  createPatternTrack,
  createScaleTrack,
  updateTrack,
} from "redux/thunks/tracks";
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
  selectTrackScaleAtTick,
  selectTransport,
  selectTrack,
  selectEditor,
} from "redux/selectors";
import Scales, { chromaticScale } from "types/scale";
import { MIDI } from "types/midi";
import { BiCopy } from "react-icons/bi";
import { BsEraser, BsPencil, BsPlusCircle, BsTrash } from "react-icons/bs";
import { cancelEvent } from "utils";
import { useMemo, useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./dnd";
import { setPatternTrackScaleTrack } from "redux/slices/patternTracks";
import { PresetScaleList } from "types/presets/scales";
import useKeyHolder from "hooks/useKeyHolder";
import { isEditorOn } from "types";
import { Transition } from "@headlessui/react";
import { moveTrackInSession } from "redux/slices/sessionMap";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const { selectedTrackId } = ownProps;
  const { tick } = selectTransport(state);

  // Track state
  const track = ownProps.track as ScaleTrackType;
  const isSelected = selectedTrackId === track.id;
  const scale = selectTrackScaleAtTick(state, track?.id, tick - 1);

  // Editor state
  const editor = selectEditor(state);
  const onScaleEditor = isSelected && isEditorOn(editor, "scale");

  // Scale properties
  const presetMatch = scale
    ? PresetScaleList.find((s) => Scales.areEqual(s, scale)) ||
      PresetScaleList.find((s) => Scales.areRelated(s, scale))
    : undefined;

  const placeholder = `${
    !scale?.notes.length
      ? "Chromatic Scale"
      : Scales.areRelated(scale, chromaticScale)
      ? "Chromatic Scale"
      : presetMatch && scale
      ? `${MIDI.toPitchClass(scale.notes[0])} ${presetMatch.name}`
      : "Custom Scale"
  }`;

  return {
    ...ownProps,
    track,
    isSelected,
    placeholder,
    onScaleEditor,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setTrackName: (track: Partial<Track>, name: string) => {
    dispatch(updateTrack({ ...track, name }));
  },
  createScaleTrack: (parentId: TrackId) => {
    dispatch(createScaleTrack({ parentId }));
  },
  createPatternTrack: (parentId: TrackId) => {
    dispatch(createPatternTrack({ parentId }));
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
  const { track, placeholder, onScaleEditor } = props;
  const { chromatic, chordal } = props;
  const holdingK = useKeyHolder("k").k;

  // Drag and drop scale tracks
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useTrackDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useTrackDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  // Scale track name
  const ScaleTrackName = useDebouncedField<string>((name) => {
    props.setTrackName(track, name);
  }, track.name);

  // Scale track name field
  const ScaleTrackNameField = useMemo(() => {
    return () => (
      <input
        placeholder={placeholder}
        value={ScaleTrackName.value}
        onChange={ScaleTrackName.onChange}
        className="flex-auto h-7 bg-zinc-800 px-1 mr-2 caret-white outline-none rounded-md overflow-ellipsis text-sm text-white border-2 border-zinc-800 focus:border-indigo-500/50"
        onKeyDown={ScaleTrackName.onKeyDown}
      />
    );
  }, [placeholder, ScaleTrackName.value]);

  // Scale editor button
  const ScaleEditorButton = useMemo(() => {
    return () => (
      <TrackButton
        className={`px-3 border-sky-600 ${
          onScaleEditor
            ? "bg-gradient-to-r from-[#0385b9] to-[#0275bf] background-pulse"
            : ""
        }`}
        onClick={() =>
          onScaleEditor
            ? props.hideEditor()
            : props.showEditor(track.id, "scale")
        }
      >
        <label className="flex items-center cursor-pointer scale-button">
          Scale <BsPencil className="ml-2" />
        </label>
      </TrackButton>
    );
  }, [onScaleEditor]);

  // Scale track dropdown menu
  const ScaleTrackDropdownMenu = useMemo(() => {
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
  }, []);

  // Scale track header
  const ScaleTrackHeader = useMemo(() => {
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
          Current: N{chromatic} • t{chordal}
        </Transition>
        <div
          className="w-full flex relative"
          draggable
          onDragStart={cancelEvent}
        >
          {ScaleTrackNameField()}
          {props.row.depth}
          {ScaleTrackDropdownMenu()}
        </div>
      </>
    );
  }, [props.row, ScaleTrackNameField, chromatic, chordal, holdingK]);

  // Scale track body
  const ScaleTrackBody = useMemo(() => {
    return () => (
      <div
        className="flex items-center mt-2 w-full"
        draggable
        onDragStart={cancelEvent}
      >
        <>
          <ScaleEditorButton />
          <TrackButton
            className={`px-3 border-emerald-600 active:bg-emerald-600 select-none`}
            onClick={() => props.createPatternTrack(track.id)}
          >
            <label className="flex items-center cursor-pointer">
              Pattern <BsPlusCircle className="ml-2" />
            </label>
          </TrackButton>
          <TrackButton
            className={`px-3 border-sky-600 active:bg-sky-600 select-none`}
            onClick={() => props.createScaleTrack(track.id)}
          >
            <label className="flex items-center cursor-pointer">
              Scale <BsPlusCircle className="ml-2" />
            </label>
          </TrackButton>
        </>
      </div>
    );
  }, [ScaleEditorButton]);

  // Assembled scale track
  const ScaleTrack = useMemo(() => {
    return (
      <div
        className={`rdg-track h-full p-2 bg-gradient-to-r from-sky-900/80 to-indigo-700/60 mix-blend-normal text-white border-b border-b-white/20 ${
          isDragging ? "opacity-75" : ""
        } ${props.isSelected ? "bg-slate-500/50" : ""}`}
        style={{ filter: `brightness(${1 + (2 * props.row.depth) / 10})` }}
        ref={ref}
        onClick={() => props.selectTrack(track.id)}
      >
        <div className="w-full h-full flex flex-col items-center justify-evenly">
          {ScaleTrackHeader()}
          {ScaleTrackBody()}
        </div>
      </div>
    );
  }, [props.isSelected, isDragging, ScaleTrackHeader, ScaleTrackBody]);

  return ScaleTrack;
}

// Move the track for react-dnd
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
    dispatch(moveTrackInSession({ id: thisTrack.id, index: hoverIndex }));
    return true;
  };
