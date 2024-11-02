import { PoseClip } from "types/Clip/ClipTypes";
import { use, useProjectDispatch } from "types/hooks";
import {
  selectCellHeight,
  selectIsClipLive,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import { POSE_HEIGHT } from "utils/constants";
import { cancelEvent } from "utils/html";
import { PoseClipVector } from "./PoseClipVector";
import classNames from "classnames";
import { PoseClipStream } from "./PoseClipStream";
import { updatePoseBlock } from "types/Pose/PoseSlice";
import { useEffect } from "react";
import { PoseClipComponentProps } from "./usePoseClipRenderer";

export interface PoseClipDropdownEffectProps extends PoseClipComponentProps {
  clip: PoseClip;
  index: number;
}

export const PoseClipDropdown = (props: PoseClipDropdownEffectProps) => {
  const dispatch = useProjectDispatch();
  const { clip, block, index, setIndex } = props;
  const { depths, setDepths, field, setField } = props;
  const cellHeight = use(selectCellHeight);
  const isSelected = use((_) => selectIsClipSelected(_, clip.id));
  const isLive = use((_) => selectIsClipLive(_, clip.id));

  const hasVector = block !== undefined && "vector" in block;
  useEffect(() => {
    if (!hasVector) setField("stream");
  }, [hasVector, setField]);

  if (!clip.isOpen) return null;
  return (
    <div
      style={{ top: POSE_HEIGHT, height: cellHeight - POSE_HEIGHT + 1 }}
      className={`z-20 animate-in fade-in ease-in p-1 rounded flex gap-1 bg-slate-800 border-4 border-fuchsia-500 cursor-auto`}
      onClick={cancelEvent}
      draggable
      onDragStart={cancelEvent}
    >
      <div className="flex flex-col total-center *:total-center *:size-full *:flex-1 px-2 py-1 *:min-w-fit min-w-max *:px-1 *:bg-slate-800 *:border *:rounded gap-1">
        <div
          data-field={field}
          data-disabled={!block && !depths.length}
          className="data-[disabled=true]:opacity-50 data-[field=vector]:data-[disabled=false]:border-fuchsia-400 border-slate-600 data-[disabled=false]:cursor-pointer text-slate-200 text-center font-bold active:opacity-75"
          onClick={() => {
            if (!hasVector) {
              dispatch(
                updatePoseBlock({
                  id: props.clip.poseId,
                  index,
                  depths: props.depths,
                  block: { ...block, vector: {} },
                })
              );
            }
            setField("vector");
          }}
        >
          Vector
        </div>
        <div
          data-field={field}
          className="data-[field=stream]:border-fuchsia-400 border-slate-600 cursor-pointer text-slate-200 relative flex total-center text-center font-bold"
          onClick={() => setField("stream")}
        >
          Stream
        </div>
      </div>
      {field === "vector" && (
        <PoseClipVector
          {...props}
          index={index}
          clip={clip}
          block={block}
          isActive={isLive && isSelected}
          depths={depths}
        />
      )}
      {field === "stream" && (
        <PoseClipStream
          {...props}
          block={block}
          index={index}
          setIndex={setIndex}
          depths={depths}
          setDepths={setDepths}
          field={field}
          setField={setField}
        />
      )}
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
