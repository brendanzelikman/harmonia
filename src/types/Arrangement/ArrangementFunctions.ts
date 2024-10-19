import { Tick } from "types/units";
import { isFiniteNumber } from "types/util";
import { TrackArrangement } from "./ArrangementTypes";
import { PatternClipMidiStream } from "types/Clip/ClipTypes";
import { PatternClip } from "types/Clip/PatternClip/PatternClipTypes";
import {
  getPatternBlockAtIndex,
  getPatternStrummedChordNotes,
  getPatternDuration,
  getPatternBlockDuration,
} from "types/Pattern/PatternFunctions";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import { getTransposedPatternStream } from "types/Pattern/PatternFunctions";
import { resolvePatternStreamToMidi } from "types/Pattern/PatternResolvers";
import {
  Pattern,
  isPatternMidiChord,
  isPatternStrummedChord,
  PatternStream,
  PatternMidiStream,
  PatternBlock,
} from "types/Pattern/PatternTypes";
import { getPoseVectorAsScaleVector } from "types/Pose/PoseFunctions";
import {
  getNewScale,
  getTransposedScaleNote,
} from "types/Scale/ScaleTransformers";
import {
  getTransposedScale,
  getRotatedScale,
} from "types/Scale/ScaleTransformers";
import { ScaleObject } from "types/Scale/ScaleTypes";
import {
  getScaleTrackChain,
  getTrackAncestorIds,
} from "types/Track/TrackFunctions";
import { isTrackId, TrackId } from "types/Track/TrackTypes";
import { getValueByKey } from "utils/objects";
import { MotifState } from "types/Motif/MotifTypes";
import { getPatternClipStartingBlock } from "types/Clip/PatternClip/PatternClipFunctions";
import {
  getPoseClipsByTrackId,
  getPoseOperationsAtTick,
  applyVoiceLeadingsToMidiStream,
} from "types/Clip/PoseClip/PoseClipFunctions";
import {
  getScaleClipsByTrackId,
  getMostRecentScaleFromClips,
} from "types/Clip/ScaleClip/ScaleClipFunctions";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import {
  getVectorKeys,
  getVectorValue,
  mergeVectorKeys,
  sumVectors,
} from "utils/vector";
import { isVoiceLeading } from "types/Pose/PoseTypes";
import { isNumber } from "lodash";

// ------------------------------------------------------------
// Arrangement Overview
// ------------------------------------------------------------

// The arrangement coordinates everything needed to produce the final MIDI output.
// To do so, it will iterate over every pattern clip and create a tick to note map.
// This is how we query a pattern clip:

// 1. Iterate over each tick of the pattern clip

// 2. Process the scale chain:
// - 2a. Get the scale chain of the track using its ancestors
// - 2b. Swap any scale in the chain given the appropriate scale clips
// - 2c. Transpose any scale in the chain given the appropriate pose vectors

// 3. Process the MIDI stream:
// - 3a. Realize the entire pattern stream given the current scale chain
// - 3b. Apply any pose vectors from the final track
// - 3c. Deal with strummed chords if necessary

// 4. Obtain the MIDI notes at the current tick

export interface PatternStreamDependencies extends TrackArrangement {
  clip: PatternClip;
  motifs: MotifState;
}

/** Get the stream of a `PatternClip` */
export const getPatternClipMidiStream = (
  deps: PatternStreamDependencies
): PatternClipMidiStream => {
  const { clip, motifs } = deps;
  const pattern = getValueByKey(motifs?.pattern?.entities, clip?.patternId);
  if (!clip || !pattern) return [];

  // 1. Iterate over each tick of the pattern clip:
  const stream: PatternClipMidiStream = [];
  loopOverClipStream(clip, pattern, (block, tick, index) => {
    // 2 + 3. Process the scale chain and find the MIDI stream
    const midiStream = getMidiStreamAtTickInTrack(pattern.stream, {
      ...deps,
      tick,
    });

    // 4. Obtain the MIDI notes at the current tick
    const midiChord = getPatternBlockAtIndex(midiStream, index);
    if (!isPatternMidiChord(midiChord)) return;

    // If the block is not strummed, just push the chord to the stream
    if (!isPatternStrummedChord(block)) {
      const newNotes = getPatternMidiChordNotes(midiChord);
      stream.push({ notes: newNotes, startTick: tick });
    }

    // Otherwise, deal with the strummed chord seprately
    else {
      const notes = getPatternStrummedChordNotes(block, tick, midiChord);
      stream.push(...notes);
    }

    // Return the duration of the midi chord to reflect transformations
    return getPatternBlockDuration(midiChord);
  });

  // Return the stream of the clip
  return stream;
};

// ------------------------------------------------------------
// 1: Iterate Over Each Tick
// ------------------------------------------------------------

/** Loop over the clip stream using its pattern and firing a callback on each tick. */
export const loopOverClipStream = (
  clip: PatternClip,
  pattern: Pattern,
  callback: (
    block: PatternBlock,
    tick: number,
    streamIndex: number
  ) => void | number
) => {
  const { stream } = pattern;
  let blockCount = getPatternClipStartingBlock(clip, pattern);
  let streamDuration = 0;

  // Iterate over every tick in the stream or repeat the pattern until the clip ends
  const totalTicks = !isFiniteNumber(clip.duration)
    ? getPatternDuration(pattern)
    : clip.duration;

  for (let i = 0; i < totalTicks; i++) {
    // Pass if the tick is in between blocks
    if (i < streamDuration) continue;

    // Break if the clip has a duration and the tick exceeds it
    if (clip.duration !== undefined && i >= clip.duration) break;

    // Get the block and its duration
    const block = getPatternBlockAtIndex(stream, blockCount++);
    let blockDuration = getPatternBlockDuration(block);

    // Fire the callback and try to update the block duration
    const res = callback(block, clip.tick + i, blockCount - 1);
    if (isNumber(res)) blockDuration = res;

    // Increment the total duration when the block is reached
    if (streamDuration === i) streamDuration += blockDuration;
  }
};

