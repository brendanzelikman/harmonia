import { MouseEvent, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCellWidth,
  selectClipStream,
  selectTimeline,
} from "redux/selectors";
import { sliceClip } from "redux/thunks/clips";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clips";
import {
  getStreamTimelineNotes,
  PatternStream,
  TimelineNote,
} from "types/patterns";
import { Time } from "types/units";
import { ticksToColumns } from "appUtil";
import { MIDI } from "types/midi";
import { CELL_HEIGHT, TRANSFORM_HEIGHT } from "appConstants";

interface StreamProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: StreamProps) => {
  const { clip } = ownProps;
  const timeline = selectTimeline(state);
  const cellWidth = selectCellWidth(state);
  const slicingClip = timeline.state === "cutting";
  const stream = selectClipStream(state, clip.id);
  return {
    clip,
    slicingClip,
    cellWidth,
    stream: JSON.stringify(stream),
    subdivision: timeline.subdivision,
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
  const { clip, slicingClip, sliceClip, cellWidth, subdivision } = props;
  const stream = JSON.parse(props.stream) as PatternStream;
  const streamNotes = stream ? getStreamTimelineNotes(stream) : [];
  const midiPitches = stream
    .flat()
    .filter((n) => !MIDI.isRest(n))
    .map(({ MIDI }) => MIDI);
  const sortedNotes = Array.from(new Set(midiPitches.sort((a, b) => a - b)));

  const NAME_HEIGHT = 24;
  const margin = 8;
  const baseHeight = CELL_HEIGHT - TRANSFORM_HEIGHT - NAME_HEIGHT - margin;

  const noteCount = sortedNotes.length;
  const noteHeight = Math.min(25, baseHeight / noteCount);
  const noteOffset = (note: number) => sortedNotes.indexOf(note) * noteHeight;

  const onClipCut = useCallback(
    (index: number) => (e: MouseEvent) => {
      if (slicingClip) {
        e.stopPropagation();
        sliceClip(clip.id, clip.tick + index + 1);
      }
    },
    [clip, slicingClip]
  );

  const renderNote = useCallback(
    ({ MIDI, pitch, start, duration }: TimelineNote, i: number) => {
      const width = ticksToColumns(duration || 0, subdivision) * cellWidth - 2;
      return (
        <li
          key={i}
          className="absolute flex items-center justify-center shrink-0 rounded bg-sky-950/80 border border-slate-950/80"
          style={{
            width: `${width}px`,
            top: `${noteCount === 1 ? "25px" : ""}`,
            bottom: `${noteOffset(MIDI) + margin / 2}px`,
            height: `${noteHeight - 2}px`,
            left: ticksToColumns(start, subdivision) * cellWidth,
          }}
        >
          {width > 20 ? pitch : null}
        </li>
      );
    },
    [subdivision, cellWidth, noteCount, noteHeight, noteOffset]
  );

  const renderNotes = (notes: TimelineNote[], i: number) => (
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

  return (
    <div
      className="w-full h-auto relative flex flex-grow font-extralight text-slate-50/80"
      style={{
        fontSize: `${Math.min(12, noteHeight) - 4}px`,
      }}
    >
      {streamNotes.map(renderNotes)}
    </div>
  );
}