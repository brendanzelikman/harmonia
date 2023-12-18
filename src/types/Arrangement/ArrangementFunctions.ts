import {
  PatternClip,
  PoseClip,
  getCurrentPoseClip,
  getPoseClipsByTrackId,
  getPoseVectorAtTick,
} from "types/Clip";
import {
  PoseMap,
  getPoseVectorAsScaleVector,
  getVectorKeys,
  getVectorOffsetById,
} from "types/Pose";
import {
  ScaleMap,
  ScaleObject,
  chromaticScale,
  getRotatedScale,
  getTransposedScale,
} from "types/Scale";
import { TrackId, getScaleTrackChain } from "types/Track";
import { StrummedChord, Tick } from "types/units";
import { getValueByKey } from "utils/objects";
import { TrackArrangement } from "./ArrangementTypes";
import {
  Pattern,
  PatternMidiStream,
  getPatternStreamDuration,
  getPatternBlockDuration,
  getTransposedPatternStream,
  resolvePatternStreamToMidi,
  isPatternChord,
  isPatternStrummedChord,
  getPatternChordNotes,
  isPatternMidiNote,
  isPatternMidiChord,
  getPatternMidiChordNotes,
  PatternMidiNote,
  isPatternRest,
} from "types/Pattern";

// ------------------------------------------------------------
// Track Scale Chain
// ------------------------------------------------------------

/** A track scale chain is dependent on the arrangement. */
export interface TrackScaleChainDependencies extends Partial<TrackArrangement> {
  tick?: Tick;
  scales?: ScaleMap;
  poses?: PoseMap;
}

/** Get the scale chain of a track by ID, transposing if a tick is specified.  */
export const getTrackScaleChain = (
  id: TrackId,
  deps: TrackScaleChainDependencies
) => {
  const { scales, poses, tick, ...arrangement } = deps;
  const defaultChain = [chromaticScale];
  const noTick = tick === undefined;
  if (!arrangement) return defaultChain;

  // Try to get the track from the arrangement
  const tracks = arrangement.tracks ?? {};
  const track = tracks[id];
  if (!track) return defaultChain;

  // Try to get the chain of scale tracks
  const trackChain = getScaleTrackChain(id, tracks);
  const chainLength = trackChain.length;
  if (!chainLength) return defaultChain;

  // Initialize the loop variables
  const clips = Object.values(arrangement.clips ?? {});
  const scaleChain: ScaleObject[] = [];

  // Iterate through the tracks and create the scale chain
  for (let i = 0; i < chainLength; i++) {
    // Get the track and scale
    const track = trackChain[i];
    const scale = scales?.[track.scaleId] ?? chromaticScale;

    // If no tick is specified, just push the scale to the chain
    if (noTick) {
      scaleChain.push(scale);
      continue;
    }

    // Try to get the pose at the current tick
    const poseClips = getPoseClipsByTrackId(clips, track.id);
    const poseClip = getCurrentPoseClip(poseClips, tick, false);
    const pose = getValueByKey(poses, poseClip?.poseId);
    const vector = getPoseVectorAtTick(poseClip, pose, tick);

    // If no pose exists, just push the scale
    if (pose === undefined) {
      scaleChain.push(scale);
      continue;
    }

    // Otherwise, transpose the scale with every offset in the pose
    const vectorKeys = getVectorKeys(vector, tracks);

    // Iterate through the offsets and transpose the scale
    let newScale = scale;
    for (const id of vectorKeys) {
      const offset = getVectorOffsetById(vector, id);
      if (id === "chromatic") {
        newScale = getTransposedScale(newScale, offset);
      } else if (id === "chordal") {
        newScale = getRotatedScale(newScale, offset);
      } else {
        const scaleId = trackChain.find((t) => t.id === id)?.scaleId;
        if (!scaleId) continue;
        newScale = getTransposedScale(newScale, offset, scaleId);
      }
    }

    // Push the transposed scale to the chain
    scaleChain.push(newScale);
  }

  // Return the transposed scale chain
  return scaleChain;
};

// -------------------------------------------- ----------------
// Clip Stream
// ------------------------------------------------------------

/** A `PoseClip` needs access to all poses to get its stream. */
export interface PoseStreamDependencies {
  poses: PoseMap;
}

/** Get the stream of a `PoseClip`, stopping at any block without a duration. */
export const getPoseClipStream = (
  clip: PoseClip,
  deps: PoseStreamDependencies
) => {
  const { poses } = deps;
  const { poseId } = clip;
  const pose = getValueByKey(poses, poseId);
  if (!pose) return [];

  // Initialize the loop variables
  const stream = [];
  let blockCount = 0;
  let streamDuration = 0;

  // Create a stream of blocks for every tick
  for (let i = 0; i < pose.stream.length; i++) {
    const block = pose.stream[blockCount];
    if (streamDuration > i) continue;
    if (block.duration === undefined) {
      stream.push(block);
      break;
    }
    if (streamDuration === i) streamDuration += block.duration;
    blockCount += 1;
    stream.push(block);
  }

  // Return the stream of the clip
  if (clip.duration === undefined) return stream;
  return stream.slice(0, clip.duration);
};

