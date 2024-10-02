import { getValueByKey } from "utils/objects";
import { addScale } from "types/Scale/ScaleSlice";
import { random, range, sample, sampleSize } from "lodash";
import { PresetScaleList, PresetScaleNotes } from "assets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import { sortScaleNotesByDegree } from "types/Scale/ScaleUtils";
import {
  ScaleObject,
  nestedChromaticNotes,
  ScaleArray,
  chromaticScale,
  initializeScale,
  ScaleNote,
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
import { PatternScales } from "types/Pattern/PatternUtils";
import { getTransposedScale } from "types/Scale/ScaleTransformers";
import { promptUserForString } from "utils/html";
import { getScaleName } from "utils/key";
import { getPitchClassNumber, MidiScale } from "utils/midi";
import { unpackScaleName } from "utils/pitchClass";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import {
  INSTRUMENT_KEYS,
  InstrumentKey,
} from "types/Instrument/InstrumentTypes";

/** Create a `ScaleTrack` with an optional initial track. */
export const createScaleTrack =
  (
    initialTrack?: Partial<ScaleTrack>,
    scaleNotes?: ScaleObject,
    _undoType?: UndoType
  ): Thunk<ScaleTrackId> =>
  (dispatch, getProject) => {
    const project = getProject();
    const scaleMap = selectScaleMap(project);
    const topLevelTracks = selectTopLevelTracks(project);

    // Get the parent track of the initial track to inherit the scale
    const parentId = initialTrack?.parentId;
    const parentTrack = isScaleTrackId(parentId)
      ? selectScaleTrackById(project, parentId)
      : undefined;
    const parentScale = getValueByKey(scaleMap, parentTrack?.scaleId);
    const parentNotes = parentScale?.notes ?? nestedChromaticNotes;

    // Create a new scale for the track
    const notes: ScaleArray = scaleNotes
      ? getScaleNotes(scaleNotes)
      : parentNotes.map((_, i) => ({ degree: i }));
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
      addScale({ data: { ...scale, scaleTrackId: scaleTrack.id }, undoType })
    );
    dispatch(addTrack({ data: scaleTrack, undoType }));

    // Return the ID of the scale track
    return scaleTrack.id;
  };

/** Create a random hierarchy of `ScaleTracks` */
export const createRandomHierarchy = (): Thunk => (dispatch) => {
  // Get a random size for the hierarchy
  let size = random(2, 5);
  const scales: ScaleObject[] = [];
  const scaleTracks: ScaleTrack[] = [];
  const undoType = createUndoType("createRandomHierarchy", nanoid());

  // Create a root scale by grabbing a preset
  const baseScale = sample(PresetScaleList) || chromaticScale;
  const baseNotes = sampleSize(baseScale.notes, random(8, 12));
  const sortedNotes = sortScaleNotesByDegree(baseNotes);
  const scale = initializeScale({ notes: sortedNotes });
  scales.push(scale);

  // Create a randomized scale for each level of the hierarchy
  for (let i = 2; i <= size; i++) {
    const maxLength = scales[i - 2].notes.length;
    const degrees = range(0, maxLength).map((degree) => ({ degree }));
    const scaleSize = Math.max(2, random(maxLength / 2, maxLength - 1));
    const notes = sampleSize(degrees, scaleSize);
    const sortedNotes = sortScaleNotesByDegree(notes);
    const scale = initializeScale({ notes: sortedNotes });
    scales.push(scale);
    if (notes.length === 2) {
      size = i;
      break;
    }
  }

  // Create a scale track for each scale and chain the parents
  for (let i = 0; i < size; i++) {
    const scale = scales[i];
    const parentId = i > 0 ? scaleTracks[i - 1].id : undefined;
    const scaleTrack = initializeScaleTrack({ parentId, scaleId: scale.id });
    const scaleTrackId = scaleTrack.id;
    dispatch(addTrack({ data: scaleTrack, undoType }));
    dispatch(addScale({ data: { ...scale, scaleTrackId }, undoType }));
    scaleTracks.push(scaleTrack);
  }
};

