import { getHeldKey } from "hooks/useHeldkeys";
import { PoseClip } from "types/Clip/ClipTypes";
import { PoseVector, PoseVectorId } from "types/Pose/PoseTypes";
import { TrackId } from "types/Track/TrackTypes";

/** The keymap of scale track IDs to shortcut */
export const keymap: Record<string, string> = {
  "scale-track_1": "q",
  "scale-track_2": "w",
  "scale-track_3": "e",
  chordal: "r",
  chromatic: "t",
  octave: "y",
};
export const allKeys = Object.keys(keymap) as PoseVectorId[];

/** Utility functions to check status */
export const isNegative = () => getHeldKey("-") || getHeldKey("`");

/** Utility function to find a pose clip that matches a given tick and trackId. */
export const getMatch = (
  poseClips: PoseClip[],
  { tick, trackId }: { tick: number; trackId: TrackId }
) => {
  let match: PoseClip | undefined = undefined;
  for (const clip of poseClips) {
    if (clip.trackId === trackId && clip.tick === tick) {
      match = clip;
      break;
    } else if (clip.tick > tick) {
      break;
    }
  }
  return match;
};

/** Utility function to sum a vector based on the held keys. */
export const sumVector = (
  initialVector: PoseVector = {},
  value: number = 0,
  ancestors: TrackId[] = []
) => {
  const vector = { ...initialVector };
  const [q, w, e] = ancestors;
  if (q && getHeldKey("q")) {
    if (getHeldKey("=")) vector[q] = value;
    else vector[q] = (vector[q] ?? 0) + value;
  }
  if (w && getHeldKey("w")) {
    if (getHeldKey("=")) vector[w] = value;
    else vector[w] = (vector[w] ?? 0) + value;
  }
  if (e && getHeldKey("e")) {
    if (getHeldKey("=")) vector[e] = value;
    else vector[e] = (vector[e] ?? 0) + value;
  }
  if (getHeldKey("r")) {
    if (getHeldKey("=")) vector.chordal = value;
    else vector.chordal = (vector.chordal ?? 0) + value;
  }
  if (getHeldKey("t")) {
    if (getHeldKey("=")) vector.chromatic = value;
    else vector.chromatic = (vector.chromatic ?? 0) + value;
  }
  if (getHeldKey("y")) {
    if (getHeldKey("=")) vector.octave = value;
    else vector.octave = (vector.octave ?? 0) + value;
  }
  return vector;
};

/** Utility function to delete a vector based on the held keys. */
export const deleteVector = (
  initialVector: PoseVector = {},
  ancestors: TrackId[] = []
) => {
  const vector = { ...initialVector };
  const [q, w, e] = ancestors;
  let deleted = false;
  if (getHeldKey("q")) {
    if (q) delete vector[q];
    deleted = true;
  }
  if (getHeldKey("w")) {
    if (w) delete vector[w];
    deleted = true;
  }
  if (getHeldKey("e")) {
    if (e) delete vector[e];
    deleted = true;
  }
  if (getHeldKey("r")) {
    delete vector.chordal;
    deleted = true;
  }
  if (getHeldKey("t")) {
    delete vector.chromatic;
    deleted = true;
  }
  if (getHeldKey("y")) {
    delete vector.octave;
    deleted = true;
  }
  if (!deleted) return {};
  return vector;
};
