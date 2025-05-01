import { GiMusicalNotes, GiPencil } from "react-icons/gi";
import { useAppValue } from "hooks/useRedux";
import { CLIP_NAME_HEIGHT } from "utils/constants";
import { memo } from "react";
import { PatternClipId } from "types/Clip/ClipTypes";
import {
  selectClipHeaderColor,
  selectClipName,
} from "types/Clip/ClipSelectors";

interface PatternClipHeaderProps {
  id: PatternClipId;
  isSelected: boolean;
  isOpen: boolean;
}

export const PatternClipHeader = memo((props: PatternClipHeaderProps) => {
  const { isSelected, isOpen } = props;
  const name = useAppValue((_) => selectClipName(_, props.id));
  const color = useAppValue((_) => selectClipHeaderColor(_, props.id));
  const Icon = isOpen ? GiPencil : GiMusicalNotes;
  return (
    <div
      data-selected={isSelected}
      data-open={isOpen}
      className={`${color} select-none data-[open=true]:z-50 data-[open=true]:min-w-[600px] pr-2 data-[selected=true]:border-slate-100 border-teal-500 backdrop-blur rounded-t-md rounded-b-none flex pl-1 gap-2 shrink-0 items-center overflow-hidden hover:ring-3 hover:ring-teal-500 text-sm font-light text-white/80 whitespace-nowrap`}
      style={{ height: CLIP_NAME_HEIGHT }}
    >
      <Icon className="flex shrink-0" />
      {name}
    </div>
  );
});
