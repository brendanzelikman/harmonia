import { MIN_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { normalize } from "utils/math";
import { PatternMidiNote } from "types/Pattern/PatternTypes";
import { selectTickColumns } from "types/Timeline/TimelineSelectors";
import { use } from "types/hooks";
import { useMemo } from "react";

export interface ClipNoteProps {
  note: PatternMidiNote;
  keyString: string;
  blockLeft: number;
  cellWidth: number;
  streamHeight: number;
  streamRange: number;
  streamMin: number;
  noteHeight: number;
  noteColor: string;
}

export const PatternClipNote = (props: ClipNoteProps) => {
  const { note, cellWidth } = props;
  const { streamHeight, streamRange, streamMin, noteColor } = props;
  const columns = use((_) => selectTickColumns(_, note.duration));
  const left = props.blockLeft;
  const height = props.noteHeight;

  const { width, top, opacity } = useMemo(() => {
    const isSingle = streamRange === 1;
    const width = columns * cellWidth - 4;
    const offset = normalize(note.MIDI, streamMin + streamRange, streamMin);
    const top = Math.round((streamHeight - height) * (isSingle ? 0.5 : offset));
    const opacity = normalize(note.velocity, MIN_VELOCITY, MAX_VELOCITY);
    return { width, top, opacity };
  }, [columns, cellWidth, streamHeight, streamMin, streamRange, note, height]);

  // Return the note
  return (
    <div
      key={props.keyString}
      style={{ top, left, width, height, opacity }}
      className={`${noteColor} absolute border border-slate-950/80 rounded`}
    />
  );
};
