import * as _ from "./PoseTypes";
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
  CHORDAL_KEY,
  CHROMATIC_KEY,
  getVectorKeys,
  isVectorEmpty,
  multiplyVector,
  OCTAVE_KEY,
  PITCH_KEY,
  sumVectors,
  VECTOR_BASE,
  VECTOR_SEPARATOR,
} from "utils/vector";
import { isFiniteNumber } from "types/util";
import { size } from "lodash";

// ------------------------------------------------------------
// Pose Properties
// ------------------------------------------------------------

/** Get the name of a pose. */
export const getPoseName = (pose?: _.Pose) => {
  return pose?.name ?? "";
};

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
  const keys = getVectorKeys(vector).filter((k) => !isPitchClass(k));
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
type JsxOptions = {
  oneLine?: boolean;
  isSelected?: boolean;
};

const defaultJsxOptions: JsxOptions = {
  oneLine: true,
  isSelected: false,
};

/** Get a `PoseVector` as JSX. */
export const getPoseVectorAsJSX = (
  vector?: _.PoseVector,
  trackMap?: TrackMap,
  _options: Partial<JsxOptions> = defaultJsxOptions
) => {
  const options = { ...defaultJsxOptions, ..._options };

  // Return the base value if the vector is empty
  if (!vector || isVectorEmpty(vector)) {
    return (
      <span>
        {options.oneLine
          ? options.isSelected
            ? "Posing..."
            : VECTOR_BASE
          : ""}
      </span>
    );
  }

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

  if (!options.oneLine) {
    const map = {
      chordal: CHORDAL_KEY,
      chromatic: CHROMATIC_KEY,
      octave: OCTAVE_KEY,
    };
    return keys.map((key, i) => (
      <span key={`offset-${i}`}>
        {isTrackId(key)
          ? getTrackLabel(key, trackMap ?? {})
          : isPitchClass(key)
          ? `${PITCH_KEY}${key}`
          : map[key]}
        {vector[key]}
      </span>
    ));
  }

  // Create an element for the pitch classes if there is a voice leading
  const classes = getVectorPitchClasses(vector);
  const count = classes.length;
  const pitchKeys = isVoiceLeading(vector) ? (
    <span>
      {classes.map((pitch, i) => (
        <span key={`pitch-${i}`}>
          {PITCH_KEY}
          {pitch}
          {vector[pitch]}
          {i < count - 1 ? VECTOR_SEPARATOR : ""}
        </span>
      ))}
    </span>
  ) : null;

  // Create a component for every existing track ID
  const hasSeveralTracks = trackIds.some((id) => vector[id]);
  const trackKeys =
    hasSeveralTracks && trackMap
      ? trackIds
          .filter((id) => vector[id])
          .map((id, i) => {
            const label = getTrackLabel(id, trackMap ?? {});
            const value = vector[id];
            return (
              <span key={`scalar-${i}`}>
                {label}
                {value}
              </span>
            );
          })
      : null;

  // Create a chromatic component
  const chromaticValue = vector.chromatic;
  const hasChromatic = vector.chromatic !== undefined;
  const chromatic = hasChromatic ? (
    <span>
      {CHROMATIC_KEY}
      {chromaticValue}
    </span>
  ) : null;

  // Create a chordal component
  const chordalValue = vector.chordal;
  const hasChordal = vector.chordal !== undefined;
  const chordal = hasChordal ? (
    <span>
      {CHORDAL_KEY}
      {chordalValue}
    </span>
  ) : null;

  // Create an octave component
  const octaveValue = vector.octave;
  const hasOctave = vector.octave !== undefined;
  const octave = hasOctave ? (
    <span>
      {OCTAVE_KEY}
      {octaveValue}
    </span>
  ) : null;

  // Get all existing components
  const components = [
    pitchKeys,
    ...(trackKeys ?? []),
    chordal,
    chromatic,
    octave,
  ].filter((t) => t !== null);
  const componentCount = components.length;

  // Create the vector element and add a comma before the end
  const vectorElement = components.map((t, i) => {
    if (componentCount > 1 && i < componentCount - 1) {
      return (
        <span key={`offset-${i}`}>
          {t}
          {VECTOR_SEPARATOR}
        </span>
      );
    } else {
      return <span key={`offset-${i}`}>{t}</span>;
    }
  });

  // Return the joined string
  return (
    <span className="font-light whitespace-nowrap">
      <span className="font-semibold">{vectorElement}</span>
    </span>
  );
};

