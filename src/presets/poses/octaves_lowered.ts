import { Pose } from "types/Pose/PoseTypes";

export const DownOneOctave: Pose = {
  id: "pose_preset_infinitely-down-one-octave",
  name: "Down One Octave",
  stream: [{ vector: { octave: -1 } }],
};

export const DownTwoOctaves: Pose = {
  id: "pose_preset_infinitely-down-two-octaves",
  name: "Down Two Octaves",
  stream: [{ vector: { octave: -2 } }],
};

export const DownThreeOctaves: Pose = {
  id: "pose_preset_infinitely-down-three-octaves",
  name: "Down Three Octaves",
  stream: [{ vector: { octave: -3 } }],
};

export const DownFourOctaves: Pose = {
  id: "pose_preset_infinitely-down-four-octaves",
  name: "Down Four Octaves",
  stream: [{ vector: { octave: -4 } }],
};

export const DownFiveOctaves: Pose = {
  id: "pose_preset_infinitely-down-five-octaves",
  name: "Down Five Octaves",
  stream: [{ vector: { octave: -5 } }],
};

export const DownSixOctaves: Pose = {
  id: "pose_preset_infinitely-down-six-octaves",
  name: "Down Six Octaves",
  stream: [{ vector: { octave: -6 } }],
};

export const DownSevenOctaves: Pose = {
  id: "pose_preset_infinitely-down-seven-octaves",
  name: "Down Seven Octaves",
  stream: [{ vector: { octave: -7 } }],
};

export default {
  DownOneOctave,
  DownTwoOctaves,
  DownThreeOctaves,
  DownFourOctaves,
  DownFiveOctaves,
  DownSixOctaves,
  DownSevenOctaves,
};
