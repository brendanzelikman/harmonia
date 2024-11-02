import { cancelEvent } from "utils/html";
import { CLIP_NAME_HEIGHT } from "./usePatternClipRenderer";
import { ClipStyle } from "./usePatternClipStyle";
import classNames from "classnames";
import { PatternClipBlock } from "./PatternClipBlock";
import { use, useDeep } from "types/hooks";
import { selectIsClipSelected } from "types/Timeline/TimelineSelectors";
import { selectPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import { PatternClipId, PortaledPatternClipId } from "types/Clip/ClipTypes";
import { selectPatternClipById } from "types/Clip/ClipSelectors";

interface PatternClipStreamProps extends ClipStyle {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
  isSlicing: boolean;
}

export const PatternClipStream = (props: PatternClipStreamProps) => {
  const { id, width, height, bodyColor } = props;
  const isSelected = use((_) => selectIsClipSelected(_, props.id));
  const clipStream = useDeep((_) => selectPatternClipStream(_, props.pcId));
  const clip = useDeep((_) => selectPatternClipById(_, props.pcId));
  return (
    <div
      className={classNames(
        bodyColor,
        `w-full relative flex flex-col`,
        isSelected ? "border-white" : "border-teal-500",
        !!clip?.isOpen ? "border-2 border-b-0" : "border-0"
      )}
      onDoubleClick={cancelEvent}
      style={{ minHeight: height - CLIP_NAME_HEIGHT - 4 }}
    >
      {!!clip?.isOpen && (
        <div className="size-full absolute" style={{ paddingLeft: width }}>
          <div className="size-full relative border-l-2 border-l-slate-300/50">
            <div className="size-full relative flex-1 bg-teal-950/5"></div>
          </div>
        </div>
      )}

      <div className="group w-full py-1 relative flex flex-1 font-extralight text-slate-50/80">
        {clipStream.map((block, i) => {
          return (
            <PatternClipBlock
              key={`${props.pcId}-block-${i}`}
              id={id}
              block={block}
              blockIndex={i}
              isSlicing={props.isSlicing}
              style={props}
            />
          );
        })}
      </div>
    </div>
  );
};
