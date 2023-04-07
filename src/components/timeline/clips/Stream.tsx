import { CELL_WIDTH } from "appConstants";
import { MouseEvent, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { selectClipStream, selectRoot } from "redux/selectors";
import { cutClip } from "redux/slices/clips";
import { toggleCuttingClip } from "redux/slices/root";
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
  const cuttingClip = timelineState === "cutting";
  const stream = selectClipStream(state, clip.id);
  return {
    clip,
    cuttingClip,
    stream: JSON.stringify(stream),
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  cutClip: (clipId: ClipId, time: Time) => {
    dispatch(cutClip(clipId, time));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Stream);

function Stream(props: Props) {
  const { clip, cuttingClip, cutClip } = props;
  const stream = JSON.parse(props.stream) as PatternStream;
  const streamPitches = stream ? getStreamRhythmicPitches(stream) : [];

  const onClipCut = useCallback(
    (index: number) => (e: MouseEvent) => {
      if (cuttingClip) {
        e.stopPropagation();
        cutClip(clip.id, clip.startTime + index + 1);
      }
    },
    [clip, cuttingClip]
  );

  return (
    <div className="w-full flex flex-auto min-h-0 items-start text-[10px] text-slate-50/80 overflow-auto">
      {streamPitches.map((pitches, i) => (
        <div
          key={`chord-${i}`}
          className={`flex h-full py-1 flex-col items-center justify-start border-r  ${
            cuttingClip
              ? "hover:bg-slate-400/50 bg-slate-500/50 border-slate-50/50 hover:border-r-4 cursor-scissors"
              : "border-slate-50/10"
          }`}
          style={{ width: CELL_WIDTH }}
          onClick={onClipCut(i)}
        >
          {pitches.map((pitch, j) => {
            return (
              <span
                className="p-1 mb-1 flex items-center justify-center rounded-full w-5 h-5 bg-slate-800 border border-white/50"
                key={`note-${j}`}
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
