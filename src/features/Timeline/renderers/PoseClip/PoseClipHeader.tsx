import { GiCrystalWand } from "react-icons/gi";
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { selectClipName } from "types/Clip/ClipSelectors";
import { useAppValue } from "hooks/useRedux";
import { selectIsClipSelected } from "types/Timeline/TimelineSelectors";
import { PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseClipJSX } from "types/Arrangement/ArrangementClipSelectors";
import { MouseEvent, useCallback, useMemo, useState } from "react";
import { BsMagic } from "react-icons/bs";
import { useEvent } from "hooks/useEvent";
import { cancelEvent } from "utils/event";
import { dispatchCustomEvent } from "utils/event";

interface PoseClipHeaderProps {
  id: PoseClipId;
  isOpen: boolean;
}

export const PoseClipHeader = (props: PoseClipHeaderProps) => {
  const { id, isOpen } = props;
  const isSelected = useAppValue((_) => selectIsClipSelected(_, id));
  const name = useAppValue((_) => selectClipName(_, id));
  const jsx = useAppValue((_) => selectPoseClipJSX(_, id));
  const Icon = useMemo(() => (isOpen ? BsMagic : GiCrystalWand), [isOpen]);
  const [show, setShow] = useState(false);
  useEvent("showPoseVectors", (e) => setShow(e.detail));
  const onClick = useCallback(
    (e: MouseEvent) => {
      cancelEvent(e);
      dispatchCustomEvent("clipDropdown", { id });
    },
    [isSelected, isOpen, id]
  );
  return (
    <div
      data-selected={isSelected}
      data-open={isOpen}
      className="flex pl-[2px] py-[2px] rounded-t-md text-slate-100 items-center whitespace-nowrap cursor-pointer data-[selected=true]:ring-slate-100 hover:ring-2 hover:ring-fuchsia-300 data-[open=true]:w-full data-[open=true]:z-[32]"
      style={{ height: POSE_NOTCH_HEIGHT }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Icon
        onClick={onClick}
        className={`flex total-center shrink-0 ${isOpen ? "ml-1" : ""}`}
      />
      {isOpen && (
        <div className="px-2 ml-2 rounded h-full items-center flex bg-fuchsia-600">
          {name}
        </div>
      )}
      {(show || isOpen) && (
        <div
          data-open={isOpen}
          className="flex ml-1.5 gap-1 px-1 data-[open=false]:border data-[open=false]:border-slate-800/10  data-[open=false]:bg-slate-500/10 data-[open=false]:rounded data-[open=false]:-mt-1 pointer-events-auto"
        >
          {jsx}
        </div>
      )}
    </div>
  );
};
