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
  selectSelectedTranspositionIds,
} from "redux/selectors";
import Scales, { chromaticScale } from "types/scale";
import { MIDI } from "types/midi";
import { BiCopy } from "react-icons/bi";
import {
  BsArrowsCollapse,
  BsEraser,
  BsPencil,
  BsPlusCircle,
  BsTrash,
} from "react-icons/bs";
import { blurOnEnter, cancelEvent, isHoldingCommand } from "utils";
import { useMemo, useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./dnd";
import { setPatternTrackScaleTrack } from "redux/slices/patternTracks";
import { PresetScaleList } from "types/presets/scales";
import useKeyHolder from "hooks/useKeyHolder";
import { isEditorOn } from "types";
import { Transition } from "@headlessui/react";
import { moveTrackInSession } from "redux/slices/sessionMap";
import useEventListeners from "hooks/useEventListeners";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const { selectedTrackId } = ownProps;
  const { tick } = selectTransport(state);
  const live = selectSelectedTranspositionIds(state).length > 0;

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
    live,
    track,
    isSelected,
    placeholder,
    onScaleEditor,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setTrackName: (track: Partial<Track>, name: string) => {
    dispatch(updateTrack({ id: track.id, name }));
  },
  createScaleTrack: (parentId: TrackId) => {
    dispatch(createScaleTrack({ parentId }));
  },
  createPatternTrack: (parentId: TrackId) => {
    dispatch(createPatternTrack({ parentId }));
  },
  moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => {
    return dispatch(moveScaleTrack(props));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(ScaleTrack);

function ScaleTrack(props: Props) {
  const { track, placeholder, onScaleEditor, cell } = props;
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

  // Scale track name field
  const ScaleTrackNameField = useMemo(() => {
    const isSmall = cell.height < 100;
    const className = isSmall ? "text-xs h-6" : "text-sm h-7";
    return () => (
      <>
        <input
          placeholder={placeholder}
          value={track.name}
          onChange={(e) => props.setTrackName(track, e.target.value)}
          className={`flex-auto font-nunito ${className} bg-zinc-800 px-1 mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-ellipsis text-white border-2 border-zinc-800 focus:border-indigo-500`}
          onKeyDown={blurOnEnter}
        />
        <label
          className={`w-4 text-center ${
            props.isScaleSelected && props.live
              ? "font-semibold text-fuchsia-400 text-shadow"
              : "font-medium"
          }`}
        >
          {props.row.depth + 1}
        </label>
      </>
    );
  }, [
    placeholder,
    cell,
    track,
    props.live,
    props.row.depth,
    props.isScaleSelected,
  ]);

  // Scale track dropdown menu
  const ScaleTrackDropdownMenu = useMemo(() => {
    const hasCollapsedChild =
      props.children.length && props.children.some((track) => track?.collapsed);
    return () => (
      <TrackDropdownMenu>
        <div className="flex flex-col w-full">
          <TrackDropdownButton
            content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
            icon={<BsArrowsCollapse />}
            onClick={() =>
              track.collapsed
                ? props.expandTrack(track)
                : props.collapseTrack(track)
            }
          />
          <TrackDropdownButton
            content={`${hasCollapsedChild ? "Expand " : "Collapse"} Children`}
            icon={<BsArrowsCollapse />}
            onClick={() =>
              hasCollapsedChild
                ? props.expandTrackChildren(track)
                : props.collapseTrackChildren(track)
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
    );
  }, [track, props.children]);

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
          className="w-full flex relative justify-end"
          draggable
          onDragStart={cancelEvent}
        >
          {ScaleTrackNameField()}
          {ScaleTrackDropdownMenu()}
        </div>
      </>
    );
  }, [
    props.row,
    ScaleTrackNameField,
    ScaleTrackDropdownMenu,
    chromatic,
    chordal,
    holdingK,
  ]);

  const toggleEditor = () =>
    onScaleEditor ? props.hideEditor() : props.showEditor(track.id, "scale");

  useEventListeners(
    {
      e: {
        keydown: (e) =>
          isHoldingCommand(e) && props.isSelected && toggleEditor(),
      },
    },
    [toggleEditor, props.isSelected]
  );

  // Scale track body
  const ScaleTrackBody = useMemo(() => {
    const isSmall = cell.height < 100;
    const className = isSmall ? "text-xs" : "text-sm";
    return () => (
      <div
        className={`flex items-center mt-2 w-full ${className}`}
        draggable
        onDragStart={cancelEvent}
      >
        <>
          <TrackButton
            className={`px-3 border-sky-400 ${
              onScaleEditor
                ? "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse"
                : ""
            }`}
            onClick={toggleEditor}
          >
            <label className="flex items-center cursor-pointer scale-button">
              Notes <BsPencil className="ml-2" />
            </label>
          </TrackButton>
          <TrackButton
            className={`px-4 border-emerald-500 active:bg-gradient-to-tr active:from-emerald-500 active:to-teal-500/50 background-pulse select-none`}
            onClick={() => props.createPatternTrack(track.id)}
          >
            <label className="flex items-center cursor-pointer">
              Pattern <BsPlusCircle className="ml-2" />
            </label>
          </TrackButton>
          <TrackButton
            className={`px-3 border-indigo-400 active:bg-gradient-to-r active:from-indigo-400 active:to-indigo-500 background-pulse select-none`}
            onClick={() => props.createScaleTrack(track.id)}
          >
            <label className="flex items-center cursor-pointer">
              Scale <BsPlusCircle className="ml-2" />
            </label>
          </TrackButton>
        </>
      </div>
    );
  }, [onScaleEditor, track, toggleEditor, cell]);

  // Assembled scale track
  const ScaleTrack = useMemo(() => {
    return (
      <div
        className={`rdg-track border-b border-b-slate-300 flex w-full h-full bg-indigo-700 p-2 text-white ${
          isDragging ? "opacity-75" : ""
        }`}
        ref={ref}
        onClick={() => props.selectTrack(track.id)}
      >
        <div
          className={`w-full h-full p-2 border-2 rounded bg-gradient-to-r from-sky-900 to-indigo-800 ${
            props.isSelected
              ? props.onScaleEditor
                ? "border-sky-500"
                : "border-blue-400"
              : "border-sky-950"
          }`}
          onDoubleClick={() =>
            props.onScaleEditor
              ? props.hideEditor()
              : props.showEditor(track.id, "scale")
          }
        >
          <div className="w-full h-full flex flex-col items-center justify-evenly">
            {ScaleTrackHeader()}
            {!track.collapsed && ScaleTrackBody()}
          </div>
        </div>
      </div>
    );
  }, [
    props.isSelected,
    props.onScaleEditor,
    isDragging,
    track,
    ScaleTrackHeader,
    ScaleTrackBody,
  ]);

  return ScaleTrack;
}

// Move the track for react-dnd
export const moveScaleTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverId } = props;
    const state = getState();

    // Get the corresponding scale tracks
    const thisTrack = selectTrack(state, dragId);
    const otherTrack = selectTrack(state, hoverId);
    if (!thisTrack || !otherTrack) return false;

    // If the dragged track is a pattern track, move the pattern track
    const isThisPatternTrack = isPatternTrack(thisTrack);
    const isOtherPatternTrack = isPatternTrack(otherTrack);

    if (isThisPatternTrack && !isOtherPatternTrack) {
      const patternTrackId = thisTrack.id;
      const scaleTrackId = otherTrack.id;
      dispatch(setPatternTrackScaleTrack(patternTrackId, scaleTrackId));
      return true;
    }

    // Move the scale track
    dispatch(moveTrackInSession({ id: thisTrack.id, index: 0 }));
    return true;
  };
