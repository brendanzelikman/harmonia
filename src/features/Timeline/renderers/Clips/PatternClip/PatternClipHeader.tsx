import { GiDoubleQuaver, GiMusicalScore, GiMusicSpell } from "react-icons/gi";
import { selectPatternName } from "types/Pattern/PatternSelectors";
import { use } from "types/hooks";
import { getPatternClipHeaderColor } from "types/Clip/PatternClip/PatternClipFunctions";
import classNames from "classnames";
import {
  CLIP_NAME_HEIGHT,
  PatternClipRendererProps,
} from "./usePatternClipRenderer";
import { useMemo } from "react";
import {
  selectIsClipLive,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import { PatternClip } from "types/Clip/ClipTypes";

interface PatternClipHeaderProps extends PatternClipRendererProps {
  clip: PatternClip;
}

export const PatternClipHeader = (props: PatternClipHeaderProps) => {
  const { id, clip } = props;
  const isOpen = clip.isOpen;
  const isLive = use((_) => selectIsClipLive(_, id));
  const isSelected = use((_) => selectIsClipSelected(_, id));
  const headerColor = getPatternClipHeaderColor(clip);

  // Each pattern clip shows the name of its pattern
  const name = use((_) => selectPatternName(_, clip.patternId));

  // Each pattern clip has an icon that shows its state
  const Icon = useMemo(() => {
    const iconClass = "size-4 flex shrink-0 pointer-events-auto";
    if (isLive) return <GiMusicSpell className={iconClass} />;
    if (isOpen) return <GiMusicalScore className={iconClass} />;
    return <GiDoubleQuaver className={iconClass} />;
  }, [isLive, isOpen]);

  // Render the header with a constant height
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
    >
      {Icon}
      <span>{name}</span>
    </div>
  );
};
