import * as _ from "./PoseTypes";
import { TrackId, TrackMap, getTrackLabel, isScaleTrack } from "types/Track";
import { getKeys } from "utils/objects";
import { ScaleVector } from "types/Scale";
import { PresetPoseGroupList, PresetPoseGroupMap } from "presets/poses";
import { WholeNoteTicks } from "utils/durations";
import pluralize from "pluralize";

// ------------------------------------------------------------
// Pose Serializers
// ------------------------------------------------------------

/** Get a `PoseVector` as a string. */
export const getPoseVectorAsString = (
  vector?: _.PoseVector,
  trackMap?: TrackMap
) => {
  if (!vector) return "";
  const keys = getKeys(vector);
  const trackKeys = keys.filter((k) => k !== "chromatic" && k !== "chordal");
  const stringKeys: string[] = [];

  // Add the chromatic first
  stringKeys.push(`N${vector.chromatic ?? 0}`);

  // Add all track IDs
  for (const key of trackKeys) {
    if (!trackMap) continue;
    const label = getTrackLabel(key, trackMap);
    const value = vector[key];
    stringKeys.push(`T${label}(${value})`);
  }

  // Add the chordal last
  stringKeys.push(`t${vector.chordal ?? 0}`);

  // Return the joined string
  return stringKeys.join(" — ");
};

/** Get a `PoseVector` as JSX. */
export const getPoseVectorAsJSX = (
  vector?: _.PoseVector,
  trackMap?: TrackMap
) => {
  if (!vector) return "";
  const keys = getVectorKeys(vector);
  const trackKeys = keys.filter((k) => k !== "chromatic" && k !== "chordal");

  // Add the chromatic first
  const chromatic = <span>N{vector.chromatic ?? 0}</span>;

  // Add all track IDs
  const scalars = trackKeys.map((key, i) => {
    if (!trackMap) return null;
    const label = getTrackLabel(key, trackMap);
    const value = vector[key];
    if (!value) return null;
    return (
      <span key={`scalar-${i}`}>
        <span className="mx-1">
          T<sub>{label}</sub>({value})
        </span>
        <span className="mx-1">•</span>
      </span>
    );
  });

  // Add the chordal last
  const chordal = <span>t{vector.chordal ?? 0}</span>;

  // Return the joined string
  return (
    <>
      {chromatic} • {scalars}
      {chordal}
    </>
  );
};

/** Get a `PoseVectorModule` as JSX. */
export const getPoseVectorModuleAsJSX = (
  module: _.PoseVectorModule,
  trackMap?: TrackMap
) => {
  const { vector, chain } = module;
  const vectorJSX = getPoseVectorAsJSX(vector, trackMap);
  if (!chain) return vectorJSX;
  const chainJSX = getPoseVectorAsJSX(chain, trackMap);
  return (
    <>
      {vectorJSX}{" "}
      <span className="text-slate-300"> summing with ({chainJSX})</span>
    </>
  );
};

/** Get a `PoseStream` as a string. */
export const getPoseStreamAsString = (stream: _.PoseStream) => {
  return JSON.stringify(stream);
};

/** Get a `Pose` as a string. */
export const getPoseAsString = (pose: _.Pose) => {
  const { id, stream, name, trackId } = pose;
  const streamString = getPoseStreamAsString(stream);
  return `${id},${trackId},${name},${streamString}`;
};

/** Get a `PoseUpdate` as a string. */
export const getPoseUpdateAsString = (update: _.PoseUpdate) => {
  return JSON.stringify(update);
};

/** Get a `PoseBlock` as a string */
export const getPoseBlockAsString = (block: _.PoseBlock) => {
  if (_.isPoseVectorModule(block)) {
    return getPoseVectorModuleAsJSX(block);
  }
  return getPoseStreamAsString(block.stream);
};

/** Get the duration of a `PoseBlock` as a string. */
export const getPoseBlockDurationAsString = (block: _.PoseBlock) => {
  const duration = block.duration ?? Infinity;
  const repeat = block.repeat ?? 1;
  const totalDuration = duration * repeat;

  // If the duration is infinite, just return the symbol
  const isInfinite = duration === Infinity;
  if (isInfinite) return `Duration: ∞`;

  // Otherwise, include the total duration and measure count
  const measureCount = parseFloat((totalDuration / WholeNoteTicks).toFixed(2));
  const measureTerm = pluralize("Measure", measureCount);

  return `Duration: ${totalDuration} ticks (${measureCount} ${measureTerm})`;
};

