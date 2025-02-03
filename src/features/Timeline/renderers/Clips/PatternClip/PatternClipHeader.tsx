import { GiDoubleQuaver, GiMusicalScore, GiMusicSpell } from "react-icons/gi";
import { selectPatternName } from "types/Pattern/PatternSelectors";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { getPatternClipHeaderColor } from "types/Clip/PatternClip/PatternClipFunctions";
import classNames from "classnames";
import {
  CLIP_NAME_HEIGHT,
  PatternClipRendererProps,
} from "./usePatternClipRenderer";
import { memo, useMemo } from "react";
import {
  selectIsClipLive,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import { selectPatternClipById } from "types/Clip/ClipSelectors";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { cancelEvent } from "utils/html";
import { toggleClipIdInSelection } from "types/Timeline/thunks/TimelineSelectionThunks";

interface PatternClipHeaderProps extends PatternClipRendererProps {}

export const PatternClipHeader = memo(_PatternClipHeader, (prev, next) => {
  return prev.id === next.id;
});

export function _PatternClipHeader(props: PatternClipHeaderProps) {
  const { id } = props;
  const dispatch = useProjectDispatch();
  const clip = useDeep((_) => selectPatternClipById(_, id));
  const isOpen = !!clip?.isOpen;
  const isLive = use((_) => selectIsClipLive(_, id));
  const isSelected = use((_) => selectIsClipSelected(_, id));

  // Each pattern clip shows the name of its pattern
  const name = use((_) => selectPatternName(_, clip?.patternId));

  // Each pattern clip has an icon that shows its state
  const Icon = useMemo(() => {
    const iconClass = "size-4 flex shrink-0 pointer-events-auto";
    if (isLive) return <GiMusicSpell className={iconClass} />;
    if (isOpen) return <GiMusicalScore className={iconClass} />;
    return <GiDoubleQuaver className={iconClass} />;
  }, [isLive, isOpen]);

  // Render the header with a constant height
  if (!clip) return null;
  const headerColor = getPatternClipHeaderColor(clip);
  return (
    <div
      className={classNames(
        `${headerColor} backdrop-blur rounded-t-md rounded-b-none`,
        "flex pl-1 gap-2 shrink-0 items-center overflow-hidden",
        "text-sm font-light text-white/80 whitespace-nowrap",
        isOpen ? "border-2 border-b-0" : "",
        isSelected ? "border-slate-100" : "border-teal-500"
      )}
      style={{ height: CLIP_NAME_HEIGHT }}
      onClick={(e) => {
        cancelEvent(e);
        if (!e.altKey) {
          dispatch(toggleClipDropdown({ data: { id } }));
          if (!isSelected && !clip.isOpen)
            dispatch(toggleClipIdInSelection(id));
        } else {
          dispatch(toggleClipIdInSelection(id));
        }
      }}
    >
      {Icon}
      <span>{name}</span>
    </div>
  );
}
