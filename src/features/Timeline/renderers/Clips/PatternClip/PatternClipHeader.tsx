import { GiDoubleQuaver, GiMusicalScore } from "react-icons/gi";
import { useStore } from "types/hooks";
import { CLIP_NAME_HEIGHT } from "utils/constants";
import { memo, MouseEvent, useCallback } from "react";
import { PatternClipId } from "types/Clip/ClipTypes";
import {
  selectClipHeaderColor,
  selectClipName,
} from "types/Clip/ClipSelectors";
import { cancelEvent, dispatchCustomEvent } from "utils/html";

interface PatternClipHeaderProps {
  id: PatternClipId;
  isSelected: boolean;
  isOpen: boolean;
}

export const PatternClipHeader = memo((props: PatternClipHeaderProps) => {
  const { id, isSelected, isOpen } = props;
  const name = useStore((_) => selectClipName(_, props.id));
  const color = useStore((_) => selectClipHeaderColor(_, props.id));
  const Icon = isOpen ? GiMusicalScore : GiDoubleQuaver;
  const onClick = useCallback(
    (e: MouseEvent) => {
      if (e.altKey) return;
      if (isSelected || isOpen) cancelEvent(e);
      dispatchCustomEvent("clipDropdown", { id });
    },
    [id, isSelected, isOpen]
  );

  return (
    <div
      data-selected={isSelected}
      data-open={isOpen}
      className={`${color} data-[open=true]:z-50 data-[selected=true]:border-slate-100 border-teal-500 backdrop-blur rounded-t-md cursor-pointer rounded-b-none flex pl-1 gap-2 shrink-0 items-center overflow-hidden hover:ring hover:ring-teal-500 text-sm font-light text-white/80 whitespace-nowrap`}
      style={{ height: CLIP_NAME_HEIGHT }}
      onClick={onClick}
    >
      <Icon className="size-4 flex shrink-0 pointer-events-auto" />
      {name}
    </div>
  );
});