// ------------------------------------------------------------
// 2. Process the Scale Chain
// ------------------------------------------------------------

export interface TrackScaleChainDependencies extends TrackArrangement {
  tick?: Tick;
  motifs: MotifState;
}

/** Get the scale chain of a track by ID, transposing if a tick is specified.  */
export const getTrackScaleChain = (
  id: TrackId,
  deps: TrackScaleChainDependencies
) => {
  const { motifs, tick, ...arrangement } = deps;
  const poseMap = motifs?.pose?.entities;
  const scaleMap = motifs?.scale?.entities;
  const defaultChain: ScaleObject[] = [];
  const noTick = tick === undefined;
  if (!arrangement) return defaultChain;

  // Try to get the track from the arrangement
  const tracks = arrangement.tracks;
  const track = tracks[id];
  if (!track) return defaultChain;

  // Try to get the chain of scale tracks
  const trackChain = getScaleTrackChain(id, tracks);
  const chainLength = trackChain.length;
  if (!chainLength) return defaultChain;

  // Iterate through the tracks and create the scale chain
  const scaleChain: ScaleObject[] = [];
  for (let i = 0; i < chainLength; i++) {
    const track = trackChain[i];
    const scale = scaleMap?.[track.scaleId];
    if (!scale) return defaultChain;

    // If no tick is specified, just push the track's scale
    if (noTick) {
      scaleChain.push(scale);
      continue;
    }

    // Try to swap the scale using the most recent scale clip
    const scaleClips = getScaleClipsByTrackId(
      arrangement?.clips?.scale,
      track.id
    );
    const currentScale = getMostRecentScaleFromClips(
      scale,
      scaleClips,
      scaleMap,
      tick
    );

    // Try to get the vector at the current tick
    const poseClips = getPoseClipsByTrackId(arrangement?.clips?.pose, track.id);
    const operations = getPoseOperationsAtTick(poseClips, poseMap, tick);
    const vector = sumVectors(track.vector, ...operations.map((_) => _.vector));

    // If no vector exists, just push the scale
    if (!getVectorKeys(vector).length) {
      scaleChain.push(currentScale);
      continue;
    }

    // Otherwise, transpose the scale with every offset in the pose
    const vectorKeys = mergeVectorKeys(vector, tracks);

    // Apply track offsets to the scale
    let newScale = currentScale;
    for (const id of vectorKeys) {
      const offset = getVectorValue(vector, id);
      if (id === "chromatic") {
        newScale = getTransposedScale(newScale, offset);
      } else if (id === "chordal") {
        newScale = getRotatedScale(newScale, offset);
      } else if (id === "octave") {
        newScale = getTransposedScale(newScale, 12 * offset);
      } else if (isTrackId(id)) {
        const scaleId = trackChain.find((t) => t.id === id)?.scaleId;
        if (!scaleId) continue;
        newScale = getTransposedScale(newScale, offset, scaleId);
      }
    }

    if (isVoiceLeading(vector)) {
      // Apply voice leadings to the scale and push to the chain
      const midiScale = resolveScaleChainToMidi([...scaleChain, newScale]);
      const ledScale = applyVoiceLeadingsToMidiStream(
        midiScale,
        operations.map((_) => _.vector).filter(isVoiceLeading)
      );

      // Update the scale with its corresponding offset
      const notes = getScaleNotes(newScale);
      const newNotes = notes.map((_, i) =>
        getTransposedScaleNote(_, ledScale[i] - midiScale[i])
      );
      newScale = getNewScale(newScale, newNotes);
    }

    scaleChain.push(newScale);
  }

  // Return the transposed scale chain
  return scaleChain;
};

// ------------------------------------------------------------
// 3. Realize the MIDI Stream
// ------------------------------------------------------------
export interface PatternMidiStreamDependencies
  extends PatternStreamDependencies {
  tick: Tick;
}

/** Convert a pattern stream to MIDI notes at the given tick and trackId */
export const getMidiStreamAtTickInTrack = (
  stream?: PatternStream,
  deps?: PatternMidiStreamDependencies
): PatternMidiStream => {
  if (!stream || !deps) return [];
  const { tick } = deps;
  const { trackId } = deps.clip;
  const trackMap = deps.tracks;
  const clipMap = deps.clips?.pose;
  const poseMap = deps.motifs?.pose?.entities;

  // Get the accumulated operations summed from all track and ancestor clips
  const track = trackMap[trackId];
  const trackIds = [...getTrackAncestorIds(trackId, trackMap), trackId];
  const clips = trackIds.flatMap((id) => getPoseClipsByTrackId(clipMap, id));
  const operations = getPoseOperationsAtTick(clips, poseMap, tick);

  // Compute the current vector, then transpose the pattern stream
  const baseVector = track?.vector ?? {};
  const poseVector = sumVectors(baseVector, ...operations.map((_) => _.vector));
  const scaleVector = getPoseVectorAsScaleVector(poseVector, trackMap);
  const posedStream = getTransposedPatternStream(stream, scaleVector);

  // Resolve the pattern stream to MIDI using the scale chain and apply transformations
  const scales = getTrackScaleChain(trackId, deps);
  const transformations = [{ vector: baseVector }, ...operations];
  return resolvePatternStreamToMidi(posedStream, scales, transformations);
};
