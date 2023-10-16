import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, Project } from "redux/store";
import { Clip, ClipId } from "types/Clip";
import { useClipDrag } from "./hooks/useClipDrag";
import { PatternId, PatternNote } from "types/Pattern";
import { showEditor } from "redux/Editor";
import { useDeepEqualSelector } from "redux/hooks";
import { MouseEvent, useMemo } from "react";
import { MIDI } from "types/midi";
import { selectClipById, selectClipName, selectClipStream } from "redux/Clip";
import {
  onClipClick,
  onClipDragEnd,
  selectTimeline,
  updateMediaDraft,
  updateMediaDragState,
} from "redux/Timeline";
import { useClipStyles } from "./hooks/useClipStyles";
import { Tick } from "types/units";
import { pick } from "lodash";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { sliceMedia } from "redux/thunks";
import {
  isAddingClips,
  isAddingTranspositions,
  isSlicingMedia,
} from "types/Timeline";

const mapStateToProps = (state: Project, ownProps: { id: ClipId }) => {
  const clip = selectClipById(state, ownProps.id);
  const name = selectClipName(state, ownProps.id);
  const timeline = selectTimeline(state);
  const { subdivision, mediaDragState } = timeline;
  const isAdding = isAddingClips(timeline);
  const isSlicing = isSlicingMedia(timeline);
  const isTransposing = isAddingTranspositions(timeline);
  const draggingTransposition = mediaDragState.draggingTransposition;
  return {
    ...ownProps,
    clip,
    name,
    isAdding,
    isSlicing,
    isTransposing,
    subdivision,
    draggingTransposition,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    showPatternEditor: (patternId?: PatternId) => {
      dispatch(updateMediaDraft({ clip: { patternId } }));
      dispatch(showEditor({ id: "patterns" }));
    },
    onClick: (
      e: MouseEvent<HTMLDivElement>,
      clip?: Clip,
      eyedropping = false
    ) => {
      dispatch(onClipClick(e, clip, eyedropping));
    },
    onCut: (clip: Clip, tick: Tick) => {
      dispatch(sliceMedia(clip, tick));
    },
    onDragStart: () => {
      dispatch(updateMediaDragState({ draggingClip: true }));
    },
    onDragEnd: (item: any, monitor: any) => {
      dispatch(onClipDragEnd(item, monitor));
      dispatch(updateMediaDragState({ draggingClip: false }));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ClipProps = ConnectedProps<typeof connector>;

export default connector(TimelineClip);

function TimelineClip(props: ClipProps) {
  const { clip, isSlicing } = props;
  const stream = useDeepEqualSelector((_) => selectClipStream(_, clip?.id));

  // Clip properties
  const [{ isDragging }, drag] = useClipDrag(props);
  const isEyedropping = useHeldHotkeys("i").i;

  // CSS properties
  const styles = useClipStyles({
    ...props,
    stream,
    isEyedropping,
    isDragging,
  });

  /**
   * Render a single note in a chord.
   * @param note The note to render.
   * @param j The index of the note in the chord.
   */
  const renderNote = (note: PatternNote, i = 0, j = 0) => {
    if (MIDI.isRest(note.MIDI)) return null;
    const noteStyles = styles.getNoteStyles(note, i);
    const pitch = MIDI.toPitch(note.MIDI);
    const style = pick(noteStyles, [
      "top",
      "left",
      "width",
      "height",
      "opacity",
    ]);
    return (
      <li
        key={`${note}-${i}-${j}`}
        className={`absolute flex items-center justify-center shrink-0 ${noteStyles.border} ${styles.noteColor}`}
        style={style}
      >
        {noteStyles.width > 20 && styles.noteHeight > 8 ? pitch : null}
      </li>
    );
  };

  /**
   * Render a list of notes in a chord.
   * @param notes The notes in the chord.
   * @param i The index of the chord.
   * @returns A rendered list of notes.
   */
  const renderNotes = (notes: PatternNote[], i: number) => {
    if (!clip) return null;
    return (
      <ul
        key={`${clip.id}-chord-${i}`}
        className={styles.chordClass}
        style={{ width: styles.chordWidth }}
        onClick={() => isSlicing && props.onCut(clip, clip.tick + i)}
      >
        {notes.map((_, j) => renderNote(_, i, j))}
      </ul>
    );
  };

  /**
   * The name of the clip, which is derived from the name of the pattern.
   */
  const ClipName = (
    <label
      className={`${styles.cursor} ${styles.headerColor} flex items-center shrink-0 text-xs text-white/80 p-1 border-b border-b-white/20 whitespace-nowrap overflow-ellipsis select-none`}
      style={{ height: styles.nameHeight }}
    >
      {props.name}
    </label>
  );

  /**
   * The stream of notes in the clip, displayed like a piano roll.
   */
  const ClipStream = useMemo(
    () =>
      !!stream && (
        <div className="group w-full h-auto relative flex flex-grow font-extralight text-slate-50/80">
          {stream.map(renderNotes)}
        </div>
      ),
    [stream, renderNotes]
  );

  // Assemble the class name and style
  const className = `fade-in-100 ${styles.position} ${styles.cursor} ${styles.ring} ${styles.opacity} ${styles.pointerEvents} ${styles.border}`;
  const style = pick(styles, ["top", "left", "width", "height", "fontSize"]);

  // Render the clip
  return (
    <div
      ref={drag}
      className={className}
      style={style}
      onClick={(e: MouseEvent<HTMLDivElement>) =>
        props.onClick(e, clip, isEyedropping)
      }
      onDoubleClick={() => props.showPatternEditor(clip?.patternId)}
    >
      <div className={`${styles.body} ${styles.bodyColor}`}>
        {ClipName}
        {ClipStream}
      </div>
    </div>
  );
}
