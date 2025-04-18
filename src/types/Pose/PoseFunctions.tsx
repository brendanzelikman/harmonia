import * as _ from "./PoseTypes";
import { ScaleVector } from "types/Scale/ScaleTypes";
import { getTrackLabel } from "types/Track/TrackFunctions";
import { TrackMap, isScaleTrack, isTrackId } from "types/Track/TrackTypes";
import { ChromaticKey, ChromaticPitchClass } from "lib/presets/keys";
import { isPitchClass } from "utils/pitch";
import { getVectorNonzeroKeys, getVectorKeys } from "utils/vector";
import {
  CHORDAL_KEY,
  CHROMATIC_KEY,
  OCTAVE_KEY,
  PITCH_KEY,
  VECTOR_BASE,
  VECTOR_SEPARATOR,
} from "utils/constants";
import { size } from "lodash";

// ------------------------------------------------------------
// Pose Properties
// ------------------------------------------------------------

/** Get the duration of a pose. */
export const getPoseDuration = (pose?: _.Pose) => {
  if (!pose) return 0;
  if ("stream" in pose) return getPoseStreamDuration(pose?.stream);
  return Infinity;
};

// ------------------------------------------------------------
// Pose Serializers
// ------------------------------------------------------------

/** Get a `PoseVector` as a string. */
export const getPoseVectorAsString = (
  vector: _.PoseVector,
  trackMap?: TrackMap
) => {
  const keys = getVectorNonzeroKeys(vector).filter((k) => !isPitchClass(k));
  if (!size(vector) || !keys.length) return VECTOR_BASE;
  const offsets = keys.map((key) => {
    if (isTrackId(key) && trackMap) {
      const label = getTrackLabel(key, trackMap);
      return `${label}${vector[key]}`;
    }
    if (key === "chordal") {
      return `${CHORDAL_KEY}${vector[key]}`;
    }
    if (key === "chromatic") {
      return `${CHROMATIC_KEY}${vector[key]}`;
    }
    if (key === "octave") {
      return `${OCTAVE_KEY}${vector[key]}`;
    }
    if (isPitchClass(key)) {
      return `${PITCH_KEY}${key}${vector[key]}`;
    }
  });

  return [...offsets].join(VECTOR_SEPARATOR);
};

// ------------------------------------------------------------
// Pose Helpers
// ------------------------------------------------------------

/** Get a pose vector as a scale vector. */
export const getPoseVectorAsScaleVector = (
  vector: _.PoseVector,
  tracks: TrackMap
) => {
  const keys = getVectorKeys(vector);
  return keys.reduce((acc, cur) => {
    const track = isTrackId(cur) ? tracks[cur] : undefined;
    if (isScaleTrack(track)) {
      acc[track.scaleId] = vector[cur] ?? 0;
    }
    return acc;
  }, {} as ScaleVector);
};

/** Get the pitch classes in the keys of a vector. */
export const getVectorPitchClasses = (
  vector?: _.PoseVector
): ChromaticPitchClass[] => {
  if (!vector) return [];
  return ChromaticKey.filter((c) => vector[c] !== undefined);
};

// ------------------------------------------------------------
// Pose Stream Functions
// ------------------------------------------------------------

/** Get the duration of a stream or Infinity if some element's duration is undefined. */
export const getPoseStreamDuration = (stream?: _.PoseStream) => {
  if (!stream) return 0;
  return stream.reduce((acc, block) => {
    const duration = block.duration ?? Infinity;
    const repeat = block.repeat || 1;
    return acc + duration * repeat;
  }, 0);
};
