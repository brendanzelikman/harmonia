import * as _ from "./PoseTypes";
import { PresetPoseGroupList, PresetPoseGroupMap } from "assets/poses";
import { WholeNoteTicks } from "utils/durations";
import pluralize from "pluralize";
import { ScaleVector } from "types/Scale/ScaleTypes";
import { getOrderedTrackIds, getTrackLabel } from "types/Track/TrackFunctions";
import {
  TrackId,
  TrackMap,
  isScaleTrack,
  isTrackId,
} from "types/Track/TrackTypes";
import { isVoiceLeading } from "./PoseTypes";
import { ChromaticKey, ChromaticPitchClass } from "assets/keys";
import { isPitchClass } from "utils/pitchClass";
import {
  getVectorKeys,
  isVectorEmpty,
  multiplyVector,
  sumVectors,
} from "utils/vector";

// ------------------------------------------------------------
// Pose Serializers
// ------------------------------------------------------------

/** Get a `PoseVector` as JSX. */
export const getPoseVectorAsJSX = (
  vector?: _.PoseVector,
  trackMap?: TrackMap
) => {
  if (!vector) return "";

  // Return the origin if the vector is empty
  if (isVectorEmpty(vector)) return <span>Origin</span>;

  // Otherwise, parse the keys and create a string for each offset
  const keys = getVectorKeys(vector);
  const trackIds: TrackId[] = [];
  if (trackMap) {
    const orderedTrackIds = getOrderedTrackIds(trackMap);
    const keyTrackIds = keys.filter(isTrackId) as TrackId[];
    trackIds.push(
      ...keyTrackIds.sort((a, b) => {
        return orderedTrackIds.indexOf(a) - orderedTrackIds.indexOf(b);
      })
    );
  }

  // Create an element for the pitch classes if there is a voice leading
  const classes = getVectorPitchClasses(vector);
  const count = classes.length;
  const hasSeveralClasses = count > 0;
  const pitchKeys = isVoiceLeading(vector) ? (
    <span>
      {hasSeveralClasses ? "(" : ""}
      {classes.map((pitch, i) => (
        <span key={`pitch-${i}`}>
          {pitch}: {vector[pitch]}
          {i < count - 1 ? " + " : ""}
        </span>
      ))}
      {hasSeveralClasses ? ")" : ""}
    </span>
  ) : null;

  // Create a component for every existing track ID
  const trackCount = trackIds.length;
  const hasSeveralTracks = trackCount > 0;
  const trackKeys =
    hasSeveralTracks && trackMap ? (
      <span>
        {hasSeveralTracks ? "(" : ""}
        {trackIds.map((id, i) => {
          const label = getTrackLabel(id, trackMap);
          const value = vector[id];
          return (
            <span key={`scalar-${i}`}>
              S{label}: {value}
              {i < trackCount - 1 ? " + " : ""}
            </span>
          );
        })}
        {hasSeveralTracks ? ")" : ""}
      </span>
    ) : null;

  // Create a chromatic component
  const chromaticValue = vector.chromatic;
  const hasChromatic = vector.chromatic !== undefined;
  const chromatic = hasChromatic ? <span>T{chromaticValue}</span> : null;

  // Create a chordal component
  const chordalValue = vector.chordal;
  const hasChordal = vector.chordal !== undefined;
  const chordal = hasChordal ? <span>t{chordalValue}</span> : null;

  // Create an octave component
  const octaveValue = vector.octave;
  const hasOctave = vector.octave !== undefined;
  const octave = hasOctave ? <span>O{octaveValue}</span> : null;

  // Get all existing components
  const components = [pitchKeys, trackKeys, chordal, chromatic, octave].filter(
    (t) => t !== null
  );
  const componentCount = components.length;

  // Create the vector element and add a comma before the end
  const vectorElement = components.map((t, i) => {
    if (componentCount > 1 && i < componentCount - 1) {
      return <span key={`offset-${i}`}>{t} + </span>;
    } else {
      return <span key={`offset-${i}`}>{t}</span>;
    }
  });

  // Return the joined string
  return (
    <span className="flex font-light whitespace-nowrap">
      <span className="font-semibold">{vectorElement}</span>
    </span>
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

/** Get a pose vector as a scale vector. */
export const getPoseVectorAsScaleVector = (
  vector?: _.PoseVector,
  tracks?: TrackMap
) => {
  if (!vector || !tracks) return {};
  const keys = getVectorKeys(vector);
  return keys.reduce((acc, cur) => {
    const track = isTrackId(cur) ? tracks[cur] : undefined;
    if (isScaleTrack(track)) {
      acc[track.scaleId] = vector[cur] ?? 0;
    } else if (isPitchClass(cur)) {
      acc[cur] = vector[cur] ?? 0;
    }
    return acc;
  }, {} as ScaleVector);
};

// ------------------------------------------------------------
// Pose Properties
// ------------------------------------------------------------

/** Returns true if a pose has a stream of one vector. */
export const isPoseBucket = (pose?: _.Pose) => {
  if (!pose) return false;
  const stream = pose.stream;
  if (stream.length !== 1) return false;
  return _.isPoseVectorModule(stream[0]);
};

/** Get the first vector of a Pose if it is a bucket. */
export const getPoseBucketVector = (pose?: _.Pose) => {
  if (!pose || !pose.stream.length) return {};
  const block = pose.stream[0];
  if (_.isPoseVectorModule(block)) return block.vector;
  return {};
};

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

/** Get the pitch classes in the keys of a vector. */
export const getVectorPitchClasses = (
  vector?: _.PoseVector
): ChromaticPitchClass[] => {
  if (!vector) return [];
  const pitchClasses = Object.keys(vector).filter(
    (key) =>
      key !== "chromatic" &&
      key !== "chordal" &&
      key !== "octave" &&
      !isTrackId(key)
  ) as ChromaticPitchClass[];
  return pitchClasses.sort(
    (a, b) => ChromaticKey.indexOf(a) - ChromaticKey.indexOf(b)
  );
};

export const getPoseVectorOffsetName = (
  offsetId: _.PoseVectorId,
  trackMap?: TrackMap
) => {
  if (offsetId === "chromatic") return "Chromatic";
  if (offsetId === "chordal") return "Chordal";
  if (offsetId === "octave") return "Octave";
  if (isTrackId(offsetId) && trackMap) {
    return `Track ${getTrackLabel(offsetId, trackMap)}`;
  }
  return offsetId;
};

// ------------------------------------------------------------
// Pose Stream Functions
// ------------------------------------------------------------

/** Get the duration of a stream or Infinity if some element's duration is undefined. */
export const getPoseDuration = (pose?: _.Pose) => {
  const stream = pose?.stream;
  if (!stream) return 0;
  return stream.reduce((acc, block) => {
    const duration = block.duration || Infinity;
    const repeat = block.repeat || 1;
    return acc + duration * repeat;
  }, 0);
};

/** Get the vector at the given index within the stream */
export const getPoseVectorAtIndex = (
  pose: _.Pose,
  index: number,
  lastIndex: number = 0
): _.PoseVector => {
  const stream = pose.stream;
  let currentIndex = 0;

  // Compute the last index initially by taking the duration of the stream
  if (!lastIndex) lastIndex = getPoseDuration(pose);

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
            const chainedVector = multiplyVector(block.chain, i);
            return sumVectors(block.vector, chainedVector);
          }

          // Otherwise, recursively call the function on the stream
          return getPoseVectorAtIndex(pose, blockLocalIndex, blockLastIndex);
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
export const mergePoseStreamVectors = (
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
  return mapPoseStreamVectors(pose, (oldVec) => sumVectors(oldVec, vector));
};

/** Update a pose's stream by resetting each vector. */
export const resetPoseStreamVectors = (stream: _.PoseStream) => {
  return mapPoseStreamVectors(stream, () => ({}));
};
