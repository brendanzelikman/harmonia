import { MIN_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { getTickColumns, Subdivision } from "utils/durations";
import { normalize } from "utils/math";
import { getMidiPitch } from "utils/midi";
import { PatternMidiNote } from "types/Pattern/PatternTypes";

export interface ClipNoteProps {
  note: PatternMidiNote;
  clipIndex: number;
  chordIndex: number;
  blockLeft: number;
  cellWidth: number;
  streamHeight: number;
  streamRange: number;
  streamMin: number;
  noteHeight: number;
  noteColor: string;
  subdivision: Subdivision;
}

export const PatternClipNote = (props: ClipNoteProps) => {
  const { note, clipIndex, chordIndex, subdivision, cellWidth } = props;
  const { streamHeight, streamRange, streamMin, noteColor } = props;
  const { MIDI, duration, velocity } = note;
  const height = props.noteHeight;
  const left = props.blockLeft;

  // Get the width of the note from its duration
  const columns = getTickColumns(duration, subdivision);
  const width = columns * cellWidth - 4;

  // Get the top of the note based on its pitch relative to the stream
  const offset = normalize(MIDI, streamMin + streamRange, streamMin);
  const isSingle = streamRange === 1;
  const top = Math.round((streamHeight - height) * (isSingle ? 0.5 : offset));

  // Get the opacity of the note from its velocity
  const opacity = normalize(velocity, MIN_VELOCITY, MAX_VELOCITY);

  // Show the pitch if the note is large enough
  const pitch = getMidiPitch(MIDI);
  const shouldShowPitch = width > 20 && height > 5;

  // Return the note
  return (
    <li
      key={`${note}-${clipIndex}-${chordIndex}`}
      style={{ top, left, width, height, opacity }}
      className={`${noteColor} absolute flex total-center shrink-0 border border-slate-950/80 rounded transition-all duration-200`}
    >
      {shouldShowPitch ? pitch : null}
    </li>
  );
};