// ------------------------------------------------------------
// Pose Helpers
// ------------------------------------------------------------

/** Creates a PoseMap from an array of Poses. */
export const createPoseMap = (poses: _.Pose[]) => {
  return poses.reduce((acc, pose) => {
    acc[pose.id] = pose;
    return acc;
  }, {} as _.PoseMap);
};

/** Map over a vector and reduce its keys into a new vector. */
export const mapPoseVector = (
  vector: _.PoseVector,
  fn: (key: string, value: number) => number
) => {
  const keys = getKeys(vector);
  return keys.reduce((acc, cur) => {
    acc[cur] = fn(cur, vector[cur]);
    return acc;
  }, {} as _.PoseVector);
};

/** Sum the given vectors together into a new vector. */
export const sumPoseVectors = (...vectors: _.PoseVector[]): _.PoseVector => {
  const allVectors = [...vectors];
  if (!allVectors.length) return {};

  // Sum the vectors together
  return allVectors.reduce((acc, cur) =>
    mapPoseVector(acc, (key, value) => value + (cur[key] || 0))
  );
};

/** Multiply each value of the vector with the given multiplier. */
export const multiplyPoseVector = (
  vector?: _.PoseVector,
  multiplier = 1
): _.PoseVector => {
  if (!vector) return {};
  return mapPoseVector(vector, (_, value) => value * multiplier);
};

/** Multiply the given vectors together into a new vector. */
export const multiplyPoseVectors = (
  ...vectors: _.PoseVector[]
): _.PoseVector => {
  const allVectors = [...vectors];
  if (!allVectors.length) return {};
  return allVectors.reduce((acc, cur) =>
    mapPoseVector(acc, (key, value) => value * cur[key])
  );
};

/** Get a pose vector as a scale vector. */
export const getPoseVectorAsScaleVector = (
  vector?: _.PoseVector,
  tracks?: TrackMap
) => {
  if (!vector || !tracks) return {};
  const keys = getKeys(vector);
  return keys.reduce((acc, cur) => {
    const track = tracks[cur];
    if (isScaleTrack(track)) acc[track.scaleId] = vector[cur];
    return acc;
  }, {} as ScaleVector);
};

// ------------------------------------------------------------
// Pose Properties
// ------------------------------------------------------------

/** Get the name of a pose. */
export const getPoseName = (pose?: _.Pose) => {
  return pose?.name ?? "";
};

/** Get the category of a pose. */
export const getPoseCategory = (pattern?: _.Pose) => {
  if (!pattern) return "No Category";
  return (
    PresetPoseGroupList.find((c) => {
      return PresetPoseGroupMap[c].some((m) => m.id === pattern.id);
    }) ?? "Custom Poses"
  );
};

/** Get the sorted keys from a vector. */
export const getVectorKeys = (vector?: _.PoseVector, trackMap?: TrackMap) => {
  const keys = [
    ...new Set([
      ...getKeys(vector),
      ...(trackMap ? Object.keys(trackMap) : []),
      "chromatic",
      "chordal",
    ]),
  ];
  return keys.sort((a, b) => {
    if (a === "chromatic") return -1;
    if (b === "chromatic") return 1;
    if (a === "chordal") return -1;
    if (b === "chordal") return 1;
    return a.localeCompare(b);
  });
};

/** Get the chromatic offset from the vector. */
export const getVector_N = (vector?: _.PoseVector) => {
  if (!vector) return 0;
  return vector.chromatic || 0;
};

/** Get the chordal offset from the vector. */
export const getVector_t = (vector?: _.PoseVector) => {
  if (!vector) return 0;
  return vector.chordal || 0;
};

/** Get the pose offset by ID from the vector. */
export const getVectorOffsetById = (
  vector?: _.PoseVector,
  id?: _.PoseVectorId
) => {
  if (!vector || !id) return 0;
  return vector[id] || 0;
};

/** Get the pose offsets by ID from the vector. */
export const getVectorOffsetsById = (
  vector?: _.PoseVector,
  ids?: _.PoseVectorId[]
) => {
  if (!vector || !ids) return [];
  return ids.map((id) => vector[id] || 0);
};

