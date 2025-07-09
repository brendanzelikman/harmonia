import { cancelEvent } from "utils/event";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  selectCellsPerTick,
  selectIsSlicingClips,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { selectPortaledPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import {
  PatternClipMidiBlock,
  PortaledPatternClip,
} from "types/Clip/ClipTypes";
import { memo, useCallback } from "react";
import { sliceClip } from "types/Clip/ClipThunks";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { PatternMidiNote } from "types/Pattern/PatternTypes";
import {
  CLIP_NAME_HEIGHT,
  CLIP_STREAM_MARGIN,
  POSE_NOTCH_HEIGHT,
} from "utils/constants";
import { selectPortaledPatternClipRange } from "types/Arrangement/ArrangementClipSelectors";
import { getPatternClipTheme } from "types/Clip/PatternClip/PatternClipFunctions";

interface PatternClipStreamProps {
  clip: PortaledPatternClip;
}

export const PatternClipStream = memo((props: PatternClipStreamProps) => {
  const dispatch = useAppDispatch();
  const clipStream = useAppValue((_) =>
    selectPortaledPatternClipStream(_, props.clip.id)
  );
  const isSlicing = useAppValue(selectIsSlicingClips);
  const style = usePatternClipStreamStyle(props);

  /** Notes must calculate style before rendering */
  const renderNote = useCallback(
    (note: PatternMidiNote, j: number, noteTick: number) => {
      const key = `${note.MIDI}-${note.duration}-${note.velocity}-${j}`;
      const width = note.duration * style.noteWidth - 4;
      const height = style.noteHeight;
      const offset = note.MIDI - style.min;
      const bottom = height * offset + CLIP_STREAM_MARGIN / 2;
      const left = style.noteWidth * (noteTick - style.tick);
      const dims = { width, height, bottom, left };
      return <div key={key} style={dims} className={style.noteClass} />;
    },
    [style]
  );

  /** Blocks are containers of notes */
  const renderBlock = useCallback(
    (block: PatternClipMidiBlock, i: number) => {
      const notes = block.notes.filter((n) => "velocity" in n);
      return (
        <div
          key={`${block.startTick}-${i}`}
          data-slicing={isSlicing}
          className="size-full border-slate-50/10 data-[slicing=true]:bg-slate-500/50 group-hover:data-[slicing=true]:bg-slate-600/50 data-[slicing=true]:cursor-[url(/cursors/scissors.cur),_pointer] hover:data-[slicing=true]:border-r-4 hover:data-[slicing=true]:border-slate-50/50"
          onClick={(e) => {
            if (!isSlicing) return;
            cancelEvent(e);
            const tick = block.startTick + getPatternBlockDuration(notes);
            dispatch(sliceClip({ data: { id: props.clip.id, tick } }));
          }}
        >
          {notes.map((note, j) => renderNote(note, j, block.startTick))}
        </div>
      );
    },
    [renderNote, isSlicing]
  );

  return <div className={style.streamClass}>{clipStream.map(renderBlock)}</div>;
});

export const usePatternClipStreamStyle = (props: {
  clip: PortaledPatternClip;
}) => {
  const { clip } = props;
  const { id, trackId, duration, tick } = clip;
  const noteWidth = useAppValue(selectCellsPerTick);

  // Get the height of the stream based on the track
  const height =
    useAppValue((_) => selectTrackHeight(_, trackId)) - POSE_NOTCH_HEIGHT;
  const streamHeight = height - CLIP_NAME_HEIGHT - CLIP_STREAM_MARGIN;

  // Get the height of the note based on the range
  let { min, max } = useAppValue((_) => selectPortaledPatternClipRange(_, id));
  const streamRange = Math.max(max - min) + 1;
  let noteHeight = streamHeight / streamRange;

  // If the stream has one note, center it
  if (min === max) {
    noteHeight /= 2;
    min -= 0.5;
  }

  // Get the colors based on the clip theme
  const { noteColor, bodyColor } = getPatternClipTheme(clip);
  const streamClass = `group size-full relative flex overflow-hidden ${bodyColor}`;
  const noteClass = `absolute border border-slate-950/80 opacity-80 rounded ${noteColor}`;

  return { streamClass, noteClass, duration, tick, min, noteWidth, noteHeight };
};
