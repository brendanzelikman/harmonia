import { GiCrystalWand } from "react-icons/gi";
import { POSE_HEIGHT } from "utils/constants";
import { selectClipName } from "types/Clip/ClipSelectors";
import { useDeep, useProjectDispatch } from "types/hooks";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { selectIsClipSelected } from "types/Timeline/TimelineSelectors";
import { PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseClipJSX } from "types/Arrangement/ArrangementClipSelectors";
import { useMemo, useState } from "react";
import { BsMagic } from "react-icons/bs";
import { useCustomEventListener } from "hooks/useCustomEventListener";

interface PoseClipHeaderProps {
  id: PoseClipId;
  isOpen: boolean;
}

export const PoseClipHeader = (props: PoseClipHeaderProps) => {
  const { id, isOpen } = props;
  const dispatch = useProjectDispatch();
  const isSelected = useDeep((_) => selectIsClipSelected(_, id));
  const name = useDeep((_) => selectClipName(_, id));
  const jsx = useDeep((_) => selectPoseClipJSX(_, id));
  const Icon = useMemo(() => (isOpen ? BsMagic : GiCrystalWand), [isOpen]);
  const [show, setShow] = useState(false);
  useCustomEventListener("showPoseVectors", (e) => setShow(e.detail));
  return (
    <div
      data-selected={isSelected}
      data-open={isOpen}
      className="flex pl-0.5 py-0.5 rounded-t-md text-slate-100 items-center whitespace-nowrap font-nunito cursor-pointer data-[selected=true]:ring-slate-100 hover:ring-2 hover:ring-fuchsia-300 data-[open=true]:w-full data-[open=true]:z-[32]"
      style={{ height: POSE_HEIGHT }}
      onClick={(e) => {
        if (e.altKey) {
          setShow((prev) => !prev);
          return;
        }
        dispatch(toggleClipDropdown({ data: { id } }));
      }}
    >
      <Icon
        className={`size-4 flex total-center shrink-0 ${isOpen ? "ml-1" : ""}`}
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
