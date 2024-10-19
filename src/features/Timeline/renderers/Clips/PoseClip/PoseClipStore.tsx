import classNames from "classnames";
import React from "react";
import { PoseClip } from "types/Clip/ClipTypes";
import {
  Transformation,
  TransformationArgs,
} from "types/Pattern/PatternTransformers";
import { addPoseBlockTransformation } from "types/Pose/PoseSlice";
import { Thunk } from "types/Project/ProjectTypes";

export const PoseClipBaseEffect = (
  props: React.HTMLAttributes<HTMLDivElement> & { border?: string }
) => {
  const { border, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames(
        border ? border : "border-slate-500",
        "flex flex-col shrink-0 items-center p-1 min-w-28 max-h-20 overflow-scroll whitespace-nowrap border text-slate-200 text-center text-xs rounded",
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
  givenArgs: TransformationArgs<T>;
};

export const addTransformation =
  <T extends Transformation>(props: BasePoseClipEffectProps<T>): Thunk =>
  (dispatch) => {
    const { id, clip, givenArgs: args, index } = props;
    const transformation = { id, args };
    const payload = {
      id: clip.poseId,
      index,
      depths: props.depths,
      transformation,
    };
    dispatch(addPoseBlockTransformation(payload));
  };
