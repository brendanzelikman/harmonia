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
import { getTransposedPatternStream } from "types/Pattern/PatternFunctions";
import { resolvePatternStreamToMidi } from "types/Pattern/PatternResolvers";
import {
  Pattern,
  PatternStream,
  PatternMidiStream,
  PatternBlock,
  PatternStrummedChord,
  isPatternStrummedChord,
  isPatternMidiChord,
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
import { isTrackId, TrackId } from "types/Track/TrackTypes";
import { getArrayByKey, getValueByKey } from "utils/objects";
import { MotifState } from "types/Motif/MotifTypes";
import { getPatternClipStartingBlock } from "types/Clip/PatternClip/PatternClipFunctions";
import {
  getPoseOperationsAtTick,
  applyVoiceLeadingsToMidiStream,
} from "types/Clip/PoseClip/PoseClipFunctions";
import { getMostRecentScaleFromClips } from "types/Clip/ScaleClip/ScaleClipFunctions";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import { mergeVectorKeys, sumVectors } from "utils/vector";
import { isVoiceLeading } from "types/Pose/PoseTypes";
import { isNumber, some } from "lodash";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";

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
  if (!pattern) return [];

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

    // If the block is strummed, deal with it accordingly
    if (isPatternStrummedChord(block)) {
      const notes = getPatternStrummedChordNotes(
        midiChord as PatternStrummedChord,
        tick,
        midiChord
      );
      stream.push(...notes);
    } else {
      const newNotes = getPatternMidiChordNotes(midiChord);
      stream.push({ notes: newNotes, startTick: tick });
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
    if (i < streamDuration) {
      i = streamDuration - 1;
      continue;
    }

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
  const { motifs, tick, tracks } = deps;
  const scaleMap = motifs?.scale?.entities;
  const poseMap = motifs?.pose?.entities;
  const noTick = tick === undefined;

  // Try to get the chain of scale tracks
  const chainIds = deps.chainIdsByTrack[id] ?? [];
  const chainLength = chainIds.length;

  // Iterate through the tracks and create the scale chain
  const scaleChain: ScaleObject[] = [];
  for (let i = 0; i < chainLength; i++) {
    const track = tracks[chainIds[i]] as ScaleTrack | undefined;
    const scale = getArrayByKey(scaleMap, track?.scaleId);
    if (!track || !scale) return [];

    // If no tick is specified, just push the track's scale
    if (noTick) {
      scaleChain.push(scale);
      continue;
    }

    // Try to swap the scale using the most recent scale clip
    let currentScale = scale;
    const scaleClips = deps.clipsByTrack?.[track.id]?.scale ?? [];
    if (scaleClips.length) {
      currentScale = {
        ...getMostRecentScaleFromClips(scale, scaleClips, scaleMap, tick),
        id: scale.id,
      };
    }

    // Try to get the vector at the current tick
    let vector = track.vector;
    let operations = [];
    const poseClips = deps.clipsByTrack?.[track.id]?.pose ?? [];
    if (poseClips.length) {
      operations.push(...getPoseOperationsAtTick(poseClips, poseMap, tick));
      vector = sumVectors(vector, ...operations.map((_) => _.vector));
    }
    // If no vector exists, just push the scale
    if (!vector || !some(vector)) {
      scaleChain.push(currentScale);
      continue;
    }

    // Otherwise, transpose the scale with every offset in the pose
    const vectorKeys = mergeVectorKeys(vector, tracks);

    // Apply track offsets to the scale
    let newScale = currentScale;
    for (const id of vectorKeys) {
      const offset = vector[id] ?? 0;
      if (id === "chromatic") {
        newScale = getTransposedScale(newScale, offset);
      } else if (id === "chordal") {
        newScale = getRotatedScale(newScale, offset);
      } else if (id === "octave") {
        newScale = getTransposedScale(newScale, 12 * offset);
      } else if (isTrackId(id)) {
        const chainId = chainIds.find((i) => i === id);
        if (!chainId) continue;
        const scaleId = (tracks[chainId] as ScaleTrack)?.scaleId;
        if (!scaleId) continue;
        newScale = getTransposedScale(newScale, offset, scaleId);
      }
    }

    // Apply voice leadings to the scale and push to the chain
    if (isVoiceLeading(vector)) {
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

    // Push the new scale to the chain
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
  stream: PatternStream,
  deps: PatternMidiStreamDependencies
): PatternMidiStream => {
  const { tick, clip, clipsByTrack } = deps;
  const { trackId } = clip;
  const poseMap = deps.motifs?.pose?.entities;

  // Get the accumulated operations at the current tick of the clip's track
  const track = deps.tracks[trackId];
  const poseClips = clipsByTrack[trackId]?.pose ?? [];
  const clipOperations = getPoseOperationsAtTick(poseClips, poseMap, tick);
  const operations = [{ vector: track?.vector }, ...clipOperations];

  // Transpose any scale notes that are targeted by the operations
  const poseVector = sumVectors(...operations.map((_) => _.vector));
  const scaleVector = getPoseVectorAsScaleVector(poseVector, deps.tracks);
  const posedStream = getTransposedPatternStream(stream, scaleVector);

  // Resolve the pattern stream to MIDI using the current scales of the track
  const scales = getTrackScaleChain(trackId, deps);
  return resolvePatternStreamToMidi(posedStream, scales, operations);
};
