import classNames from "classnames";
import { clamp } from "lodash";
import { useProjectDispatch } from "types/hooks";
import {
  PatternClipMidiBlock,
  PatternClip,
  PatternClipId,
} from "types/Clip/ClipTypes";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { cancelEvent } from "utils/html";
import { sliceClip } from "types/Clip/ClipThunks";
import { PatternClipNote } from "./PatternClipNote";
import { getTickColumns } from "utils/durations";
import { ClipStyle } from "./usePatternClipStyle";
import { useCallback, useMemo } from "react";
import { PatternMidiNote } from "types/Pattern/PatternTypes";

export interface PatternClipBlockProps {
  id: PatternClipId;
  block: PatternClipMidiBlock;
  blockIndex: number;
  isSlicing: boolean;
  style: ClipStyle;
}

export const PatternClipBlock = (props: PatternClipBlockProps) => {
  const dispatch = useProjectDispatch();
  const { id, block, blockIndex, isSlicing, style } = props;
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
  const tickCount = endTick - block.startTick;

  const blockPosition = useMemo(() => {
    // Get the width of the block based on the duration of its notes
    const blockDuration = getPatternBlockDuration(block.notes);
    const duration = clamp(blockDuration, 0, tickCount);

    // Get the left of the block based on its starting tick
    const index = block.startTick - startTick;
    const blockLeft = getTickColumns(index, subdivision) * cellWidth;
    const blockEndTick = block.startTick + duration;
    const beforeLast = blockIndex < streamLength - 1;

    return { index, duration, blockLeft, blockEndTick, beforeLast };
  }, [block, startTick, cellWidth, tickCount, subdivision]);

  const renderNote = useCallback(
    (note: PatternMidiNote, j: number) => (
      <PatternClipNote
        key={`${note}-${blockIndex}-${j}`}
        keyString={`${note}-${blockIndex}-${j}`}
        note={note}
        blockLeft={blockPosition.blockLeft}
        streamHeight={streamHeight}
        streamRange={streamRange}
        streamMin={streamMin}
        cellWidth={cellWidth}
        noteHeight={noteHeight}
        noteColor={noteColor}
      />
    ),
    [
      blockPosition,
      streamHeight,
      streamRange,
      streamMin,
      cellWidth,
      noteHeight,
      noteColor,
    ]
  );

  return (
    <div
      key={`${id}-chord-${blockIndex}`}
      className={classNames(
        "w-full",
        isSlicing
          ? "bg-slate-500/50 group-hover:bg-slate-600/50 cursor-scissors overflow-hidden"
          : "border-slate-50/10",
        {
          "hover:border-r-4 border-slate-50/50":
            isSlicing && blockPosition.beforeLast,
        }
      )}
      onClick={(e) => {
        if (!isSlicing) return;
        cancelEvent(e);
        dispatch(sliceClip({ data: { id, tick: blockPosition.blockEndTick } }));
      }}
    >
      {notes.map(renderNote)}
    </div>
  );
};
