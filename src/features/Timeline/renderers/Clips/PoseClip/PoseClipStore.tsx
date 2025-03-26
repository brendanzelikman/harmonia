import classNames from "classnames";
import React from "react";
import { PoseClip } from "types/Clip/ClipTypes";
import {
  Transformation,
  TransformationArgs,
} from "types/Pattern/PatternTransformers";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { addPoseBlockTransformation, updatePose } from "types/Pose/PoseSlice";
import { Thunk } from "types/Project/ProjectTypes";

export const PoseClipBaseEffect = (
  props: React.HTMLAttributes<HTMLDivElement> & {
    border?: string;
    minWidth?: string;
  }
) => {
  const { border, minWidth, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames(
        border ? border : "border border-slate-500",
        minWidth ?? "min-w-28",
        "flex items-center p-1 max-h-20 whitespace-nowrap text-slate-200 text-center text-xs rounded",
        rest.className
      )}
    />
  );
};

export type BasePoseClipEffectProps<T extends Transformation> = {
  clip: PoseClip;
  index: number;
  id: T;
  depths?: number[];
  updateBase?: boolean;
  givenArgs: TransformationArgs<T>;
};

export const addTransformation =
  <T extends Transformation>(props: BasePoseClipEffectProps<T>): Thunk =>
  (dispatch, getProject) => {
    const { id, clip, givenArgs: args, index } = props;
    const transformation = { id, args };
    const payload = {
      id: clip.poseId,
      index,
      depths: props.depths,
      transformation,
    };
    if (!props.updateBase) {
      dispatch(addPoseBlockTransformation(payload));
    } else {
      const project = getProject();
      const pose = selectPoseById(project, clip.poseId);
      if (!pose) return;
      dispatch(
        updatePose({
          ...payload,
          data: {
            id: pose.id,
            operations: [...(pose.operations ?? []), transformation],
          },
        })
      );
    }
  };
