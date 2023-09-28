import { MouseEvent, useCallback, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCellHeight,
  selectCellWidth,
  selectClipStream,
  selectTimeline,
} from "redux/selectors";
import { sliceClip } from "redux/thunks/clips";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId, getClipTheme } from "types/clip";
import {
  getStreamMidiNotes,
  getStreamTimelineNotes,
  TimelineNote,
} from "types/pattern";
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
  const streamNotes = getStreamTimelineNotes(stream);
  const midiNotes = getStreamMidiNotes(stream);
  const streamString = JSON.stringify(streamNotes);
  const midiString = JSON.stringify(midiNotes);
  // CSS Properties
  const cellWidth = selectCellWidth(state);
  const cellHeight = selectCellHeight(state);
  const margin = 8;
  const nameHeight = 24;
  const height = cellHeight - TRANSPOSITION_HEIGHT - nameHeight - margin;

  // Note properties
  const { noteColor } = getClipTheme(clip);
  const noteCount = midiNotes.length;
  const noteHeight = Math.min(25, height / noteCount);
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
  const { noteHeight, noteColor, noteCount, margin } = props;
  const { streamString, midiString } = props;
  const streamNotes = useMemo(() => JSON.parse(streamString), [streamString]);
  const midiNotes = useMemo(() => JSON.parse(midiString), [midiString]);
  const noteOffset = useCallback(
    (note: number) => midiNotes.indexOf(note) * noteHeight,
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
    (note: TimelineNote, i: number) => {
      const columns = ticksToColumns(note.duration || 0, subdivision);
      const width = columns * cellWidth - 2;
      const height = noteHeight - 2;
      const top = noteCount === 1 ? "25px" : "";
      const bottom = `${noteOffset(note.MIDI) + margin / 2}px`;
      const left = ticksToColumns(note.start, subdivision) * cellWidth;
      const opacity =
        percentOfRange(
          note.velocity ?? MIDI.DefaultVelocity,
          MIDI.MinVelocity,
          MIDI.MaxVelocity
        ) / 100;
      return (
        <li
          key={i}
          className={`absolute flex items-center justify-center shrink-0 rounded ${noteColor} border border-slate-950/80`}
          style={{ width, height, left, top, bottom, opacity }}
        >
          {width > 20 && noteHeight > 8 ? note.pitch : null}
        </li>
      );
    },
    [subdivision, cellWidth, noteCount, noteColor, noteHeight, noteOffset]
  );

  // Render a list of notes
  const renderNotes = useCallback(
    (notes: TimelineNote[], i: number) => {
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
          {notes.map(renderNote)}
        </ul>
      );
    },
    [cellWidth, slicingClip, onClipCut, renderNote]
  );

  return (
    <div
      className="w-full h-auto relative flex flex-grow font-extralight text-slate-50/80"
      style={{ fontSize: `${Math.min(12, noteHeight) - 4}px` }}
    >
      {streamNotes.map(renderNotes)}
    </div>
  );
}
