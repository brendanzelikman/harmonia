import { Tick } from "types/units";
import { isFiniteNumber } from "types/util";
import { TrackArrangement } from "./ArrangementTypes";
import { PatternClipMidiStream } from "types/Clip/ClipTypes";
import { PatternClip } from "types/Clip/PatternClip/PatternClipTypes";
import {
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
  isPatternRest,
  isPatternStrummedMidiChord,
  PatternState,
} from "types/Pattern/PatternTypes";
import { getPoseVectorAsScaleVector } from "types/Pose/PoseFunctions";
import {
  getRotatedScaleNotes,
  getTransposedScaleNote,
  getTransposedScaleNotes,
} from "types/Scale/ScaleTransformers";
import { isNestedNote, ScaleObject, ScaleState } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";
import { getPatternClipStartingBlock } from "types/Clip/PatternClip/PatternClipFunctions";
import {
  getPoseOperationsAtTick,
  applyVoiceLeadingsToMidiStream,
} from "types/Clip/PoseClip/PoseClipFunctions";
import {
  resolveScaleChainToMidi,
  resolveScaleNoteToMidi,
} from "types/Scale/ScaleResolvers";
import { sumVectors } from "utils/vector";
import {
  PoseOperation,
  PoseState,
  PoseVector,
  VoiceLeading,
} from "types/Pose/PoseTypes";
import { isNumber } from "lodash";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import { getMidiNoteValue, getMidiOctaveDistance } from "utils/midi";
import { isPitchClass } from "utils/pitchClass";

// ------------------------------------------------------------
// Arrangement Overview
// ------------------------------------------------------------

// The arrangement coordinates everything needed to produce the final MIDI output.
// To do so, it will iterate over every pattern clip and create a tick to note map.
// This is how we process a pattern clip:

// 1. Iterate over each tick of the pattern clip

// 2. Process the scale chain:
// - 2a. Get the scale chain of the track using its ancestors
// - 2b. Swap any scale in the chain given the appropriate pose scales
// - 2c. Transpose any scale in the chain given the appropriate pose vectors

// 3. Process the MIDI stream:
// - 3a. Realize the entire pattern stream given the current scale chain
// - 3b. Apply any pose vectors from the final track
// - 3c. Deal with strummed chords if necessary

// 4. Obtain the MIDI notes at the current tick

export interface PatternStreamDependencies extends TrackArrangement {
  clip: PatternClip;
  scales: ScaleState;
  patterns: PatternState;
  poses: PoseState;
}

/** Get the stream of a `PatternClip` */
export const getPatternClipMidiStream = (
  deps: PatternStreamDependencies
): PatternClipMidiStream => {
  const { clip, patterns } = deps;
  const pattern = patterns.entities[clip.patternId];
  if (!pattern) return [];

  // Iterate over each tick of the pattern clip:
  const stream: PatternClipMidiStream = [];
  const streamLength = pattern.stream.length;
  if (!streamLength) return stream;

  loopOverClipStream(clip, pattern, (tick, index) => {
    // Get the MIDI stream at the current tick
    const streamDeps = { ...deps, tick };
    const { midiStream } = getMidiStreamAtTick(pattern.stream, streamDeps);

    // Get the MIDI chord by using the index of the clip
    const midiChord = midiStream[index % streamLength];
    if (midiChord === undefined) return;

    if (isPatternRest(midiChord)) {
      stream.push({
        notes: [{ duration: getPatternBlockDuration(midiChord) }],
        startTick: tick,
      });
    }

    // If the block is strummed, deal with it accordingly
    else if (isPatternStrummedMidiChord(midiChord)) {
      const notes = getPatternStrummedChordNotes(midiChord, tick, midiChord);
      stream.push(...notes);
    } else {
      const newNotes = getPatternMidiChordNotes(midiChord);
      stream.push({ notes: newNotes, startTick: tick });
    }

    // Return the duration of the midi chord to update the loop function
    return getPatternBlockDuration(midiChord);
  });

  return stream;
};

// ------------------------------------------------------------
// 1: Iterate Over Each Tick
// ------------------------------------------------------------

/** Loop over the clip stream using its pattern and firing a callback on each tick. */
export const loopOverClipStream = (
  clip: PatternClip,
  pattern: Pattern,
  callback: (tick: number, streamIndex: number) => void | number
) => {
  const { stream } = pattern;
  const streamLength = stream.length;
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
    const block = stream[blockCount++ % streamLength];
    let blockDuration = getPatternBlockDuration(block);

    // Fire the callback and try to update the block duration
    const res = callback(clip.tick + i, blockCount - 1);
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
  scales: ScaleState;
  patterns: PatternState;
  poses: PoseState;
}