export const getPoseVectorOffsetName = (
  offsetId: _.PoseVectorId,
  trackMap?: TrackMap
) => {
  if (offsetId === "chromatic") return "Chromatic";
  if (offsetId === "chordal") return "Chordal";
  if (!trackMap) return "";
  return `Scale Track (${getTrackLabel(offsetId, trackMap)})`;
};

// ------------------------------------------------------------
// Pose Stream Functions
// ------------------------------------------------------------

/** Get the duration of a stream or Infinity if some element's duration is undefined. */
export const getPoseStreamDuration = (stream: _.PoseStream) => {
  return stream.reduce((acc, block) => {
    const duration = block.duration || Infinity;
    const repeat = block.repeat || 1;
    return acc + duration * repeat;
  }, 0);
};

/** Get the vector at the given index within the stream */
export const getPoseVectorAtIndex = (
  stream: _.PoseStream,
  index: number,
  lastIndex: number = 0
): _.PoseVector => {
  let currentIndex = 0;

  // Compute the last index initially by taking the duration of the stream
  if (!lastIndex) lastIndex = getPoseStreamDuration(stream);

  // Keep iterating until the last index is passed
  while (currentIndex < lastIndex) {
    let localIndex = currentIndex;

    // Iterate through each block in the stream
    for (const block of stream) {
      // Find the end time of the current block or fill in the remaining duration
      const duration = block.duration ?? lastIndex - localIndex;
      const repeatCount = block.repeat ?? 1;
      const blockEndTime = localIndex + duration * repeatCount;

      // Iterate while the block is still active and the parent is not over
      for (let i = 0; i < repeatCount && localIndex < lastIndex; i++) {
        if (localIndex > index) break;
        const blockLastIndex = localIndex + duration;
        const blockLocalIndex = index - localIndex;

        // Check if the offset is within the bounds of the current block
        if (index < blockLastIndex) {
          // Return the vector if possible
          if (_.isPoseVectorModule(block)) {
            if (!block.chain) return block.vector;
            const chainedVector = multiplyPoseVector(block.chain, i);
            return sumPoseVectors(block.vector, chainedVector);
          }

          // Otherwise, recursively call the function on the stream
          const stream = block.stream;
          return getPoseVectorAtIndex(stream, blockLocalIndex, blockLastIndex);
        }

        // Increment the local index by the duration of the current block
        localIndex += duration;

        // Break if the local index is beyond the end of the current block
        if (localIndex >= blockEndTime) break;
      }

      // Break if the local index is beyond the end of the parent stream
      if (localIndex >= lastIndex) break;
    }

    // Increment the current index by the duration of the parent stream
    currentIndex = localIndex;
  }

  // Return an empty vector if the offset is beyond all elements
  return {};
};

/** Map a function onto a pose block */
export const mapPoseBlock = (
  block: _.PoseBlock,
  fn: (oldVec: _.PoseVector) => _.PoseVector
): _.PoseBlock => {
  if (_.isPoseVectorModule(block)) {
    return { ...block, vector: fn(block.vector) };
  }
  return { ...block, stream: mapPoseStreamVectors(block.stream, fn) };
};

/** Map a function onto each vector offset of a pose's stream */
export const mapPoseStreamVectors = (
  stream: _.PoseStream,
  fn: (oldVec: _.PoseVector) => _.PoseVector
): _.PoseStream => {
  return stream.map((block) => {
    if (_.isPoseVectorModule(block)) {
      return { ...block, vector: fn(block.vector) };
    }
    return { ...block, stream: mapPoseStreamVectors(block.stream, fn) };
  });
};

/** Update a pose's stream by directly setting each vector's offset */
export const updatePoseStreamVectors = (
  stream: _.PoseStream,
  vector: _.PoseVector
) => {
  return mapPoseStreamVectors(stream, (oldVec) => ({ ...oldVec, ...vector }));
};

/** Update a pose's stream by summing the given vector with each offset */
export const offsetPoseStreamVectors = (
  pose: _.PoseStream,
  vector: _.PoseVector
) => {
  return mapPoseStreamVectors(pose, (oldVec) => sumPoseVectors(oldVec, vector));
};

/** Update a pose's stream by resetting each vector. */
export const resetPoseStreamVectors = (stream: _.PoseStream) => {
  return mapPoseStreamVectors(stream, () => ({}));
};
