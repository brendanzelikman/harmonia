import { sortClipsByProximity } from "../ClipUtils";
import { createMapFromClipRange } from "../ClipUtils";
import { PoseClipMap } from "../ClipTypes";
import { PoseClip } from "./PoseClipTypes";
import { Tick } from "types/units";
import { getValueByKey, getDictValues } from "utils/objects";
import {
  getPoseVectorAtIndex,
  getVectorPitchClasses,
  sumPoseVectors,
} from "types/Pose/PoseFunctions";
import { isVoiceLeading, VoiceLeading } from "types/Pose/PoseTypes";
import { Pose, PoseId, PoseMap, PoseVector } from "types/Pose/PoseTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  isPatternMidiChord,
  isPatternMidiStream,
  PatternMidiStream,
} from "types/Pattern/PatternTypes";
import { ChromaticKey, ChromaticPitchClass } from "assets/keys";
import {
  getMidiStreamScale,
  getPatternMidiChordNotes,
} from "types/Pattern/PatternUtils";
import { mod } from "utils/math";
import { areScalesRelated } from "types/Scale/ScaleUtils";
import { getScaleWithNewNotes } from "types/Scale/ScaleTransformers";
import { getRotatedScale } from "types/Scale/ScaleTransformers";
import { MidiScale } from "types/units";
import { getMidiNoteValue } from "types/Scale/ScaleFunctions";
import { isPitchClass } from "utils/pitchClass";

/** Get the `PoseClips` of a given track from a list of clips. */
export const getPoseClipsByTrackId = (
  clipMap?: PoseClipMap,
  trackId?: TrackId
): PoseClip[] => {
  if (!clipMap || !trackId) return [];
  const clips = getDictValues(clipMap);
  return clips.filter((c) => c.trackId === trackId);
};

/** Filter a list of pose clips so all are voice leadings. */
export const getPoseVectorsWithVoiceLeadings = (vectors: PoseVector[]) => {
  return vectors.filter((vector) =>
    Object.keys(vector).some((key) => isPitchClass(key) && key in vector)
  );
};

/** Get the current pose vector occurring at the given tick. */
export const getPoseVectorAtIndexByTick = (
  clip?: PoseClip,
  pose?: Pose,
  tick?: number
) => {
  if (!clip || !pose || tick === undefined) return {};
  return getPoseVectorAtIndex(pose, tick - clip.tick, clip.duration);
};

/** Get the current pose occurring at or before the given tick. */
export const getPoseVectorAtTick = (
  clips: PoseClip[],
  poseMap?: PoseMap,
  tick: Tick = 0
) => {
  let offset = {} as PoseVector;

  // Make sure there R
  const clipCount = clips.length;
  if (!clipCount || !poseMap) return offset;

  // Make sure the clip has an existing pose
  const guard = (clip: PoseClip) =>
    getValueByKey(poseMap, clip.poseId) !== undefined;

  // Map a pose clip to the current pose vector and sum it with the offset
  const map = (clip: PoseClip, tick: number) => {
    const pose = poseMap[clip.poseId];
    const vector = getPoseVectorAtIndexByTick(clip, pose, tick);
    offset = sumPoseVectors(offset, vector);
  };

  // Imperatively sum all relevant vectors to the offset
  sortClipsByProximity(clips, tick, guard, map);

  // Return the offset
  return offset;
};

/** Get the current pose occurring at or before the given tick. */
export const getCurrentVoiceLeadings = (
  clips: PoseClip[],
  poseMap?: PoseMap,
  tick: Tick = 0
) => {
  let offsets: VoiceLeading[] = [];

  // Make sure there R
  const clipCount = clips.length;
  if (!clipCount || !poseMap) return offsets;

  // Make sure the clip has an existing pose
  const guard = (clip: PoseClip) =>
    getValueByKey(poseMap, clip.poseId) !== undefined;

  // Map a pose clip to the current pose vector and sum it with the offset
  const map = (clip: PoseClip, tick: number) => {
    const pose = poseMap[clip.poseId];
    const vector = getPoseVectorAtIndexByTick(clip, pose, tick);
    if (isVoiceLeading(vector)) offsets.push(vector);
  };

  // Imperatively sum all relevant vectors to the offset
  sortClipsByProximity(clips, tick, guard, map);

  // Return the offset
  return offsets;
};

/** Apply a list of voice leadings to a pattern stream. */
export const applyVoiceLeadingsToMidiStream = <
  T extends MidiScale | PatternMidiStream
>(
  midiStream: T,
  voiceLeadings: VoiceLeading[]
): T => {
  let stream = midiStream;

  // Iterate through the voice leadings
  for (const vector of voiceLeadings) {
    let offset = -1;

    // Get the pitch classes of the voice leading
    const pitchClasses = getVectorPitchClasses(vector) as ChromaticPitchClass[];
    if (pitchClasses.some((c) => !ChromaticKey.includes(c))) continue;

    // Get the modes of the stream scale
    const streamScale = getMidiStreamScale(stream);
    const streamScaleSize = streamScale.length;

    // Find the mode of the stream that relates to the voice leading
    const scale = pitchClasses.map((c) => ChromaticKey.indexOf(c));
    for (let j = 0; j < streamScaleSize; j++) {
      const mode = getRotatedScale(streamScale, j);
      if (areScalesRelated(scale, mode)) {
        offset = mode[0] - scale[0];
        break;
      }
    }
    if (offset < 0) break;

    // Apply the voice leading to all MIDI chords in the stream
    // and check the transposed note against the voice leading
    if (isPatternMidiStream(stream)) {
      stream = stream.map((block) => {
        if (!isPatternMidiChord(block)) return block;
        const notes = getPatternMidiChordNotes(block);
        return notes.map((note) => {
          const idx = mod(note.MIDI - offset, 12);
          const pitchClass = ChromaticKey[idx];
          return { ...note, MIDI: note.MIDI + (vector[pitchClass] ?? 0) };
        });
      }) as T;
    } else {
      stream = getScaleWithNewNotes(
        stream,
        stream.map((n) => {
          const midi = getMidiNoteValue(n);
          const idx = mod(midi - offset, 12);
          const pitchClass = ChromaticKey[idx];
          return { MIDI: midi + (vector[pitchClass] ?? 0) };
        })
      ) as T;
    }
  }

  return stream;
};

/** Get a map of ticks to pose vectors based on the pose clips and tick range. */
export const getPoseVectorMapFromTickRange = (
  clips: PoseClip[],
  poseMap: Record<PoseId, Pose>,
  tickRange: [number, number]
) => {
  // Make sure the clip has an existing pose
  const guard = (clip: PoseClip) =>
    getValueByKey(poseMap, clip.poseId) !== undefined;

  // Map a pose clip to the current pose vector
  const map = (clip: PoseClip, tick: number) => {
    const pose = poseMap[clip.poseId];
    const vector = getPoseVectorAtIndexByTick(clip, pose, tick);
    return vector;
  };

  // Create and return the map
  return createMapFromClipRange<"pose", PoseVector>(
    clips,
    tickRange,
    guard,
    map
  );
};
