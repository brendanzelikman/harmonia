import { connect, ConnectedProps } from "react-redux";
import { Project, Dispatch } from "types/Project";
import { Clip, ClipId } from "types/Clip";
import { useClipDrag } from "./hooks/useClipDrag";
import {
  isPatternRest,
  PatternId,
  PatternMidiBlock,
  PatternMidiNote,
} from "types/Pattern";
import { showEditor } from "redux/Editor";
import { useProjectDeepSelector } from "redux/hooks";
import { MouseEvent, useMemo } from "react";
import { selectClipById, selectClipName } from "redux/Clip";
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
import { sliceMedia } from "redux/thunks";
import {
  isTimelineAddingClips,
  isTimelineAddingTranspositions,
  isTimelineSlicingMedia,
} from "types/Timeline";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getMidiPitch } from "utils/midi";
import { selectClipStream } from "redux/Arrangement";

const mapStateToProps = (project: Project, ownProps: { id: ClipId }) => {
  const clip = selectClipById(project, ownProps.id);
  const name = selectClipName(project, ownProps.id);
  const timeline = selectTimeline(project);
  const { subdivision, mediaDragState } = timeline;
  const isAdding = isTimelineAddingClips(timeline);
  const isSlicing = isTimelineSlicingMedia(timeline);
  const isTransposing = isTimelineAddingTranspositions(timeline);
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

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    showPatternEditor: (patternId?: PatternId) => {
      dispatch(updateMediaDraft({ clip: { patternId } }));
      dispatch(showEditor("patterns"));
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
  const heldKeys = useHeldHotkeys("i");
  const stream = useProjectDeepSelector((_) => selectClipStream(_, clip?.id));

  // Clip properties
  const [{ isDragging }, drag] = useClipDrag(props);

  // CSS properties
  const styles = useClipStyles({
    ...props,
    stream,
    isDragging,
  });

  /** Render a single MIDI notes. */
  const renderNote = (note: PatternMidiNote, i = 0, j = 0) => {
    const noteStyles = styles.getNoteStyles(note, i);
    const pitch = getMidiPitch(note.MIDI);
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

  /** Render a list of notes in a chord. */
  const renderBlock = (block: PatternMidiBlock, i: number) => {
    if (!clip || isPatternRest(block)) return null;
    return (
      <ul
        key={`${clip.id}-chord-${i}`}
        className={styles.chordClass}
        style={{ width: styles.chordWidth }}
        onClick={() => isSlicing && props.onCut(clip, clip.tick + i)}
      >
        {block.map((_, j) => renderNote(_, i, j))}
      </ul>
    );
  };

  /**
   * The name of the clip, which is derived from the name of the pattern.
   */
  const ClipName = (
    <span
      className={`${styles.cursor} ${styles.headerColor} flex items-center shrink-0 text-xs text-white/80 p-1 border-b border-b-white/20 whitespace-nowrap overflow-ellipsis select-none`}
      style={{ height: styles.nameHeight }}
    >
      {props.name}
    </span>
  );

  /**
   * The stream of notes in the clip, displayed like a piano roll.
   */
  const ClipStream = useMemo(
    () =>
      !!stream.length && (
        <div className="group w-full h-auto relative flex flex-grow font-extralight text-slate-50/80">
          {stream.map(renderBlock)}
        </div>
      ),
    [stream, renderBlock]
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
        props.onClick(e, clip, heldKeys.i)
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
