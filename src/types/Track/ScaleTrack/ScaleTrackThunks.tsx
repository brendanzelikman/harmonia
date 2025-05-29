import { weightedSample } from "utils/math";
import { addScale } from "types/Scale/ScaleSlice";
import { capitalize, isEqual, sample, trim } from "lodash";
import { PresetScaleList, PresetScaleNotes } from "lib/presets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { getScaleNoteDegree, getScaleNotes } from "types/Scale/ScaleFunctions";
import {
  ScaleObject,
  nestedChromaticNotes,
  ScaleArray,
  initializeScale,
  emptyScale,
  Scale,
} from "types/Scale/ScaleTypes";
import {
  ScaleTrack,
  initializeScaleTrack,
  isScaleTrackId,
} from "./ScaleTrackTypes";
import { selectScaleById, selectScaleMap } from "types/Scale/ScaleSelectors";
import {
  selectScaleTrackById,
  selectTopLevelTracks,
  selectTrackMidiScale,
} from "../TrackSelectors";
import {
  createUndoType,
  Payload,
  unpackData,
  unpackUndoType,
} from "types/redux";
import { nanoid } from "@reduxjs/toolkit";
import {
  createCourtesyPatternClip,
  createPatternTrack,
} from "../PatternTrack/PatternTrackThunks";
import { addTrack } from "../TrackThunks";
import { createSixteenthNote, createSixteenthRest } from "utils/duration";
import { createPattern } from "types/Pattern/PatternThunks";
import { addPatternClip } from "types/Clip/ClipSlice";
import { initializePatternClip } from "types/Clip/ClipTypes";
import { PatternStream } from "types/Pattern/PatternTypes";
import { PatternScaleNotes, PatternScales } from "types/Pattern/PatternUtils";
import { getTransposedScale } from "types/Scale/ScaleTransformers";
import { getScaleAliases, getScaleName } from "types/Scale/ScaleFinder";
import {
  getMidiOctaveNumber,
  getMidiPitchClass,
  getPitchClassDegree,
  MidiScale,
} from "utils/midi";
import { isPitchClass, unpackScaleName } from "utils/pitch";
import { MajorScale, MinorScale } from "lib/presets/scales/BasicScales";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectSelectedScaleTrack } from "types/Timeline/TimelineSelectors";

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
    const parentScaleId = parentTrack?.scaleId;
    const parentScale = parentScaleId ? scaleMap[parentScaleId] : undefined;
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
    dispatch(addScale({ data: scale, undoType }));
    dispatch(addTrack({ data: scaleTrack, undoType }));

    // Return the ID of the scale track
    return scaleTrack;
  };

/** Create a random tree */
export const createRandomTree = (): Thunk => (dispatch) => {
  const size = 3;
  const undoType = createUndoType("createRandomTree", nanoid());

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
      const size = parseInt(weightedSample(map));
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
  const clip = { trackId: track.id, tick: 0 };
  const options = { randomize: true, autobind: true };
  dispatch(createCourtesyPatternClip({ data: { clip, ...options }, undoType }));
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
      data: { stream: createStream(0.8) },
      undoType,
    })
  ).id;
  const kick = initializePatternClip({
    patternId: kickId,
    trackId: kickTrack.id,
  });
  dispatch(addPatternClip({ data: kick, undoType }));

  // Create a snare track and pattern clip
  const snareTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "snare-drum-trvth" } },
      undoType,
    })
  ).track;
  const snareId = dispatch(
    createPattern({
      data: { stream: createStream(0.5) },
      undoType,
    })
  ).id;
  const snare = initializePatternClip({
    patternId: snareId,
    trackId: snareTrack.id,
  });
  dispatch(addPatternClip({ data: snare, undoType }));

  // Create a tom track and pattern clip
  const tomTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "floor-tom-trvth" } },
      undoType,
    })
  ).track;
  const tomId = dispatch(
    createPattern({
      data: { stream: createStream(0.6) },
      undoType,
    })
  ).id;
  const tom = initializePatternClip({ patternId: tomId, trackId: tomTrack.id });
  dispatch(addPatternClip({ data: tom, undoType }));

  // Create a hat track and pattern clip
  const hatTrack = dispatch(
    createPatternTrack({
      data: { track: { parentId }, instrument: { key: "ride-cymbal-trvth" } },
      undoType,
    })
  ).track;
  const hatId = dispatch(
    createPattern({
      data: { stream: createStream(0.3) },
      undoType,
    })
  ).id;
  const hat = initializePatternClip({ patternId: hatId, trackId: hatTrack.id });
  dispatch(addPatternClip({ data: hat, undoType }));
};

export const readMidiScaleFromString = (name: string, parent?: MidiScale) => {
  if (name === "") return;
  // Interpret exact pitch classes as major
  if (isPitchClass(name)) {
    const number = getPitchClassDegree(name);
    return getTransposedScale(MajorScale.notes as MidiScale, number);
  }

  // Interpret lower case pitch classes as minor
  const upper = name.toUpperCase();
  if (isPitchClass(upper)) {
    const number = getPitchClassDegree(upper);
    return getTransposedScale(MinorScale.notes as MidiScale, number);
  }

  // Otherwise, try to parse the scale name
  const pcMatch = name.match(
    /^\[?([a-gA-G][#b]?(?:[,\s]+?[a-gA-G][#b]?)+)\]?$/
  );

  // Numbers are equal to degrees
  // const degreeMatch = name.match(/^\[?(\d+(?:[,\s]+?\d+)*)\]?$/);

  // M[n] are equal to midi numbers
  const midiMatch = name.match(/^\[?(\d+(?:[,\s]+?\d+)*)\]?$/);

  // F[n] are equal to frequencies
  const freqMatch = name.match(/^\[?(F\d+(?:[,\s]+?F\d+)*)\]?$/);

  const getScale = () => {
    // Parse the pitch classes
    if (pcMatch) {
      const pitchClasses = pcMatch[1]
        .trim()
        .split(/[,\s]+/)
        .map(capitalize);
      const scale: MidiScale = [];
      for (const pitchClass of pitchClasses) {
        if (!isPitchClass(pitchClass)) return undefined;
        const number = getPitchClassDegree(pitchClass);
        const match = parent?.find((c) => getMidiPitchClass(c) === pitchClass);
        scale.push(number + 12 * getMidiOctaveNumber(12 + (match ?? 48)));
      }
      return scale;
    }

    // Parse the degrees as relative
    // if (degreeMatch && parent) {
    //   const degrees = degreeMatch[1]
    //     .trim()
    //     .split(/[,\s]+/)
    //     .map(Number);
    //   return degrees.map((d) => parent[d]).filter(Boolean);
    // }

    // Parse the MIDI values as absolute
    if (midiMatch) {
      const midiValues = midiMatch[1].split(/[,\s]+/);
      const midi = midiValues.map((value) => parseFloat(trim(value)));
      if (midi.every((m) => m < 12)) {
        return midi.map((m) => m + 60);
      }
      return midi;
    }

    // Parse the frequency values as absolute
    if (freqMatch) {
      const freqValues = freqMatch[1].split(/[,\s]+/);
      const frequencies = freqValues.map((value) =>
        parseFloat(trim(value).slice(1))
      );
      const notes = frequencies.map((f) => 69 + 12 * Math.log2(f / 440));
      return notes;
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
        const s3 = s2.split(" ")[0];
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
    const number = getPitchClassDegree(
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
