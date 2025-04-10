import { PoseClip } from "types/Clip/ClipTypes";
import { useSelect } from "hooks/useStore";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import { POSE_NOTCH_HEIGHT } from "utils/constants";
import { cancelEvent } from "utils/html";
import { PoseClipVector } from "./PoseClipVector";
import classNames from "classnames";
import { PoseClipComponentProps } from "./usePoseClipRenderer";

export interface PoseClipDropdownEffectProps extends PoseClipComponentProps {
  clip: PoseClip;
}

export const PoseClipDropdown = (props: PoseClipDropdownEffectProps) => {
  const { clip, block } = props;
  const cellHeight = useSelect(selectCellHeight);
  return (
    <div
      style={{
        top: POSE_NOTCH_HEIGHT,
        height: cellHeight - POSE_NOTCH_HEIGHT + 1,
      }}
      className={`z-20 animate-in h-full max-h-[7.5rem] fade-in ease-in p-1 rounded flex flex-1 gap-1 bg-slate-800 border-4 border-fuchsia-500 cursor-auto`}
      onClick={cancelEvent}
      draggable
      onDragStart={cancelEvent}
    >
      <PoseClipVector {...props} clip={clip} block={block} />
    </div>
  );
};

export const PoseClipDropdownContainer = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div
      {...props}
      className="flex flex-col capitalize gap-0.5 relative size-full whitespace-nowrap"
    />
  );
};

export const PoseClipDropdownItem = (
  props: React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean;
    disabled?: boolean;
    background?: string;
  }
) => {
  const { active, disabled, background, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames(
        className,
        active ? "text-fuchsia-400" : "text-slate-200",
        background ? background : "bg-slate-700/50",
        disabled ? "cursor-default" : "cursor-pointer",
        "rounded text-center font-bold"
      )}
    />
  );
};
