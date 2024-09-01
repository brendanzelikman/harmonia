import classNames from "classnames";
import { clamp } from "lodash";
import { useProjectDispatch } from "types/hooks";
import { PatternClipMidiBlock, PatternClip } from "types/Clip/ClipTypes";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { cancelEvent } from "utils/html";
import { sliceClip } from "types/Clip/ClipThunks";
import { PatternClipNote } from "./PatternClipNote";
import { getTickColumns } from "utils/durations";
import { ClipStyle } from "./usePatternClipStyle";

export interface PatternClipBlockProps {
  block: PatternClipMidiBlock;
  blockIndex: number;
  clip: PatternClip;
  isSlicing: boolean;
  style: ClipStyle;
}

export const PatternClipBlock = (props: PatternClipBlockProps) => {
  const dispatch = useProjectDispatch();
  const { clip, block, blockIndex, isSlicing, style } = props;
  const {
    streamHeight,
    streamLength,
    streamRange,
    streamMin,
    cellWidth,
    subdivision,
    startTick,
    noteHeight,
    noteColor,
    endTick,
  } = style;

  const { notes, strumIndex } = block;

  // Get the width of the block based on the duration of its notes
  const tickCount = endTick - block.startTick;
  const blockDuration = getPatternBlockDuration(block.notes);
  const duration = clamp(blockDuration, 0, tickCount);
  // const width = duration * cellWidth;

  // Get the left of the block based on its starting tick
  const index = block.startTick - startTick;
  const blockLeft = getTickColumns(index, subdivision) * cellWidth;
  const blockEndTick = block.startTick + duration;
  const beforeLast = blockIndex < streamLength - 1;

  // Slice the block if appropriate
  const onClick = (e: React.MouseEvent) => {
    if (!isSlicing) return;
    cancelEvent(e);
    dispatch(sliceClip({ data: { id: clip.id, tick: blockEndTick } }));
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
      key={`${clip.id}-chord-${blockIndex}`}
      className={className}
      onClick={onClick}
      // style={{ width }}
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
          noteHeight={noteHeight}
          noteColor={noteColor}
          subdivision={subdivision}
        />
      ))}
    </div>
  );
};
