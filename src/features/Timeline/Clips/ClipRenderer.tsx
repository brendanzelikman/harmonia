import { Clip, ClipId, getClipTheme } from "types/Clip";
import { useClipDrag } from "./useClipDrag";
import {
  getMidiStreamRange,
  isPatternRest,
  PatternMidiBlock,
  PatternMidiNote,
} from "types/Pattern";
import {
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
  useProjectSelector as use,
} from "redux/hooks";
import { useMemo } from "react";
import { selectClipName, selectClipPoses } from "redux/Clip";
import {
  onClipClick,
  selectClipWidth,
  selectMediaDragState,
  selectTimeline,
  selectTimelineObjectHeight,
  selectTimelineTickLeft,
  selectTrackedObjectTop,
  updateMediaDragState,
} from "redux/Timeline";
import { onClipDoubleClick, onMediaDragEnd, sliceMedia } from "redux/thunks";
import {
  isTimelineAddingClips,
  isTimelineAddingPoses,
  isTimelinePortalingMedia,
  isTimelineSlicingMedia,
} from "types/Timeline";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getMidiPitch } from "utils/midi";
import { selectPortaledClipStream } from "redux/Arrangement";
import { selectTrackById } from "redux/Track";
import { POSE_HEIGHT, MIN_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { getTickColumns } from "utils/durations";
import { normalize } from "utils/math";
import classNames from "classnames";

interface ClipRendererProps {
  clip: Clip;
  chunkId: ClipId;
  isSelected: boolean;
}

export function ClipRenderer(props: ClipRendererProps) {
  const { clip, chunkId, isSelected } = props;
  const dispatch = useProjectDispatch();
  const heldKeys = useHeldHotkeys(["i", "n", "m"]);

  /** Update the timeline when dragging clips. */
  const onDragStart = () => {
    dispatch(updateMediaDragState({ draggingClip: true }));
  };

  /** Update the timeline when releasing clips and call the thunk. */
  const onDragEnd = (item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingClip: false }));
    dispatch(onMediaDragEnd(item, monitor));
  };

  /** A custom hook for dragging clips into cells. */
  const [{ isDragging }, drag] = useClipDrag({
    clip: { ...clip, id: chunkId },
    onDragStart,
    onDragEnd,
  });
  const dragState = use(selectMediaDragState);
  const { draggingPose, draggingPortal } = dragState;

  // Timeline info
  const timeline = use(selectTimeline);

  const { cell, subdivision } = timeline;
  const isEyedropping = heldKeys.i;
  const isAdding = isTimelineAddingClips(timeline);
  const isSlicing = isTimelineSlicingMedia(timeline);
  const isPortaling = isTimelinePortalingMedia(timeline);
  const isTransposing = isTimelineAddingPoses(timeline);
  const isDraggingOther = draggingPose || draggingPortal;

  // Clip info
  const { headerColor, bodyColor } = getClipTheme(clip);
  const name = use((_) => selectClipName(_, clip.id));
  const stream = useDeep((_) => selectPortaledClipStream(_, chunkId));
  const track = use((_) => selectTrackById(_, clip.trackId));
  const clipPoses = useDeep((_) => selectClipPoses(_, clip.id));
  const isShort =
    dragState.draggingPose || isTransposing || clipPoses.length > 0;

  // Clip dimensions
  const trackTop = use((_) => selectTrackedObjectTop(_, clip));
  const trackHeight = use((_) => selectTimelineObjectHeight(_, clip));
  const top = isShort ? trackTop + POSE_HEIGHT : trackTop;
  const height = isShort ? trackHeight - POSE_HEIGHT : trackHeight;
  const width = use((_) => selectClipWidth(_, clip));
  const left = use((_) => selectTimelineTickLeft(_, clip?.tick));
  const nameHeight = 24;

  // Clip stream dimensions
  const streamMargin = 8;
  const streamHeight = height - nameHeight - streamMargin;
  const streamRange = getMidiStreamRange(stream);
  const streamLength = streamRange.length;

  /** Render a list of notes in a chord. */
  const renderBlock = (block: PatternMidiBlock, i: number) => {
    if (!clip || isPatternRest(block)) return null;
    const chordClass = isSlicing
      ? "bg-slate-500/50 group-hover:bg-slate-600/50 border-slate-50/50 hover:border-r-4 cursor-scissors"
      : "border-slate-50/10";
    return (
      <ul
        key={`${clip.id}-chord-${i}`}
        className={chordClass}
        style={{ width: cell.width }}
        onClick={() => isSlicing && dispatch(sliceMedia(clip, clip.tick + i))}
      >
        {block.map((_, j) => renderNote(_, i, j))}
      </ul>
    );
  };

  // Clip note dimensions
  const showPitch = heldKeys.n;
  const showMidi = heldKeys.m;
  const showFlat = showPitch || showMidi;
  const noteHeight = showFlat ? 20 : Math.min(20, streamHeight / streamLength);
  const fontSize = Math.min(12, noteHeight) - 4;

  /** Render a single MIDI note in the clip. */
  const renderNote = (note: PatternMidiNote, i = 0, j = 0) => {
    const midi = note.MIDI;
    const pitch = getMidiPitch(midi);

    // Get the left offset of the note from its tick
    const left = getTickColumns(i, subdivision) * cell.width;

    // Get the width of the note from its duration
    const columns = getTickColumns(note.duration || 0, subdivision);
    const width = columns * cell.width - 2;

    // Get the offset of the note from its MIDI relative to the stream
    const noteOffset = note.MIDI - streamRange[0];

    const offset = (streamLength - noteOffset - 1) * noteHeight;
    const top = showFlat
      ? j * noteHeight
      : streamLength === 1
      ? (streamHeight - noteHeight) / 2
      : offset + noteHeight / 2;

    // Get the opacity of the note from its velocity
    const opacity = normalize(note.velocity, MIN_VELOCITY, MAX_VELOCITY);

    // Assemble the class and style
    const style = { top, left, width, height: noteHeight, opacity };
    const noteClass = classNames(
      "absolute flex items-center justify-center shrink-0",
      "bg-slate-800 border border-slate-950/80 rounded transition-all duration-150"
    );

    // Return the note
    return (
      <li key={`${note}-${i}-${j}`} className={noteClass} style={style}>
        {width > 20 && noteHeight > 8 ? <>{showMidi ? midi : pitch}</> : null}
      </li>
    );
  };

  /** The name of the clip, which is derived from the name of the pattern. */
  const ClipName = useMemo(() => {
    // The name inherits its color from the clip's theme
    const nameClass = classNames(
      headerColor,
      "flex p-1 items-center shrink-0",
      "border-b border-b-white/20 text-xs text-white/80",
      "truncate pointer-events-none select-none"
    );
    return (
      <span className={nameClass} style={{ height: nameHeight }}>
        {name}
      </span>
    );
  }, []);

  /** The stream of notes in the clip, displayed like a piano roll. */
  const ClipStream = useMemo(() => {
    if (!stream.length) return null;
    return (
      <div className="group w-full h-auto relative flex flex-grow font-extralight text-slate-50/80">
        {stream.map(renderBlock)}
      </div>
    );
  }, [stream, renderBlock]);

  /** The clip body contains the name and stream. */
  const ClipBody = useMemo(() => {
    const bodyClass = classNames(
      bodyColor,
      "w-full h-full relative flex flex-col overflow-scroll"
    );
    return (
      <div className={bodyClass}>
        {ClipName}
        {ClipStream}
      </div>
    );
  }, [ClipName, ClipStream]);

  // Assemble the class name and style
  const className = classNames(
    "absolute z-10 border rounded-lg overflow-hidden",
    { "cursor-paintbrush": isAdding },
    { "hover:animate-pulse hover:ring hover:ring-teal-500": isAdding },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": isEyedropping },
    { "cursor-pointer": !isAdding && !isEyedropping },
    isDragging ? "opacity-50" : "opacity-100",
    isDraggingOther || isPortaling ? "pointer-events-none" : "",
    isSelected ? "border-white font-bold" : "border-slate-200/50 font-medium"
  );

  // Render the clip
  if (track?.type === "scaleTrack") return null;
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width, height, fontSize }}
      onClick={(e) => dispatch(onClipClick(e, clip, isEyedropping))}
      onDoubleClick={() => dispatch(onClipDoubleClick(clip))}
    >
      {ClipBody}
    </div>
  );
}
