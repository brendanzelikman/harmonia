import {
  PatternClip,
  getClipTheme,
  PatternClipId,
  PatternClipMidiBlock,
  getClipDuration,
} from "types/Clip";
import { usePatternClipDrag } from "./usePatternClipDrag";
import {
  getMidiStreamRange,
  getPatternBlockDuration,
  isPatternMidiChord,
  PatternMidiNote,
} from "types/Pattern";
import {
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
  useProjectSelector as use,
} from "redux/hooks";
import { useCallback, useMemo } from "react";
import { selectClipName, selectPatternClipPoseClips } from "redux/Clip";
import {
  onPatternClipClick,
  selectMediaDragState,
  selectTimelineObjectHeight,
  selectTimelineTickLeft,
  selectTrackedObjectTop,
  updateMediaDragState,
} from "redux/Timeline";
import {
  onPatternClipDoubleClick,
  onMediaDragEnd,
  sliceClip,
} from "redux/thunks";
import { getMidiPitch } from "utils/midi";
import { selectPortaledPatternClipStream } from "redux/Arrangement";
import { selectTrackById } from "redux/Track";
import { POSE_HEIGHT, MIN_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { getTickColumns } from "utils/durations";
import { normalize } from "utils/math";
import classNames from "classnames";
import { isScaleTrack } from "types/Track";
import { ClipRendererProps } from "./TimelineClips";
import { clamp } from "lodash";

interface PatternClipRendererProps extends ClipRendererProps {
  clip: PatternClip;
}

export function PatternClipRenderer(props: PatternClipRendererProps) {
  const {
    clip,
    portaledClip,
    isSelected,
    heldKeys,
    isAddingPatterns,
    isPortalingClips,
    isSlicingClips,
    cell,
    subdivision,
  } = props;
  const dispatch = useProjectDispatch();

  /** Update the timeline when dragging clips. */
  const onDragStart = useCallback(() => {
    dispatch(updateMediaDragState({ draggingPatternClip: true }));
  }, []);

  /** Update the timeline when releasing clips and call the thunk. */
  const onDragEnd = useCallback((item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingPatternClip: false }));
    dispatch(onMediaDragEnd(item, monitor));
  }, []);

  /** A custom hook for dragging clips into cells. */
  const [{ isDragging }, drag] = usePatternClipDrag({
    clip: { ...clip, id: portaledClip.id as PatternClipId },
    onDragStart,
    onDragEnd,
  });
  const dragState = use(selectMediaDragState);
  const { draggingPoseClip, draggingPortal } = dragState;

  // Timeline info
  const isEyedropping = heldKeys.i;
  const isDraggingOther = draggingPoseClip || draggingPortal;

  // Clip info
  const { headerColor, bodyColor, noteColor } = getClipTheme(clip);
  const name = use((_) => selectClipName(_, clip.id));
  const stream = useDeep((_) =>
    selectPortaledPatternClipStream(_, portaledClip.id)
  );
  const clipDuration = getClipDuration(clip, stream);
  const endTick = clip.tick + clipDuration;
  const track = use((_) => selectTrackById(_, clip.trackId));
  const clipPoses = useDeep((_) => selectPatternClipPoseClips(_, clip.id));
  const isShort =
    dragState.draggingPoseClip || props.isAddingPoses || clipPoses.length > 0;

  // Clip dimensions
  const trackTop = use((_) => selectTrackedObjectTop(_, clip));
  const trackHeight = use((_) => selectTimelineObjectHeight(_, clip));
  const top = isShort ? trackTop + POSE_HEIGHT : trackTop;
  const height = isShort ? trackHeight - POSE_HEIGHT : trackHeight;
  const columns = getTickColumns(clipDuration, subdivision);
  const width = columns * cell.width;
  const left = use((_) => selectTimelineTickLeft(_, clip?.tick));
  const NAME_HEIGHT = 24;

  // Clip stream dimensions
  const STREAM_MARGIN = 8;
  const streamHeight = height - NAME_HEIGHT - STREAM_MARGIN;
  const streamRange = getMidiStreamRange(stream.map((_) => _.notes));
  const streamLength = streamRange.length;

  // Clip note dimensions
  const showPitch = heldKeys.n && heldKeys["`"];
  const showMidi = heldKeys.m && heldKeys["`"];
  const showFlat = showPitch || showMidi;
  const noteHeight = useMemo(
    () => (showFlat ? 20 : Math.min(20, streamHeight / streamLength)),
    [showFlat, streamHeight, streamLength]
  );
  const fontSize = Math.min(12, noteHeight) - 4;

  /** Render a single MIDI note in the clip. */
  const renderNote = useCallback(
    (props: {
      note: PatternMidiNote;
      clipIndex: number;
      chordIndex: number;
    }) => {
      const { note, clipIndex, chordIndex } = props;
      const midi = note.MIDI;
      const pitch = getMidiPitch(midi);

      // Get the left offset of the note from its tick
      const left = getTickColumns(clipIndex, subdivision) * cell.width;

      // Get the width of the note from its duration
      const columns = getTickColumns(note.duration || 0, subdivision);
      const width = columns * cell.width - 2;

      // Get the offset of the note from its MIDI relative to the stream
      const noteOffset = note.MIDI - streamRange[0];
      const offset = (streamLength - noteOffset - 1) * noteHeight;
      const top = Math.round(
        showFlat
          ? chordIndex * noteHeight
          : streamLength === 1
          ? (streamHeight - noteHeight) / 2
          : offset + noteHeight / 2
      );

      // Get the opacity of the note from its velocity
      const opacity = normalize(note.velocity, MIN_VELOCITY, MAX_VELOCITY);

      // Assemble the class and style
      const style = { top, left, width, height: noteHeight, opacity };
      const noteClass = classNames(
        noteColor,
        "absolute flex items-center justify-center shrink-0",
        "border border-slate-950/80 rounded transition-all duration-200"
      );
      const shouldShowSymbol = width > 20 && noteHeight > 5;
      const symbol = showMidi ? midi : pitch;

      // Return the note
      return (
        <li
          key={`${note}-${clipIndex}-${chordIndex}`}
          className={noteClass}
          style={style}
        >
          {shouldShowSymbol && <>{symbol}</>}
        </li>
      );
    },
    [
      cell,
      noteColor,
      subdivision,
      !!showFlat,
      !!showMidi,
      noteHeight,
      streamRange,
      streamLength,
    ]
  );

  /** Render a list of notes in a chord. */
  const renderBlock = useCallback(
    (block: PatternClipMidiBlock, i: number) => {
      const { notes, startTick, strumIndex } = block;
      if (!clip || !isPatternMidiChord(notes)) return null;
      const chordClass = classNames(
        {
          "bg-slate-500/50 group-hover:bg-slate-600/50 cursor-scissors":
            isSlicingClips,
        },
        {
          "hover:border-r-4 border-slate-50/50":
            isSlicingClips && i < stream.length - 1,
        },
        { "border-slate-50/10": !isSlicingClips }
      );
      // Get the remainder of the clip's duration
      const remainder = endTick - startTick;
      const blockDuration = getPatternBlockDuration(block.notes);
      const duration = clamp(blockDuration, 0, remainder);
      const width = duration * cell.width;
      const index = block.startTick - clip.tick;
      const blockEndTick = block.startTick + duration;
      return (
        <ul
          key={`${clip.id}-chord-${i}`}
          className={chordClass}
          style={{ width }}
          onClick={() =>
            isSlicingClips && dispatch(sliceClip(clip, blockEndTick))
          }
        >
          {notes.map((note, j) =>
            renderNote({
              note,
              clipIndex: index,
              chordIndex: Math.max(j, strumIndex ?? 0),
            })
          )}
        </ul>
      );
    },
    [clip, isSlicingClips, cell, renderNote]
  );

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
      <span className={nameClass} style={{ height: NAME_HEIGHT }}>
        {name}
      </span>
    );
  }, [headerColor, name]);

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
  }, [ClipName, ClipStream, bodyColor]);

  // Assemble the class name and style
  const className = classNames(
    "absolute z-10 border-2 rounded-lg overflow-hidden",
    { "cursor-paintbrush": isAddingPatterns },
    { "hover:animate-pulse hover:ring hover:ring-teal-500": isAddingPatterns },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": isEyedropping },
    { "cursor-pointer": !isAddingPatterns && !isEyedropping },
    isDragging ? "opacity-50 pointer-events-none" : "opacity-100",
    isDraggingOther || isPortalingClips ? "pointer-events-none" : "",
    isSelected ? "font-bold" : "font-medium",
    isSelected
      ? "border-white/80"
      : clipPoses.length > 0
      ? "border-emerald-400/20"
      : "border-emerald-400/50"
  );

  // Render the clip
  if (isScaleTrack(track)) return null;
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width, height, fontSize }}
      onClick={(e) => dispatch(onPatternClipClick(e, clip, isEyedropping))}
      onDoubleClick={() => dispatch(onPatternClipDoubleClick(clip))}
    >
      {ClipBody}
    </div>
  );
}
