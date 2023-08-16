import { MouseEvent, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { selectCellWidth, selectClipStream, selectRoot } from "redux/selectors";
import { sliceClip } from "redux/thunks/clips";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clips";
import { getStreamRhythmicPitches, PatternStream } from "types/patterns";
import { Time } from "types/units";

interface StreamProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: StreamProps) => {
  const { clip } = ownProps;
  const { timelineState } = selectRoot(state);
  const cellWidth = selectCellWidth(state);
  const slicingClip = timelineState === "cutting";
  const stream = selectClipStream(state, clip.id);
  return {
    clip,
    slicingClip,
    cellWidth,
    stream: JSON.stringify(stream),
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
  const { clip, slicingClip, sliceClip, cellWidth } = props;
  const stream = JSON.parse(props.stream) as PatternStream;
  const streamPitches = stream ? getStreamRhythmicPitches(stream) : [];

  const onClipCut = useCallback(
    (index: number) => (e: MouseEvent) => {
      if (slicingClip) {
        e.stopPropagation();
        sliceClip(clip.id, clip.startTime + index + 1);
      }
    },
    [clip, slicingClip]
  );

  return (
    <div
      className="w-full h-full flex flex-auto min-h-0 items-start text-slate-50/80 overflow-auto"
      style={{ fontSize: cellWidth / 2 - 5 }}
    >
      {streamPitches.map((pitches, i) => (
        <div
          key={`chord-${i}`}
          className={`flex h-full py-1 flex-col items-center justify-start border-r  ${
            slicingClip
              ? "hover:bg-slate-400/50 bg-slate-500/50 border-slate-50/50 hover:border-r-4 cursor-scissors"
              : "border-slate-50/10"
          }`}
          style={{ width: cellWidth }}
          onClick={onClipCut(i)}
        >
          {pitches.map((pitch, j) => {
            return (
              <span
                className="p-1 mb-1 flex items-center justify-center rounded-full bg-sky-950 border border-white/50"
                key={`note-${j}`}
                style={{
                  width: cellWidth - 4,
                  height: cellWidth - 4,
                }}
              >
                {pitch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