/** Create a hierarchy of drum-based Pattern Tracks within a chromatic Scale Track  */
export const createDrumTracks = (): Thunk => (dispatch) => {
  const undoType = createUndoType("createDrumTracks", nanoid());
  const parentId = dispatch(createScaleTrack(undefined, undefined, undoType));

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
  );
  const kickId = dispatch(
    createPattern({
      data: { stream: createStream(0.8), trackId: kickTrack },
      undoType,
    })
  );
  const kick = initializePatternClip({ patternId: kickId, trackId: kickTrack });
  dispatch(addClip({ data: kick, undoType }));

  // Create a snare track and pattern clip
  const snareTrack = dispatch(
    createPatternTrack({ parentId }, "snare-drum-trvth", undoType)
  );
  const snareId = dispatch(
    createPattern({
      data: { stream: createStream(0.5), trackId: snareTrack },
      undoType,
    })
  );
  const snare = initializePatternClip({
    patternId: snareId,
    trackId: snareTrack,
  });
  dispatch(addClip({ data: snare, undoType }));

  // Create a tom track and pattern clip
  const tomTrack = dispatch(
    createPatternTrack({ parentId }, "floor-tom-trvth", undoType)
  );
  const tomId = dispatch(
    createPattern({
      data: { stream: createStream(0.6), trackId: tomTrack },
      undoType,
    })
  );
  const tom = initializePatternClip({ patternId: tomId, trackId: tomTrack });
  dispatch(addClip({ data: tom, undoType }));

  // Create a hat track and pattern clip
  const hatTrack = dispatch(
    createPatternTrack({ parentId }, "ride-cymbal-trvth", undoType)
  );
  const hatId = dispatch(
    createPattern({
      data: { stream: createStream(0.3), trackId: hatTrack },
      undoType,
    })
  );
  const hat = initializePatternClip({ patternId: hatId, trackId: hatTrack });
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

/** Create a list of tracks based on an inputted regex string */
export const createNestedTracks: Thunk = (dispatch) =>
  promptUserForString(
    "Create Nested Tracks",
    [
      "Please input a list of scale names and instrument names separated by '=>' to create a chain of nested tracks.",
      "For example, 'g major scale => c major chord => upright piano'.",
    ],
    (input) => {
      const undoType = createUndoType("generateTracks", nanoid());
      const names = input.split("=>").map((s) => s.trim());

      // Convert the names into scales
      const scales = names.map((name) => {
        const unpacked = unpackScaleName(name);
        if (!unpacked) return undefined;
        const { pitchClass, scaleName } = unpacked;

        // Find some scale name that includes the given scale name
        const preset = [...PresetScaleNotes, ...PatternScales].find((scale) =>
          getScaleName(scale).toLowerCase().includes(scaleName.toLowerCase())
        ) as MidiScale | undefined;
        if (!preset) return undefined;

        // Transpose the scale by the given amount
        const number = getPitchClassNumber(pitchClass);
        const scale = getTransposedScale(preset, number);
        return scale;
      });

      // Check if the last track is an instrument
      let instrumentKey: InstrumentKey | null = null;
      const last = scales.pop();
      if (last === undefined) {
        const instrument = names[names.length - 1];
        const potentialKey = INSTRUMENT_KEYS.find((key) =>
          getInstrumentName(key)
            .toLowerCase()
            .includes(instrument.toLowerCase())
        );
        if (potentialKey) {
          instrumentKey = potentialKey;
        }
      }

      // Create a scale track for each scale
      const scaleTrackIds: ScaleTrackId[] = [];
      for (const scale of scales) {
        if (!scale) break;
        const parentId = scaleTrackIds.at(-1);
        const notes: ScaleNote[] = scale
          .map((midi) => dispatch(convertMidiToNestedNote(midi, parentId)))
          .filter((note) => note.degree > -1);
        scaleTrackIds.push(
          dispatch(
            createScaleTrack({ parentId }, initializeScale({ notes }), undoType)
          )
        );
      }

      // Create a pattern track if there is an instrument
      if (instrumentKey) {
        const parentId = scaleTrackIds.at(-1);
        dispatch(createPatternTrack({ parentId }, instrumentKey, undoType));
      }
    }
  )();
