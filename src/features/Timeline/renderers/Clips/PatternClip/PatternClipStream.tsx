import { cancelEvent } from "utils/html";
import { PatternClipBlock } from "./PatternClipBlock";
import { useCallback } from "react";
import { use, useDeep } from "types/hooks";
import {
  selectPatternClipStream,
  selectPortaledClipDuration,
  selectPortaledClipStyle,
} from "types/Arrangement/ArrangementSelectors";
import {
  CLIP_NAME_HEIGHT,
  PatternClipRendererProps,
} from "../PatternClipRenderer";
import { PatternClipMidiStream } from "types/Clip/ClipTypes";

interface PatternClipStreamProps extends PatternClipRendererProps {}

export const PatternClipStream = (props: PatternClipStreamProps) => {
  const { clip, portaledClip, isSlicing, isSelected } = props;
  const pcId = portaledClip.id;
  const stream = useDeep((_) => selectPatternClipStream(_, pcId));

  // Each pattern clip has its style computed outside of the component
  const style = useDeep((_) => selectPortaledClipStyle(_, portaledClip.id));
  const { bodyColor } = style;

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
            {...style}
          />
        ))}
      </div>
    );
  }, [clip, style, stream, isSlicing]);

  return (
    <div
      className={`${bodyColor} pt-0.5 rounded-b-md overflow-hidden flex flex-col ${
        isSelected ? "border-white" : "border-teal-500"
      }`}
      onDoubleClick={cancelEvent}
      style={{ minHeight: style.height - CLIP_NAME_HEIGHT - 4 }}
    >
      <PatternClipBlocks />
    </div>
  );
};
