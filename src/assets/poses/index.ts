import { Pose } from "types/Pose/PoseTypes";
import InfinitelyRaisedIntervals from "./intervals_raised";
import InfinitelyRaisedInversions from "./inversions_raised";
import InfinitelyLoweredIntervals from "./intervals_lowered";
import InfinitelyLoweredInversions from "./inversions_lowered";
import InfinitelyRaisedOctaves from "./octaves_raised";
import InfinitelyLoweredOctaves from "./octaves_lowered";
import { keyBy } from "lodash";

export const PresetPoseGroupMap = {
  "Custom Poses": [] as Pose[],
  "Raised Intervals": Object.values(InfinitelyRaisedIntervals),
  "Lowered Intervals": Object.values(InfinitelyLoweredIntervals),
  "Raised Inversions": Object.values(InfinitelyRaisedInversions),
  "Lowered Inversions": Object.values(InfinitelyLoweredInversions),
  "Raised Octaves": Object.values(InfinitelyRaisedOctaves),
  "Lowered Octaves": Object.values(InfinitelyLoweredOctaves),
};

export type PoseGroupMap = typeof PresetPoseGroupMap;
export type PoseGroupKey = keyof PoseGroupMap;
export type PoseGroupList = PoseGroupKey[];

export const PresetPoseGroupList = Object.keys(
  PresetPoseGroupMap
) as PoseGroupList;

export const PresetPoseList = Object.values(PresetPoseGroupMap).flat();
export const PresetPoseMap = keyBy(PresetPoseList, "id");
