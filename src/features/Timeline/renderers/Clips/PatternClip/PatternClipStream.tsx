import { cancelEvent } from "utils/html";
import { PatternClipBlock } from "./PatternClipBlock";
import { useCallback } from "react";
import { useDeep } from "types/hooks";
import { selectPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import {
  CLIP_NAME_HEIGHT,
  PatternClipRendererProps,
} from "./usePatternClipRenderer";
import { ClipStyle } from "./usePatternClipStyle";
import classNames from "classnames";

interface PatternClipStreamProps extends PatternClipRendererProps {
  style: ClipStyle;
  showScore: boolean;
}

export const PatternClipStream = (props: PatternClipStreamProps) => {
  const { clip, portaledClip, isSlicing, isSelected, style, showScore } = props;
  const pcId = portaledClip.id;
  const stream = useDeep((_) => selectPatternClipStream(_, pcId));

  // Memoized pattern clip stream
  const PatternClipBlocks = useCallback(() => {
    return (
      <div className="group w-full relative flex flex-1 font-extralight text-slate-50/80">
        {stream.map((block, i) => (
          <PatternClipBlock
            key={`${clip.id}-block-${i}`}
            clip={clip}
            block={block}
            blockIndex={i}
            isSlicing={isSlicing}
            style={style}
          />
        ))}
      </div>
    );
  }, [clip, style, stream, isSlicing]);

  return (
    <div
      className={classNames(
        style.bodyColor,
        `w-full pt-0.5 overflow-hidden flex flex-col`,
        isSelected ? "border-white" : "border-teal-500",
        showScore ? "border-2 border-b-0" : "border-0"
      )}
      onDoubleClick={cancelEvent}
      style={{ minHeight: style.height - CLIP_NAME_HEIGHT - 4 }}
    >
      <PatternClipBlocks />
    </div>
  );
};