/** Get the scale chain of a track by ID, transposing if a tick is specified.  */
export const getTrackScaleChain = (
  id: TrackId,
  deps: TrackScaleChainDependencies
) => {
  const { scales, tick, tracks } = deps;
  const noTick = tick === undefined;

  // Try to get the chain of scale tracks
  const chainIds = deps.chainIdsByTrack[id] ?? [];
  const chainLength = chainIds.length;

  // Iterate through the tracks and create the scale chain
  const scaleChain: ScaleObject[] = [];
  for (let i = 0; i < chainLength; i++) {
    const track = tracks[chainIds[i]] as ScaleTrack | undefined;
    if (track === undefined) continue;

    // Start with the scale of the track
    const trackScale = scales.entities[track?.scaleId];
    if (trackScale === undefined) return [];

    // If no tick is specified, just push the scale
    if (noTick) {
      scaleChain.push(trackScale);
      continue;
    }

    // Create a new scale object to avoid mutating the original
    const scale = { ...trackScale };
    const leadings: VoiceLeading[] = [];
    const vector: PoseVector = { ...(track.vector ?? {}) };

    // Get all pose operations in the track up to the current tick
    const poseMap = deps.poses.entities;
    const trackPoses = deps.trackPoseClips[track.id] ?? [];
    if (trackPoses.length) {
      const ops = getPoseOperationsAtTick(trackPoses, { poseMap, tick });

      // Iterate over each operation
      for (const op of ops) {
        const vec: PoseVector = op.vector ?? {};
        let leading = undefined;

        // Sum together all vectors
        for (const k in vec) {
          const key = k as keyof PoseVector;
          vector[key] = (vector[key] ?? 0) + (vec[key] ?? 0);
          if (isPitchClass(key)) (leading ??= {})[key] = vec[key];
        }

        // Add the operation's voice leadings if any were found
        if (leading !== undefined) leadings.push(leading as VoiceLeading);

        // Use the operation's scale if it has one
        if (op.scale !== undefined) scale.notes = op.scale;
      }
    }

    // If there are voice leadings, apply them to the scale
    if (leadings.length) {
      const baseMidi = resolveScaleChainToMidi([...scaleChain, scale]);
      const ledMidi = applyVoiceLeadingsToMidiStream(baseMidi, leadings);

      // Update the scale with its corresponding offset
      const parentMidi = resolveScaleChainToMidi(scaleChain);
      const parentSize = parentMidi.length;
      const parentPivot = parentSize / 2;
      const parentId = scaleChain.at(-1)?.id;

      scale.notes = scale.notes.map((_, i) => {
        // Find if the led note exists in the parent scale
        const baseNote = baseMidi[i];
        const ledNote = ledMidi[i];
        const index = parentMidi.findIndex((n) => n % 12 === ledNote % 12);

        // If no match is found, transpose the note chromatically
        if (index < 0 || !isNestedNote(_) || !parentId) {
          return getTransposedScaleNote(_, ledNote - baseNote);
        }

        // Otherwise, transpose the note within the parent scale
        let dist = index - _.degree;
        if (dist > parentPivot) dist -= parentSize;

        // Resolve the note again to compute octave
        const newNote = getTransposedScaleNote(_, dist, parentId);
        const newMidi = resolveScaleNoteToMidi(newNote, scaleChain);
        const octave = getMidiOctaveDistance(newMidi, ledNote);
        const offset = sumVectors(_.offset, { [parentId]: dist, octave });
        return { ..._, offset };
      });
    }

    // Apply any base offets that are in the vector
    const r = vector.chordal;
    const t = vector.chromatic;
    const y = vector.octave;
    if (r) {
      scale.notes = getRotatedScaleNotes(scale.notes, r);
    }
    if (t) {
      scale.notes = getTransposedScaleNotes(scale.notes, t, "chromatic");
    }
    if (y) {
      scale.notes = getTransposedScaleNotes(scale.notes, y, "octave");
    }

    // Apply any chain IDs that are in the vector
    for (const id of chainIds) {
      if (!(id in vector)) continue;
      const value = vector[id];
      const scaleId = (tracks[id] as ScaleTrack)?.scaleId;
      scale.notes = getTransposedScaleNotes(scale.notes, value, scaleId);
    }

    // Push the new scale to the chain
    scaleChain.push(scale);
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

export interface PatternMidiStreamReturn {
  midiStream: PatternMidiStream;
  scales: ScaleObject[];
  poseVector: PoseVector;
  operations: PoseOperation[];
}

/** Convert a pattern stream to MIDI notes at the given tick and trackId */
export const getMidiStreamAtTick = (
  stream: PatternStream,
  deps: PatternMidiStreamDependencies,
  _operations?: PoseOperation[]
): PatternMidiStreamReturn => {
  const track = deps.tracks[deps.clip.trackId];
  const poseClips = deps.trackPoseClips[deps.clip.trackId] ?? [];
  const poseMap = deps.poses.entities;
  const tick = deps.tick;

  // Get the track's scale at the current tick
  const scales = getTrackScaleChain(deps.clip.trackId, deps);

  // Get the accumulated operations at the current tick of the clip's track
  const clipOperations = getPoseOperationsAtTick(poseClips, { poseMap, tick });
  const operations = _operations ?? [
    { vector: track?.vector },
    ...clipOperations,
  ];

  // Transpose any scale notes that are targeted by the operations
  const poseVector = sumVectors(...operations.map((_) => _.vector));
  const scaleVector = getPoseVectorAsScaleVector(poseVector, deps.tracks);
  const posedStream = getTransposedPatternStream(stream, scaleVector);

  // Resolve the pattern stream to MIDI using the current scales of the track
  const midiStream = resolvePatternStreamToMidi(
    posedStream,
    scales,
    operations
  );
  return { midiStream, scales, poseVector, operations };
};

/** Get the canonical version of a midi stream */
export const getMidiStreamKey = (stream: PatternMidiStream) =>
  stream
    .map((_) =>
      isPatternRest(_)
        ? "r"
        : getPatternMidiChordNotes(_)
            .map((_) => getMidiNoteValue(_))
            .join(",")
    )
    .join(",");
