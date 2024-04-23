import {
  PatternClip,
  PatternClipMidiStream,
  PoseClip,
  getCurrentPoseClipVector,
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
  getPatternStreamDuration,
  getPatternBlockDuration,
  getTransposedPatternStream,
  resolvePatternStreamToMidi,
  isPatternChord,
  isPatternStrummedChord,
  getPatternChordNotes,
  isPatternMidiChord,
  getPatternMidiChordNotes,
  PatternMidiNote,
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

    // Try to get the vector at the current tick
    const poseClips = getPoseClipsByTrackId(clips, track.id);
    const vector = getCurrentPoseClipVector(poseClips, poses, tick, false);

    // If no vector exists, just push the scale
    if (!vector) {
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
): PatternClipMidiStream => {
  const { trackId } = clip;
  const { pattern, poses, scales, ...arrangement } = deps;
  const tracks = arrangement?.tracks ?? {};
  const clips = arrangement?.clips ?? {};
  if (!pattern) return [];

  // Initialize the loop variables
  const stream: PatternClipMidiStream = [];
  const streamLength = pattern.stream.length;
  let blockCount = 0;
  let streamDuration = 0;
  const totalTicks = getPatternStreamDuration(pattern.stream);

  // Get the offset of the clip
  let storedOffset = 0;
  for (let i = 0; i < streamLength; i++) {
    if (storedOffset >= (clip.offset ?? 0)) break;
    const duration = getPatternBlockDuration(pattern.stream[i]);
    storedOffset += duration;
    blockCount += 1;
  }

  // Get the pose clips in the clip's track
  const poseClips = getPoseClipsByTrackId(Object.values(clips), trackId);

  // Create a stream of blocks for every tick
  for (let i = 0; i < totalTicks; i++) {
    if (i < streamDuration) continue;
    if (clip.duration !== undefined && i >= clip.duration) break;

    const block = pattern.stream[blockCount];
    const blockDuration = getPatternBlockDuration(block);

    // Increment the stream duration when the block is reached
    if (streamDuration === i) streamDuration += blockDuration;
    blockCount += 1;
    if (!isPatternChord(block)) continue;

    // Get the notes and size of the chord
    const notes = getPatternChordNotes(block);
    const noteCount = notes.length;

    // Transpose the pattern stream using the clip's current pose
    const tick = clip.tick + i;
    const vector = getCurrentPoseClipVector(poseClips, poses, tick);

    // Filter the vector through the tracks and transpose the pattern stream
    const scaleVector = getPoseVectorAsScaleVector(vector, tracks);
    const posedStream = getTransposedPatternStream(pattern.stream, scaleVector);

    // Get the transposed scale chain using the arrangement at the current tick
    const chain = getTrackScaleChain(trackId, { ...deps, tick });

    // Get the resolved MIDI stream using the current stream and scale chain.
    // The pose vector is provided to apply chromatic/chordal offsets at the end.
    const newStream = resolvePatternStreamToMidi(posedStream, chain, vector);
    const newChord = newStream[blockCount - 1];
    if (!isPatternMidiChord(newChord)) continue;

    // If the block is not strummed, just push the chord to the stream
    if (!isPatternStrummedChord(block)) {
      const newNotes = getPatternMidiChordNotes(newChord);
      stream.push({ notes: newNotes, startTick: tick });
      continue;
    }

    // Otherwise, extract the properties of the strummed chord
    const strummedChord = block as StrummedChord<PatternMidiNote>;
    const strumDirection = strummedChord.strumDirection ?? "up";
    const strumRange = block.strumRange ?? [0, 0];
    const start = strumRange[0];
    const end = strumRange[1];
    const strumDuration = start + end;
    const strumStep = strumDuration / Math.max(1, noteCount - 1);
    const strumNotes = getPatternMidiChordNotes(newChord);

    // Add the notes to the current index of the stream, offset by the strum range
    for (let j = 0; j < noteCount; j++) {
      // Get the index of the note to add based on the strum direction
      const index = strumDirection === "up" ? j : noteCount - j - 1;

      // Get the offset by stepping along the strum range, clamping to the stream
      let offset = j * Math.round(strumStep) - start;

      // If there is one note, apply the strum range
      if (noteCount === 1) offset = end - start;

      // If the offset goes negative, clamp it to the stream
      const strummedTick = tick + offset;
      if (strummedTick < 0) offset = Math.max(-tick, offset);

      // Get the new note and adjust its duration
      const note = strumNotes[index];
      const startTick = clip.tick + i + offset;

      // The new note has at least its inital duration, plus the distance until the end
      const newNote = {
        ...note,
        duration: note.duration + strumDuration - offset,
      };
      const block = { notes: [newNote], startTick, strumIndex: j };

      // Push the block to the stream
      stream.push(block);
    }
  }

  // Return the stream of the clip
  return stream;
};
