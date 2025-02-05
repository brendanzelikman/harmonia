import { getArrayByKey, pickKeyByWeight } from "utils/objects";
import { addScale, updateScale } from "types/Scale/ScaleSlice";
import { capitalize, isEqual, sample, trim } from "lodash";
import { PresetScaleList, PresetScaleNotes } from "assets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import {
  ScaleObject,
  nestedChromaticNotes,
  ScaleArray,
  initializeScale,
  emptyScale,
  ScaleNote,
  Scale,
} from "types/Scale/ScaleTypes";
import { TrackId, isPatternTrack } from "../TrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
  initializeScaleTrack,
  isScaleTrackId,
} from "./ScaleTrackTypes";
import { selectScaleMap } from "types/Scale/ScaleSelectors";
import {
  selectScaleTrackById,
  selectTopLevelTracks,
  selectTrackById,
  selectTrackMidiScale,
} from "../TrackSelectors";
import { UndoType } from "types/units";
import { createUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";
import {
  createPatternTrack,
  setPatternTrackScaleTrack,
} from "../PatternTrack/PatternTrackThunks";
import { convertMidiToNestedNote, moveTrack } from "../TrackThunks";
import { addTrack } from "../TrackThunks";
import { createSixteenthNote, createSixteenthRest } from "utils/durations";
import { createPattern } from "types/Pattern/PatternThunks";
import { addClip } from "types/Clip/ClipSlice";
import { initializePatternClip } from "types/Clip/ClipTypes";
import { PatternStream } from "types/Pattern/PatternTypes";
import { PatternScaleNotes, PatternScales } from "types/Pattern/PatternUtils";
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
import { mod } from "utils/math";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";

/** Create a `ScaleTrack` with an optional initial track. */
export const createScaleTrack =
  (
    initialTrack?: Partial<ScaleTrack>,
    scaleNotes?: ScaleObject,
    _undoType?: UndoType
  ): Thunk<ScaleTrack> =>
  (dispatch, getProject) => {
    const project = getProject();
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
      order: !!initialTrack?.parentId ? undefined : topLevelTracks.length + 1,
    });
    const undoType =
      _undoType ?? createUndoType("createScaleTrack", scaleTrack.id);
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
          (s.notes as number[]).every((n) =>
            parent.some((p) => p % 12 === n % 12)
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
          degree: parent.findIndex((p) => p % 12 === n % 12),
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
      createScaleTrack({ parentId }, scale, undoType)
    );
    scaleTracks.push(scaleTrack);
  }
};

/** Create a hierarchy of drum-based Pattern Tracks within a chromatic Scale Track  */
export const createDrumTracks = (): Thunk => (dispatch) => {
  const undoType = createUndoType("createDrumTracks", nanoid());
  const parentId = dispatch(
    createScaleTrack(undefined, undefined, undoType)
  ).id;

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
    createPatternTrack({ parentId }, "bass-drum-trvth", undoType)
  ).track;
  const kickId = dispatch(
    createPattern({
      data: { stream: createStream(0.8), trackId: kickTrack.id },
      undoType,
    })
  );
  const kick = initializePatternClip({
    patternId: kickId,
    trackId: kickTrack.id,
  });
  dispatch(addClip({ data: kick, undoType }));

  // Create a snare track and pattern clip
  const snareTrack = dispatch(
    createPatternTrack({ parentId }, "snare-drum-trvth", undoType)
  ).track;
  const snareId = dispatch(
    createPattern({
      data: { stream: createStream(0.5), trackId: snareTrack.id },
      undoType,
    })
  );
  const snare = initializePatternClip({
    patternId: snareId,
    trackId: snareTrack.id,
  });
  dispatch(addClip({ data: snare, undoType }));

  // Create a tom track and pattern clip
  const tomTrack = dispatch(
    createPatternTrack({ parentId }, "floor-tom-trvth", undoType)
  ).track;
  const tomId = dispatch(
    createPattern({
      data: { stream: createStream(0.6), trackId: tomTrack.id },
      undoType,
    })
  );
  const tom = initializePatternClip({ patternId: tomId, trackId: tomTrack.id });
  dispatch(addClip({ data: tom, undoType }));

  // Create a hat track and pattern clip
  const hatTrack = dispatch(
    createPatternTrack({ parentId }, "ride-cymbal-trvth", undoType)
  ).track;
  const hatId = dispatch(
    createPattern({
      data: { stream: createStream(0.3), trackId: hatTrack.id },
      undoType,
    })
  );
  const hat = initializePatternClip({ patternId: hatId, trackId: hatTrack.id });
  dispatch(addClip({ data: hat, undoType }));
};

