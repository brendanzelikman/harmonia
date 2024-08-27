import classNames from "classnames";
import { clamp } from "lodash";
import { useProjectDispatch } from "types/hooks";
import { PatternClipMidiBlock, PatternClip } from "types/Clip/ClipTypes";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { cancelEvent } from "utils/html";
import { sliceClip } from "types/Clip/ClipThunks";
import { PatternClipNote } from "./PatternClipNote";
import { ClipStyle } from "types/Arrangement/ArrangementSelectors";
import { getTickColumns } from "utils/durations";

export interface PatternClipBlockProps extends ClipStyle {
  block: PatternClipMidiBlock;
  blockIndex: number;
  clip: PatternClip;
  endTick: number;
  isSlicing: boolean;
}

export const PatternClipBlock = (props: PatternClipBlockProps) => {
  const dispatch = useProjectDispatch();
  const { id, block, blockIndex, isSlicing } = props;
  const { streamHeight, streamLength, streamRange, streamMin } = props;
  const { cellWidth, subdivision } = props;
  const { notes, strumIndex } = block;

  // Get the width of the block based on the duration of its notes
  const tickCount = props.endTick - block.startTick;
  const blockDuration = getPatternBlockDuration(block.notes);
  const duration = clamp(blockDuration, 0, tickCount);
  const width = duration * cellWidth;

  // Get the left of the block based on its starting tick
  const index = block.startTick - props.startTick;
  const blockLeft = getTickColumns(index, subdivision) * cellWidth;
  const blockEndTick = block.startTick + duration;
  const beforeLast = blockIndex < streamLength - 1;

  // Slice the block if appropriate
  const onClick = (e: React.MouseEvent) => {
    if (!isSlicing) return;
    cancelEvent(e);
    dispatch(sliceClip({ data: { id, tick: blockEndTick } }));
  };

  // Compile the classname
  const className = classNames(
    { "bg-slate-500/50 group-hover:bg-slate-600/50": isSlicing },
    { "cursor-scissors overflow-hidden": isSlicing },
    { "border-slate-50/10": !isSlicing },
    { "hover:border-r-4 border-slate-50/50": isSlicing && beforeLast }
  );

  return (
    <div
      key={`${id}-chord-${blockIndex}`}
      className={className}
      style={{ width }}
      onClick={onClick}
    >
      {notes.map((note, j) => (
        <PatternClipNote
          key={`${note}-${index}-${j}`}
          note={note}
          clipIndex={index}
          blockLeft={blockLeft}
          chordIndex={Math.max(j, strumIndex ?? 0)}
          streamHeight={streamHeight}
          streamRange={streamRange}
          streamMin={streamMin}
          cellWidth={cellWidth}
          noteHeight={props.noteHeight}
          noteColor={props.noteColor}
          subdivision={subdivision}
        />
      ))}
    </div>
  );
};