/** Get a `PoseVectorModule` as JSX. */
export const getPoseVectorModuleAsJSX = (
  module: _.PoseOperation,
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
  const totalDuration = getPoseBlockDuration(block);

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

/** Get a pose block from the stream using the list of indices. */
export const getPoseBlockFromStream = (
  stream: _.PoseStream = [],
  indices: number[] = []
): _.PoseBlock | undefined => {
  if (!stream.length || !indices.length) return undefined;

  // Get the last index and the rest of the indices
  const depths = indices;
  const index = indices.splice(-1, 1)[0];

  // If there is no depth, return the block at the index
  let block = stream;
  if (!depths.length) return block.at(index);

  // Iterate through the depths until a stream cannot be found
  for (const depth of depths) {
    const nextBlock = block[depth];
    if (!nextBlock || !("stream" in nextBlock)) return undefined;
    block = nextBlock.stream;
  }

  // Return the block at the index
  return stream.at(index);
};

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

export const getPoseVectorOffsetName = (
  offsetId: _.PoseVectorId,
  trackMap?: TrackMap
) => {
  if (offsetId === "chromatic") return "Chromatic";
  if (offsetId === "chordal") return "Chordal";
  if (offsetId === "octave") return "Octave";
  if (isTrackId(offsetId) && trackMap) {
    const label = getTrackLabel(offsetId, trackMap);
    return `Track ${label}`;
  }
  return offsetId;
};

// ------------------------------------------------------------
// Pose Stream Functions
// ------------------------------------------------------------

export const getPoseBlockDuration = (block: _.PoseBlock) => {
  const duration = block.duration ?? Infinity;
  const repeat = block.repeat ?? 1;
  return duration * repeat;
};

/** Get the duration of a stream or Infinity if some element's duration is undefined. */
export const getPoseStreamDuration = (stream?: _.PoseStream) => {
  if (!stream) return 0;
  return stream.reduce((acc, block) => {
    const duration = block.duration ?? Infinity;
    const repeat = block.repeat || 1;
    return acc + duration * repeat;
  }, 0);
};

/** Get the vector at the given index within the stream */
export const getPoseOperationAtIndex = (
  stream: _.PoseStream,
  index: number,
  lastIndex: number = 0
): _.PoseOperation => {
  let currentIndex = 0;
  let operation: _.PoseOperation = {
    vector: {},
    operations: [],
  };

  // Compute the last index initially by taking the duration of the stream
  if (!lastIndex) lastIndex = getPoseStreamDuration(stream);

  // Keep iterating until the last index is passed
  while (currentIndex < lastIndex) {
    let localIndex = currentIndex;

    // Iterate through each block in the stream
    for (const block of stream) {
      // Find the end time of the current block or fill in the remaining duration
      const duration = block.duration ?? lastIndex - localIndex;
      const repeatCount = block.repeat || 1;
      const blockEndTime = localIndex + duration * repeatCount;

      // Iterate while the block is still active and the parent is not over
      for (let i = 0; i < repeatCount && localIndex < lastIndex; i++) {
        if (localIndex > index) break;
        const blockLastIndex = localIndex + duration;
        const blockLocalIndex = index - localIndex;

        // Check if the offset is within the bounds of the current block
        if (index < blockLastIndex) {
          // Return the vector if possible
          if (!_.isPoseStreamModule(block)) {
            if (!block.chain)
              return {
                ...operation,
                ...block,
                operations: [
                  ...(operation.operations ?? []),
                  ...(block.operations ?? []),
                ],
                vector: sumVectors(operation.vector, block.vector),
              };
            const chainedVector = multiplyVector(block.chain, i);
            return {
              ...operation,
              ...block,
              operations: [
                ...(operation.operations ?? []),
                ...(block.operations ?? []),
              ],
              vector: sumVectors(operation.vector, block.vector, chainedVector),
            };
          }

          // Otherwise, recursively call the function on the stream
          const newOp = getPoseOperationAtIndex(
            block.stream,
            blockLocalIndex,
            blockLastIndex
          );
          return {
            ...operation,
            ...newOp,
            operations: [
              ...(operation.operations ?? []),
              ...(newOp.operations ?? []),
            ],
            vector: sumVectors(
              operation.vector,
              "vector" in block ? block.vector : {},
              newOp.vector
            ),
          };
        }

        // Increment the local index by the duration of the current block
        const increment = !isFiniteNumber(duration) || !duration ? 1 : duration;
        localIndex += increment;

        // Break if the local index is beyond the end of the current block
        if (localIndex >= blockEndTime) break;
      }

      // Break if the local index is beyond the end of the parent stream
      if (localIndex >= lastIndex) break;
    }

    // Make sure that the local index is incremented
    if (localIndex === currentIndex) break;

    // Increment the current index by the duration of the parent stream
    currentIndex = localIndex;
  }

  // Return an empty vector if the offset is beyond all elements
  return { vector: {} };
};