/** A `PatternClip` can require the entire arrangement to compute its stream. */
export interface PatternStreamDependencies extends Partial<TrackArrangement> {
  pattern: Pattern;
  scales?: ScaleMap;
  poses?: PoseMap;
}

/** Get the stream of a `PatternClip` */
export const getPatternClipStream = (
  clip: PatternClip,
  deps: PatternStreamDependencies
): PatternMidiStream => {
  const { trackId } = clip;
  const { pattern, poses, scales, ...arrangement } = deps;
  const tracks = arrangement?.tracks ?? {};
  const clips = arrangement?.clips ?? {};
  if (!pattern) return [];

  // Initialize the loop variables
  const stream = [] as PatternMidiStream;
  let blockCount = 0;
  let streamDuration = 0;
  const totalTicks = getPatternStreamDuration(pattern.stream);

  // Get the offset of the clip
  let storedOffset = 0;
  for (let i = 0; i < pattern.stream.length; i++) {
    if (storedOffset >= (clip.offset ?? 0)) break;
    const duration = getPatternBlockDuration(pattern.stream[i]);
    storedOffset += duration;
    blockCount += 1;
  }

  // Get the pose clips in the clip's track
  const poseClips = getPoseClipsByTrackId(Object.values(clips), trackId);

  // Create a stream of blocks for every tick
  for (let i = 0; i < totalTicks; i++) {
    const block = pattern.stream[blockCount];

    // If a block is being played or there's no block, continue
    if (streamDuration > i || !block) {
      stream.push([]);
      continue;
    }

    // Increment the stream duration when the block is reached
    const blockDuration = getPatternBlockDuration(block);
    if (streamDuration === i) streamDuration += blockDuration;
    blockCount += 1;

    // If the block is a rest, add it and skip to the next block
    if (!isPatternChord(block)) {
      stream.push({ duration: blockDuration });
      continue;
    }

    const notes = getPatternChordNotes(block);
    const noteCount = notes.length;

    // Otherwise, transpose the pattern stream using the clip's current pose
    const tick = clip.tick + i;
    const poseClip = getCurrentPoseClip(poseClips, tick, false);
    const pose = getValueByKey(poses, poseClip?.poseId);
    const poseClipVector = getPoseVectorAtTick(poseClip, pose, tick);

    // Filter the vector through the tracks and transpose the pattern stream
    const scaleVector = getPoseVectorAsScaleVector(poseClipVector, tracks);
    const posedStream = getTransposedPatternStream(pattern.stream, scaleVector);

    // Get the transposed scale chain using the arrangement at the current tick
    const chain = getTrackScaleChain(trackId, { ...deps, tick });

    // Get the resolved MIDI stream using the current stream and scale chain.
    // The pose vector is provided to apply chromatic/chordal offsets at the end.
    const newStream = resolvePatternStreamToMidi(
      posedStream,
      chain,
      poseClipVector
    );
    const newChord = newStream[blockCount - 1];

    // If the block is not strummed, just push the chord to the stream
    if (!isPatternStrummedChord(block) || isPatternRest(newChord)) {
      stream.push(newChord);
      continue;
    }

    // Otherwise, extract the properties of the strummed chord
    const strummedChord = block as StrummedChord<PatternMidiNote>;
    const strumDirection = strummedChord.strumDirection ?? "up";
    const strumRange = block.strumRange ?? [0, 0];
    const strumDuration = strumRange[1] + strumRange[0];
    const strumStep = strumDuration / noteCount;

    // Get the notes of the strummed chord
    const strumNotes = getPatternMidiChordNotes(newChord);

    // Add the notes to the current index of the stream, offset by the strum range
    const currentIndex = stream.length;
    for (let j = 0; j < noteCount; j++) {
      // Get the index of the note to add based on the strum direction
      const index = strumDirection === "up" ? j : noteCount - j - 1;

      // Get the offset by stepping along the strum range, clamping to the stream
      let offset = j * Math.round(strumStep) - strumRange[0];

      const strummedTick = currentIndex + offset;
      if (strummedTick < 0) offset = Math.max(-currentIndex, offset);

      // Get the new note and adjust its duration
      const note = strumNotes[index];
      const newNote = { ...note, duration: note.duration - offset };

      // Find the target block based on the strum offset
      const currentBlock = stream[strummedTick];

      // If the target block is empty, add the note to the stream
      if (!isPatternMidiChord(currentBlock)) {
        stream[strummedTick] = [newNote];
      }

      // If the target block is a note, replace it with a chord
      else if (isPatternMidiNote(currentBlock)) {
        stream[strummedTick] = [currentBlock, newNote];
      }

      // Otherwise, push the note to the target block
      else {
        stream[currentIndex + offset] = [
          ...getPatternMidiChordNotes(currentBlock),
          newNote,
        ];
      }
    }

    // Fill in the rest of the stream with empty arrays if necessary
    const lastIndex = currentIndex + strumDuration;
    for (let j = currentIndex; j < lastIndex; j++) {
      if (!stream[j]) stream[j] = [];
    }
  }

  // Return the stream of the clip
  if (clip.duration === undefined) return stream;
  return stream.slice(0, clip.duration);
};
