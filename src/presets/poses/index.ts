import { Pose } from "types/Pose";
import InfinitelyRaisedIntervals from "./InfinitelyRaisedIntervals";
import InfinitelyRaisedInversions from "./InfinitelyRaisedInversions";
import InfinitelyLoweredIntervals from "./InfinitelyLoweredIntervals";
import InfinitelyLoweredInversions from "./InfinitelyLoweredInversions";
import FinitelyRaisedIntervals from "./FinitelyRaisedIntervals";
import FinitelyRaisedInversions from "./FinitelyRaisedInversions";
import FinitelyLoweredIntervals from "./FinitelyLoweredIntervals";
import FinitelyLoweredInversions from "./FinitelyLoweredInversions";
import BasicArpeggiations from "./BasicArpeggiations";
import ChromaticProgressions from "./ChromaticProgressions";
import MajorProgressions from "./MajorProgressions";
import MinorProgressions from "./MinorProgressions";
import { createMap } from "utils/objects";

export const PresetPoseGroupMap = {
  "Custom Poses": [] as Pose[],
  "Raised Intervals (Indefinite)": Object.values(InfinitelyRaisedIntervals),
  "Raised Inversions (Indefinite)": Object.values(InfinitelyRaisedInversions),
  "Lowered Intervals (Indefinite)": Object.values(InfinitelyLoweredIntervals),
  "Lowered Inversions (Indefinite)": Object.values(InfinitelyLoweredInversions),
  "Raised Intervals (1 Measure)": Object.values(FinitelyRaisedIntervals),
  "Raised Inversions (1 Measure)": Object.values(FinitelyRaisedInversions),
  "Lowered Intervals (1 Measure)": Object.values(FinitelyLoweredIntervals),
  "Lowered Inversions (1 Measure)": Object.values(FinitelyLoweredInversions),
  "Basic Arpeggiations": Object.values(BasicArpeggiations),
  "Chromatic Progressions": Object.values(ChromaticProgressions),
  "Major Progressions": Object.values(MajorProgressions),
  "Minor Progressions": Object.values(MinorProgressions),
};

export type PoseGroupMap = typeof PresetPoseGroupMap;
export type PoseGroupKey = keyof PoseGroupMap;
export type PoseGroupList = PoseGroupKey[];

export const PresetPoseGroupList = Object.keys(
  PresetPoseGroupMap
) as PoseGroupList;

export const PresetPoseList = Object.values(PresetPoseGroupMap).flat();
export const PresetPoseMap = createMap<Pose>(PresetPoseList);
