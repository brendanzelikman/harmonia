import { cancelEvent } from "utils/event";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectIsSlicingClips } from "types/Timeline/TimelineSelectors";
import { selectPortaledPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import {
  PatternClipMidiBlock,
  PortaledPatternClip,
} from "types/Clip/ClipTypes";
import { memo, useCallback } from "react";
import { sliceClip } from "types/Clip/ClipThunks";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { PatternMidiNote } from "types/Pattern/PatternTypes";
import { usePatternClipStreamStyle } from "./usePatternClipStyle";
import { CLIP_STREAM_MARGIN } from "utils/constants";

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
      const bottom = style.noteHeight * offset + CLIP_STREAM_MARGIN / 2;
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
          className="size-full border-slate-50/10 data-[slicing=true]:bg-slate-500/50 group-hover:data-[slicing=true]:bg-slate-600/50 data-[slicing=true]:cursor-scissors hover:data-[slicing=true]:border-r-4 hover:data-[slicing=true]:border-slate-50/50"
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
