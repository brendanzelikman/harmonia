import { PoseClip } from "./PoseClipTypes";
import { Tick } from "types/units";
import { getVectorPitchClasses } from "types/Pose/PoseFunctions";
import { PoseOperation, VoiceLeading } from "types/Pose/PoseTypes";
import { PoseMap } from "types/Pose/PoseTypes";
import {
  isPatternMidiChord,
  isPatternMidiStream,
  PatternMidiStream,
} from "types/Pattern/PatternTypes";
import { ChromaticKey } from "assets/keys";
import {
  getMidiStreamIntrinsicScale,
  getPatternMidiChordNotes,
} from "types/Pattern/PatternUtils";
import { mod } from "utils/math";
import { areScalesRelated } from "types/Scale/ScaleUtils";
import { getNewScale } from "types/Scale/ScaleTransformers";
import { getRotatedScale } from "types/Scale/ScaleTransformers";
import { MidiScale } from "utils/midi";
import { getMidiValue } from "utils/midi";
import { isObject } from "lodash";

/** Get the current pose occurring at or before the given tick. */
export const getPoseOperationsAtTick = (
  clips: PoseClip[] = [],
  deps: { poseMap: PoseMap; tick: Tick } = { poseMap: {}, tick: 0 }
) => {
  const operation = [] as PoseOperation[];

  // Assuming the clips are sorted by tick, break after the last clip
  for (const clip of clips) {
    const startTick = clip.tick;
    if (startTick > deps.tick) break;
    const endTick = startTick + (clip.duration ?? Infinity);
    if (deps.tick >= startTick && deps.tick < endTick) {
      const pose = deps.poseMap[clip.poseId];
      if (!pose) continue;
      if (pose.reset) {
        operation.clear();
      }
      if ("scale" in pose) {
        operation.push({ scale: pose.scale });
      }
      if ("vector" in pose) {
        operation.push({ vector: pose.vector });
      }
      if ("operations" in pose) {
        for (const op of pose.operations ?? []) {
          operation.push({ operations: [op] });
        }
      }
    }
  }

  return operation;
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
    let offset = undefined;

    // Get the pitch classes of the voice leading
    const pitchClasses = getVectorPitchClasses(vector);

    // Get the modes of the stream scale
    const scale = pitchClasses.map((c) => ChromaticKey.indexOf(c));
    const streamScale = getMidiStreamIntrinsicScale(stream);
    const abridgedScale =
      scale.length !== streamScale.length
        ? streamScale.filter((n) => scale.includes(n % 12))
        : streamScale;
    const abridgedSize = abridgedScale.length;

    // Find the mode of the stream that relates to the voice leading
    for (let j = 0; j < abridgedSize; j++) {
      const mode = getRotatedScale(abridgedScale, j);
      if (areScalesRelated(scale, mode)) {
        offset = mode[0] - scale[0];
        break;
      }
    }
    if (offset === undefined) break;

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
      stream = getNewScale(
        stream,
        stream.map((n) => {
          const midi = getMidiValue(n);
          const idx = mod(midi - offset, 12);
          const pitchClass = ChromaticKey[idx];
          return midi + (vector[pitchClass] ?? 0);
        })
      ) as T;
    }
  }

  return stream;
};
