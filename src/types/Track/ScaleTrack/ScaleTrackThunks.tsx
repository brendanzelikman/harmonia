import { getArrayByKey, pickKeyByWeight } from "utils/objects";
import { addScale, updateScale } from "types/Scale/ScaleSlice";
import { capitalize, isEqual, sample, trim } from "lodash";
import { PresetScaleList, PresetScaleNotes } from "assets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { getScaleNoteDegree, getScaleNotes } from "types/Scale/ScaleFunctions";
import {
  ScaleObject,
  nestedChromaticNotes,
  ScaleArray,
  initializeScale,
  emptyScale,
  Scale,
  isNestedNote,
} from "types/Scale/ScaleTypes";
import { isScaleTrack } from "../TrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
  initializeScaleTrack,
  isScaleTrackId,
} from "./ScaleTrackTypes";
import { selectScaleMap } from "types/Scale/ScaleSelectors";
import {
  selectScaleTrackById,
  selectScaleTrackByScaleId,
  selectTopLevelTracks,
  selectTrackById,
  selectTrackByLabel,
  selectTrackMidiScale,
  selectTrackScaleChain,
} from "../TrackSelectors";
import { createUndoType, Payload, unpackData, unpackUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";
import {
  createCourtesyPatternClip,
  createPatternTrack,
} from "../PatternTrack/PatternTrackThunks";
import { autoBindNoteToTrack, convertMidiToNestedNote } from "../TrackUtils";
import { addTrack } from "../TrackThunks";
import { createSixteenthNote, createSixteenthRest } from "utils/durations";
import { createPattern, randomizePattern } from "types/Pattern/PatternThunks";
import { addClip } from "types/Clip/ClipSlice";
import { initializePatternClip } from "types/Clip/ClipTypes";
import {
  isPatternRest,
  PatternId,
  PatternNestedNote,
  PatternStream,
} from "types/Pattern/PatternTypes";
import {
  getPatternBlockNotes,
  PatternScaleNotes,
  PatternScales,
} from "types/Pattern/PatternUtils";
import { getTransposedScale } from "types/Scale/ScaleTransformers";
import { promptUserForString } from "utils/html";
import { getScaleAliases, getScaleName } from "utils/scale";
import {
  getMidiOctaveNumber,
  getMidiPitchClass,
  getPitchClassNumber,
  MidiScale,
} from "utils/midi";
import { isPitchClass, unpackScaleName } from "utils/pitchClass";
import { MajorScale, MinorScale } from "assets/scales/BasicScales";
import {
  resolveScaleChainToMidi,
  resolveScaleNoteToMidi,
} from "types/Scale/ScaleResolvers";
import { promptLineBreak } from "components/PromptModal";
import { getPatternBlockAtIndex } from "types/Pattern/PatternFunctions";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { updatePatternNote } from "types/Pattern/PatternSlice";
import { DEFAULT_VELOCITY } from "utils/constants";

/** Create a `ScaleTrack` with an optional initial track. */
export const createScaleTrack =
  (
    payload: Payload<{ track?: Partial<ScaleTrack>; scale?: ScaleObject }>
  ): Thunk<ScaleTrack> =>
  (dispatch, getProject) => {
    const project = getProject();
    const data = unpackData(payload);
    const undoType = unpackUndoType(payload, "createScaleTrack");
    const initialTrack = data.track;
    const scaleNotes = data.scale?.notes;
    const scaleMap = selectScaleMap(project);
    const topLevelTracks = selectTopLevelTracks(project);

    // Get the parent track of the initial track to inherit the scale
    const parentId = initialTrack?.parentId;
    const parentTrack = isScaleTrackId(parentId)
      ? selectScaleTrackById(project, parentId)
      : undefined;
    const parentScale = getArrayByKey(scaleMap, parentTrack?.scaleId);
    const parentNotes = parentScale?.notes ?? nestedChromaticNotes;

    // Create a new scale for the track
    const notes: ScaleArray = scaleNotes
      ? getScaleNotes(scaleNotes)
      : parentNotes.map((_, i) => ({ degree: i, scaleId: parentScale?.id }));
    const scale = initializeScale({ notes });

    // Create and add the scale track and scale
    const scaleTrack = initializeScaleTrack({
      ...initialTrack,
      scaleId: scale.id,
      order: !!initialTrack?.parentId
        ? parentTrack?.trackIds?.length ?? 0
        : topLevelTracks.length,
    });
    dispatch(
      addScale({ data: { ...scale, trackId: scaleTrack.id }, undoType })
    );
    dispatch(addTrack({ data: scaleTrack, undoType }));

    // Return the ID of the scale track
    return scaleTrack;
  };

/** Create a random hierarchy of `ScaleTracks` */
export const createRandomHierarchy = (): Thunk => (dispatch) => {
  const size = 3;
  const undoType = createUndoType("createRandomHierarchy", nanoid());

  // The root scale is 7-12 notes
  const map1: Record<string, number> = {
    7: 0.3,
    8: 0.2,
    9: 0.1,
    10: 0.1,
    11: 0.1,
    12: 0.2,
  };

  // The second scale is 4-7 notes
  const map2: Record<string, number> = {
    4: 0.2,
    5: 0.3,
    6: 0.2,
    7: 0.3,
  };

  // The third scale is 3-4 notes
  const map3: Record<string, number> = {
    3: 0.65,
    4: 0.35,
  };

  const scales: ScaleObject[] = [];

  // Pick a random scale by using the weights and sampling from all presets,
  // restricting the scales to the parent notes
  const getScale = (weights: Record<string, number>) => {
    const map = weights;
    const parent = resolveScaleChainToMidi(scales);
    while (Object.keys(map).length) {
      const size = parseInt(pickKeyByWeight(map));
      const filter = (s: ScaleObject) =>
        s.notes.length === size &&
        (!scales.length ||
          s.notes.every((n) =>
            parent.some(
              (p) => getScaleNoteDegree(p) % 12 === getScaleNoteDegree(n) % 12
            )
          ));
      const scaleMatches = PresetScaleList.filter(filter);
      const patternMatches = PatternScales.filter(filter);
      const matches = [...scaleMatches, ...patternMatches];
      const scale = sample(matches);
      if (!scales.length) return initializeScale(scale);
      if (!scale || !scale.notes.length || isEqual(scale.notes, parent)) {
        delete map[size];
        continue;
      }
      return initializeScale({
        ...scale,
        notes: (scale.notes as number[]).map((n) => ({
          degree: parent.findIndex(
            (p) => getScaleNoteDegree(p) === getScaleNoteDegree(n)
          ),
          scaleId: scale.id,
        })),
      });
    }
    return emptyScale;
  };

  const maps = [map1, map2, map3];
  const scaleTracks: ScaleTrack[] = [];

  // Add each scale and scale track
  for (let i = 0; i < size; i++) {
    const scale = getScale(maps[i]);
    scales.push(scale);
    if (!scale.notes.length) return;
    const parentId = i > 0 ? scaleTracks[i - 1].id : undefined;
    const scaleTrack = dispatch(
      createScaleTrack({ data: { track: { parentId }, scale }, undoType })
    );
    scaleTracks.push(scaleTrack);
  }

  // Make a pattern track with a random motif
  const { track } = dispatch(
    createPatternTrack({
      data: { track: { parentId: scaleTracks[2].id } },
      undoType,
    })
  );
  const { patternId } = dispatch(
    createCourtesyPatternClip({
      data: { clip: { trackId: track.id } },
      undoType,
    })
  );
  dispatch(randomizePattern({ data: { id: patternId }, undoType }));
};

/** Create a hierarchy of drum-based Pattern Tracks within a chromatic Scale Track  */
export const createDrumTracks = (): Thunk => (dispatch) => {
  const undoType = createUndoType("createDrumTracks", nanoid());
  const parentId = dispatch(createScaleTrack({ data: {}, undoType })).id;

  const createStream = (restChance = 0.2): PatternStream =>
    new Array(16)
      .fill(0)
      .map(() =>
        Math.random() < restChance
          ? createSixteenthRest()
          : createSixteenthNote()
      );

  // Create a kick track and pattern clip
  const kickTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "bass-drum-trvth" } },
      undoType,
    })
  ).track;
  const kickId = dispatch(
    createPattern({
      data: { stream: createStream(0.8), trackId: kickTrack.id },
      undoType,
    })
  ).id;
  const kick = initializePatternClip({
    patternId: kickId,
    trackId: kickTrack.id,
  });
  dispatch(addClip({ data: kick, undoType }));

  // Create a snare track and pattern clip
  const snareTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "snare-drum-trvth" } },
      undoType,
    })
  ).track;
  const snareId = dispatch(
    createPattern({
      data: { stream: createStream(0.5), trackId: snareTrack.id },
      undoType,
    })
  ).id;
  const snare = initializePatternClip({
    patternId: snareId,
    trackId: snareTrack.id,
  });
  dispatch(addClip({ data: snare, undoType }));

  // Create a tom track and pattern clip
  const tomTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "floor-tom-trvth" } },
      undoType,
    })
  ).track;
  const tomId = dispatch(
    createPattern({
      data: { stream: createStream(0.6), trackId: tomTrack.id },
      undoType,
    })
  ).id;
  const tom = initializePatternClip({ patternId: tomId, trackId: tomTrack.id });
  dispatch(addClip({ data: tom, undoType }));

  // Create a hat track and pattern clip
  const hatTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "ride-cymbal-trvth" } },
      undoType,
    })
  ).track;
  const hatId = dispatch(
    createPattern({
      data: { stream: createStream(0.3), trackId: hatTrack.id },
      undoType,
    })
  ).id;
  const hat = initializePatternClip({ patternId: hatId, trackId: hatTrack.id });
  dispatch(addClip({ data: hat, undoType }));
};

