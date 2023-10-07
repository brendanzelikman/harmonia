import { MouseEvent, useCallback, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCellHeight,
  selectCellWidth,
  selectClipStream,
  selectTimeline,
} from "redux/selectors";
import { sliceClip } from "redux/Clip";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId, getClipTheme } from "types/Clip";
import { PatternNote, getPatternStreamNoteSet } from "types/Pattern";
import { Time } from "types/units";
import { percentOfRange, ticksToColumns } from "utils";
import { MIDI } from "types/midi";
import { TRANSPOSITION_HEIGHT } from "appConstants";

interface StreamProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: StreamProps) => {
  const { clip } = ownProps;
  const timeline = selectTimeline(state);
  const { subdivision } = timeline;
  const slicingClip = timeline.state === "cutting";

  // Stream properties
  const stream = selectClipStream(state, clip.id);
  const streamString = JSON.stringify(stream);
  const midiNotes = getPatternStreamNoteSet(stream);

  // CSS Properties
  const cellWidth = selectCellWidth(state);
  const cellHeight = selectCellHeight(state);
  const margin = 8;
  const nameHeight = 24;
  const height = cellHeight - TRANSPOSITION_HEIGHT - nameHeight - margin;

  // Note properties
  const minNote = midiNotes.length ? Math.min(...midiNotes) : 0;
  const maxNote = midiNotes.length ? Math.max(...midiNotes) : 0;
  const noteCount = maxNote - minNote + 1;
  const filledNotes = new Array(noteCount).fill(0).map((_, i) => i + minNote);
  const midiString = JSON.stringify(filledNotes);
  const noteHeight = Math.min(25, height / noteCount);
  const { noteColor } = getClipTheme(clip);
  const fontSize = Math.min(12, noteHeight) - 4;

  return {
    clip,
    streamString,
    midiString,
    subdivision,
    slicingClip,
    cellWidth,
    margin,
    noteColor,
    noteCount,
    noteHeight,
    fontSize,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  sliceClip: (clipId: ClipId, time: Time) => {
    dispatch(sliceClip(clipId, time));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Stream);

function Stream(props: Props) {
  const { clip, slicingClip, sliceClip, subdivision, cellWidth } = props;
  const { noteHeight, noteColor, noteCount, margin, fontSize } = props;
  const { midiString, streamString } = props;

  // Unpack the stringified notes
  const streamNotes = useMemo(() => JSON.parse(streamString), [streamString]);
  const midiNotes = useMemo(() => JSON.parse(midiString), [midiString]);

  // Get the offset of a note in pixels
  const noteOffset = useCallback(
    (note: number) =>
      (midiNotes.length - 1) * noteHeight -
      midiNotes.indexOf(note) * noteHeight,
    [midiNotes, noteHeight]
  );

  // Cut the clip at a tick
  const onClipCut = useCallback(
    (index: number) => (e: MouseEvent) => {
      if (slicingClip) {
        e.stopPropagation();
        sliceClip(clip.id, clip.tick + index + 1);
      }
    },
    [clip, slicingClip]
  );

  // Render a single note
  const renderNote = useCallback(
    (note: PatternNote, i: number, j: number) => {
      const pitch = MIDI.toPitch(note.MIDI);
      const columns = ticksToColumns(note.duration || 0, subdivision);

      const top = noteCount === 1 ? 25 : noteOffset(note.MIDI) + margin / 2;
      const left = ticksToColumns(i, subdivision) * cellWidth;
      const width = columns * cellWidth - 2;
      const height = noteHeight - 2;

      const opacity =
        percentOfRange(
          note.velocity ?? MIDI.DefaultVelocity,
          MIDI.MinVelocity,
          MIDI.MaxVelocity
        ) / 100;

      if (MIDI.isRest(note.MIDI)) return null;
      return (
        <li
          key={j}
          className={`absolute flex items-center justify-center shrink-0 rounded ${noteColor} border border-slate-950/80`}
          style={{ width, height, left, top, opacity }}
        >
          {width > 20 && noteHeight > 8 ? pitch : null}
        </li>
      );
    },
    [subdivision, cellWidth, noteCount, noteColor, noteHeight, noteOffset]
  );

  // Render a list of notes
  const renderNotes = useCallback(
    (notes: PatternNote[], i: number) => {
      return (
        <ul
          key={`chord-${i}`}
          className={`${
            slicingClip
              ? "hover:bg-slate-400/50 bg-slate-500/50 border-slate-50/50 hover:border-r-4 cursor-scissors"
              : "border-slate-50/10"
          }`}
          style={{ width: cellWidth }}
          onClick={onClipCut(i)}
        >
          {notes.map((note, j) => renderNote(note, i, j))}
        </ul>
      );
    },
    [cellWidth, slicingClip, onClipCut, renderNote]
  );

  return (
    <div
      className="w-full h-auto relative flex flex-grow font-extralight text-slate-50/80"
      style={{ fontSize }}
    >
      {streamNotes.map(renderNotes)}
    </div>
  );
}