/** Move the scale track to the index of the given track ID. */
export const moveScaleTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): Thunk<boolean> =>
  (dispatch, getProject) => {
    const { dragId, hoverId } = props;
    const project = getProject();

    // Get the corresponding scale tracks
    const thisTrack = selectTrackById(project, dragId);
    const otherTrack = selectTrackById(project, hoverId);
    if (!thisTrack || !otherTrack) return false;

    const isThisPatternTrack = isPatternTrack(thisTrack);
    const isOtherPatternTrack = isPatternTrack(otherTrack);

    // If the dragged track is a pattern track, move the pattern track
    if (isThisPatternTrack && !isOtherPatternTrack) {
      const patternTrackId = thisTrack.id;
      const scaleTrackId = otherTrack.id;
      dispatch(setPatternTrackScaleTrack(patternTrackId, scaleTrackId));
      return true;
    }

    // If the other track is a pattern track, do nothing
    if (!isThisPatternTrack && isOtherPatternTrack) {
      return false;
    }

    // Move the scale track
    dispatch(
      moveTrack({ data: { id: thisTrack.id, index: otherTrack.order } })
    );
    return true;
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
    let preset = [...PresetScaleNotes, ...PatternScaleNotes].find((scale) => {
      const s2 = getScaleName(scale).trim().toLowerCase();
      const aliases = getScaleAliases(scale);
      return s2 === s1 || aliases.some((a) => a === s1);
    }) as MidiScale;

    // Find a preset that includes the scale name
    if (!preset) {
      preset = [...PresetScaleNotes, ...PatternScaleNotes].find((scale) => {
        const s2 = getScaleName(scale).trim().toLowerCase();
        return s2.includes(s1);
      }) as MidiScale;
    }
    if (!preset) return;

    // Transpose the scale based on the pitch class
    const number = getPitchClassNumber(
      pitchClass || getMidiPitchClass(parent?.[0] ?? 60)
    );
    return getTransposedScale(preset, number);
  };

  // Try to get the scale
  const initialScale = getScale();
  if (!initialScale) return;

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
export const updateTrackByString =
  (trackId: ScaleTrackId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      title: "Equipped Radio!",
      description: [
        "You receive a message from the broadcaster:",
        new Array(3).fill(`.`).join(""),
        `"Please input a Scale so that we can update this track!"`,
        `.....You can use a scale name like 'major' or 'Db lydian'`,
        `.....You can use pitch classes like 'C, D, E, G, A, B'`,
        `.....You can use MIDI notes like '60, 62, 64, 67, 71'`,
      ],
      callback: (input) => {
        const undoType = createUndoType("updateTrackByString", nanoid());
        const project = getProject();
        const track = selectScaleTrackById(project, trackId);
        const parentScale = selectTrackMidiScale(project, track.parentId);
        let notes = readMidiScaleFromString(input, parentScale);
        if (!notes) {
          // Try to find an array of pitch classes in the name
          const scale = unpackScaleName(input);
          if (!scale) return;

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

        const newScale = notes.map((MIDI) =>
          dispatch(convertMidiToNestedNote(MIDI, track.parentId))
        );
        dispatch(
          updateScale({
            data: { id: track.scaleId, notes: newScale },
            undoType,
          })
        );
      },
    })();