export const readMidiScaleFromString = (name: string, parent?: MidiScale) => {
  if (name === "") return;
  // Interpret exact pitch classes as major
  if (isPitchClass(name)) {
    const number = getPitchClassNumber(name);
    return getTransposedScale(MajorScale.notes as MidiScale, number);
  }

  // Interpret lower case pitch classes as minor
  const upper = name.toUpperCase();
  if (isPitchClass(upper)) {
    const number = getPitchClassNumber(upper);
    return getTransposedScale(MinorScale.notes as MidiScale, number);
  }

  // Otherwise, try to parse the scale name
  const pcMatch = name.match(/^\[?([a-gA-G][#b]?(?:, ?[a-gA-G][#b]?)+)\]?$/);

  // Numbers are equal to degrees
  const degreeMatch = name.match(/^\[?(\d+(?:, ?\d+)+)\]?$/);

  // M[n] are equal to midi numbers
  const midiMatch = name.match(/^\[?(M\d+(?:, ?M\d+)+)\]?$/);

  const getScale = () => {
    // Parse the pitch classes
    if (pcMatch) {
      const pitchClasses = pcMatch[1].split(", ").map(capitalize);
      const scale: MidiScale = [];
      for (const pitchClass of pitchClasses) {
        if (!isPitchClass(pitchClass)) return undefined;
        const number = getPitchClassNumber(pitchClass);
        const match = parent?.find((c) => getMidiPitchClass(c) === pitchClass);
        scale.push(number + 12 * getMidiOctaveNumber(12 + (match ?? 48)));
      }
      return scale;
    }

    // Parse the degrees as relative
    if (degreeMatch && parent) {
      const degreeValues = degreeMatch[1].split(",");
      const degrees = degreeValues.map((d) => parseInt(trim(d)));
      return degrees.map((d) => parent[d]);
    }

    // Parse the MIDI values as absolute
    if (midiMatch) {
      const midiValues = midiMatch[1].split(",");
      const midi = midiValues.map((value) => parseInt(trim(value).slice(1)));
      return midi;
    }

    // Unpack the scale name
    const scale = unpackScaleName(name);
    if (!scale) return undefined;
    const { scaleName, pitchClass } = scale;
    const s1 = trim(scaleName.toLowerCase());

    // Find a preset that matches the scale name
    let preset: Scale | undefined = [...PresetScaleList, ...PatternScales].find(
      (scale) => {
        const s2 = getScaleName(scale).trim().toLowerCase();
        const s3 = s2.split(" ")[1];
        const aliases = getScaleAliases(scale);
        return (
          s1 === s2 || s1 === s3 || aliases.some((a) => a === trim(scaleName))
        );
      }
    );

    // Find a preset that includes the scale name
    if (!preset) {
      preset = [...PresetScaleNotes, ...PatternScaleNotes].find((scale) => {
        const s2 = getScaleName(scale).trim().toLowerCase();
        return s2.includes(s1);
      });
    }
    if (!preset) return;

    // Transpose the scale based on the pitch class
    const number = getPitchClassNumber(
      pitchClass || getMidiPitchClass(parent?.[0] ?? 60)
    );
    return getTransposedScale(preset, number);
  };

  // Try to get the scale
  const initialObject = getScale();
  if (!initialObject) return;

  const initialScale = getScaleNotes(initialObject) as MidiScale;
  const newScale = [];
  const size = initialScale.length;

  // Make sure each note is higher than the previous note
  for (let i = 0; i < size; i++) {
    const note = initialScale[i];
    const prevNote = initialScale[i - 1];
    if (i > 0 && note <= prevNote) {
      let newNote = note;
      while (newNote <= prevNote) {
        newNote += 12;
      }
      newScale.push(newNote);
    } else {
      newScale.push(note);
    }
  }

  // Return the new scale
  return newScale;
};

/** Update the notes of a track based on an inputted regex string */
export const inputNewScale =
  (id: ScaleTrackId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      autoselect: true,
      title: "Change Scale",
      description: [
        promptLineBreak,
        <span>
          Rule #1: <span className="text-sky-400">Scales</span> can be specified
          by name or symbol
        </span>,
        <span>Example: "C" or "Db lydian" or "Fmin7" or "G7#9"</span>,
        promptLineBreak,
        <span>
          Rule #2: <span className="text-sky-400">Scales</span> can be specified
          by pitch class
        </span>,
        <span>Example: "acoustic scale" or "C, D, E, F#, G, A, Bb"</span>,
        promptLineBreak,
        <span>
          Rule #3: <span className="text-sky-400">Scales</span> can be specified
          by scale degree
        </span>,
        <span>Example: "C major" or "0, 2, 4, 5, 7, 9, 11"</span>,
        promptLineBreak,
        <span className="underline">Please input your scale:</span>,
      ],
      callback: (input) => {
        const undoType = createUndoType("inputScaleTrackScale", nanoid());
        const project = getProject();
        const trackId = id;
        const track = selectTrackById(project, trackId);
        if (!track) return;
        const scaleId = isScaleTrack(track) ? track.scaleId : undefined;
        if (!scaleId) return;

        const parentScale = selectTrackMidiScale(project, track?.parentId);
        let notes = readMidiScaleFromString(input, parentScale);
        if (!notes) {
          // Try to find an array of pitch classes in the name
          const scale = unpackScaleName(input);
          if (!scale || !scale.scaleName.length) return;

          const { scaleName, pitchClass } = scale;

          const preset = [...PresetScaleNotes, ...PatternScaleNotes].find(
            (scale) =>
              getScaleName(scale)
                .toLowerCase()
                .includes(scaleName.toLowerCase())
          ) as MidiScale | undefined;
          if (!preset) return;

          const number = getPitchClassNumber(pitchClass);
          notes = getTransposedScale(preset, number);

          if (!preset) return;
        }

        const newScale = notes
          .map((MIDI) =>
            dispatch(convertMidiToNestedNote(MIDI, track?.parentId))
          )
          .filter((n) => n.degree >= 0);
        dispatch(
          updateScale({
            data: { id: scaleId, notes: newScale },
            undoType,
          })
        );
      },
    })();

export const bindNoteWithPrompt =
  (id: PatternId, index: number): Thunk =>
  (dispatch, getProject) => {
    promptUserForString({
      title: "Input Scale Note",
      large: true,
      description: [
        promptLineBreak,
        <span>Rule #1: Scale Notes are specified by label and number.</span>,
        <span>Example: B0 = Degree 0 of Scale B </span>,
        promptLineBreak,
        <span>Rule #2: Scale Offsets are summed after Scale Notes.</span>,
        <span>
          Example: B0 + A-1 = Degree 0 of Scale B, 1 step down Scale A
        </span>,
        promptLineBreak,
        <span>Rule #3: Pedal tones are specified with "pedal"</span>,
        <span>Rule #4: Default bindings are specified with "auto"</span>,
        promptLineBreak,
        <span className="underline">Please input your note:</span>,
      ],
      callback: (string) => {
        const project = getProject();
        const undoType = nanoid();
        const pattern = selectPatternById(project, id);
        const { trackId, stream } = pattern;
        const block = getPatternBlockAtIndex(stream, index);
        const blockNotes = getPatternBlockNotes(block);
        const firstNote = { ...blockNotes[0] } as PatternNestedNote;
        if (string === "auto") {
          const note = dispatch(autoBindNoteToTrack(trackId, firstNote));
          dispatch(updatePatternNote({ data: { id, index, note }, undoType }));
          return;
        }
        if (string === "pedal") {
          const chain = selectTrackScaleChain(
            project,
            selectScaleTrackByScaleId(project, firstNote.scaleId)?.id
          );
          if ("MIDI" in firstNote) delete firstNote.MIDI;
          const MIDI = resolveScaleNoteToMidi({ ...firstNote }, chain);
          const { duration, velocity } = firstNote;
          dispatch(
            updatePatternNote({
              data: { id, index, note: { duration, velocity, MIDI } },
              undoType,
            })
          );
          return;
        } else {
          const regex = /([a-zA-Z])([-+]?\d+)/g;
          const [note, ...offsets] = [...string.matchAll(regex)].map(
            (match) => ({
              label: match[1],
              value: parseInt(match[2]),
            })
          );

          if (isPatternRest(block)) {
            firstNote.duration = block.duration;
            firstNote.velocity = DEFAULT_VELOCITY;
          }
          const baseTrack = selectTrackByLabel(getProject(), note.label);
          if (!baseTrack) return;
          firstNote.scaleId = (baseTrack as ScaleTrack)?.scaleId;
          if ("scaleId" in firstNote && "MIDI" in firstNote) {
            delete firstNote.MIDI;
          }
          firstNote.degree = note.value;
          firstNote.offset = { octave: firstNote.offset?.octave ?? 0 };
          for (const offset of offsets) {
            if (offset.label === "t") {
              if (!firstNote.offset.chromatic) {
                firstNote.offset.chromatic = 0;
              }
              firstNote.offset.chromatic += offset.value;
              continue;
            }
            const offsetTrack = selectTrackByLabel(getProject(), offset.label);
            if (!offsetTrack) continue;
            const scaleId = (offsetTrack as ScaleTrack).scaleId;
            firstNote.offset[scaleId] = offset.value;
          }
          if (isNestedNote(firstNote) && !firstNote.scaleId) {
            firstNote.offset = {
              ...firstNote.offset,
              octave:
                (firstNote.offset?.octave ?? 0) + Math.floor(note.value / 12),
            };
          }
        }
        dispatch(
          updatePatternNote({
            data: { id, index, note: firstNote },
            undoType: nanoid(),
          })
        );
      },
    })();
  };
