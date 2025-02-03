// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

import {
  isPatternTrack,
  isScaleTrack,
  ITrack,
  ITrackId,
  ITrackUpdate,
  Track,
  TrackId,
  TrackType,
  TrackUpdate,
} from "types/Track/TrackTypes";
import { Update } from "types/units";
import {
  PatternTrack,
  PatternTrackId,
  isPatternTrackId,
} from "./PatternTrack/PatternTrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
  isScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { Payload, createUndoType } from "lib/redux";
import { isString } from "lodash";
import { setupFileInput } from "providers/idb";
import {
  matchInstrumentKey,
  sampleInstrumentByCategory,
} from "types/Instrument/InstrumentFunctions";
import { Thunk } from "types/Project/ProjectTypes";
import { initializeScale, Scale, ScaleObject } from "types/Scale/ScaleTypes";
import { toArray } from "utils/array";
import { promptUserForString } from "utils/html";
import { parseTrackHierarchy, Hierarchy } from "utils/track";
import { createPatternTrack } from "./PatternTrack/PatternTrackThunks";
import {
  readMidiScaleFromString,
  createScaleTrack,
} from "./ScaleTrack/ScaleTrackThunks";
import { selectTrackMidiScale } from "./TrackSelectors";
import { convertMidiToNestedNote } from "./TrackThunks";

export type TracksByType = { [T in TrackType]: ITrack<T>[] };

/** Convert an array of tracks to a record of tracks by type */
export const getTracksByType = (tracks: Track[]): TracksByType => {
  const pattern: PatternTrack[] = [];
  const scale: ScaleTrack[] = [];

  for (const track of tracks) {
    if (isPatternTrack(track)) pattern.push(track);
    else if (isScaleTrack(track)) scale.push(track);
  }

  return { pattern, scale };
};

// ------------------------------------------------------------
// Track Update Type Helpers
// ------------------------------------------------------------

export type TrackUpdatesByType = { [T in TrackType]: ITrackUpdate<T>[] };

/** Convert an array of tracks to a record of tracks by type */
export const getTrackUpdatesByType = (
  tracks: TrackUpdate[]
): TrackUpdatesByType => {
  const pattern: Update<PatternTrack>[] = [];
  const scale: Update<ScaleTrack>[] = [];

  for (const track of tracks) {
    if (isPatternTrack(track)) pattern.push(track);
    else if (isScaleTrack(track)) scale.push(track);
  }

  return { pattern, scale };
};

// ------------------------------------------------------------
// Track Id Type Helpers
// ------------------------------------------------------------

export type TrackIdsByType = { [T in TrackType]: ITrackId<T>[] };

/** Convert an array of ids to a record of ids by type */
export const getTrackIdsByType = (ids: TrackId[]): TrackIdsByType => {
  const pattern: PatternTrackId[] = [];
  const scale: ScaleTrackId[] = [];

  for (const id of ids) {
    if (isPatternTrackId(id)) pattern.push(id);
    else if (isScaleTrackId(id)) scale.push(id);
  }

  return { pattern, scale };
};

type TrackStringPayload = Payload<{ input: string; parentId?: TrackId }>;

/** Read a string and create a new scale (optionally nested within a parent) */
export const createNestedScaleFromString =
  (payload: TrackStringPayload): Thunk<ScaleObject | undefined> =>
  (dispatch, getProject) => {
    const { input } = payload.data;
    const id = payload.data.parentId;
    const text = input.trim();

    // Try to read a midi scale
    const parentScale = selectTrackMidiScale(getProject(), id);
    const midi = readMidiScaleFromString(text, parentScale);
    if (!midi) return undefined;

    // Convert the midi scale to nested notes
    const notes = midi.map((m) => dispatch(convertMidiToNestedNote(m, id)));
    return initializeScale({ notes });
  };

export const createScaleTrackFromString =
  (payload: TrackStringPayload): Thunk<ScaleTrack | undefined> =>
  (dispatch) => {
    const { parentId } = payload.data;
    const scale = dispatch(createNestedScaleFromString(payload));
    if (scale) {
      return dispatch(createScaleTrack({ parentId }, scale, payload.undoType));
    }
  };

export const createPatternTrackFromString =
  (payload: TrackStringPayload): Thunk<PatternTrack | undefined> =>
  (dispatch) => {
    const { input, parentId } = payload.data;
    const text = input.trim();
    if (text === "sample") {
      dispatch(setupFileInput(undefined, parentId, payload.undoType));
    } else {
      let key = matchInstrumentKey(text) ?? sampleInstrumentByCategory(text);
      if (!key) return;
      const { track } = dispatch(
        createPatternTrack({ parentId }, key, payload.undoType)
      );
      return track;
    }
  };

/** Create a family of tracks based on an input string. */
export const createTracksFromString =
  (input: string): Thunk<string> =>
  (dispatch) => {
    const undoType = createUndoType("generateTracks", nanoid());

    // Get the list of objects based on the input track hierarchy
    const objects = parseTrackHierarchy(input);

    // Create a list of thunks for each object
    const addObject = (
      object: string | Hierarchy,
      parentId?: ScaleTrackId
    ): Thunk[] => {
      if (isString(object)) {
        const input = object.trim();
        if (!input) return [];
        return [
          (_) => {
            // Create a scale track if a scale delimiter is found
            if (input.startsWith("$")) {
              const data = { input: input.slice(1), parentId };
              _(createScaleTrackFromString({ data, undoType }));
            }

            // Create a pattern track if an instrument delimiter is found
            else if (input.startsWith("~")) {
              const data = { input: input.slice(1), parentId };
              _(createPatternTrackFromString({ data, undoType }));
            }

            // Otherwise, try scale track then pattern track
            else {
              const payload = { data: { input, parentId }, undoType };
              const scaleTrack = _(createScaleTrackFromString(payload));
              if (!scaleTrack) _(createPatternTrackFromString(payload));
            }
          },
        ];
      } else {
        const name = Object.keys(object).at(0);
        if (!name) return [];
        const text = name?.trim();
        if (!text) return [];
        return [
          (_, getProject) => {
            const scaleName = text.slice(text.startsWith("$") ? 1 : 0).trim();
            const parentScale = selectTrackMidiScale(getProject(), parentId);
            const scale = readMidiScaleFromString(scaleName, parentScale);
            if (!scale) return [];
            const notes = scale.map((midi) =>
              _(convertMidiToNestedNote(midi, parentId))
            );
            const ref = initializeScale({ notes });
            const parent = _(createScaleTrack({ parentId }, ref, undoType));
            const children = toArray(object[name]);
            children.forEach((child) => addObject(child, parent.id).map(_));
          },
        ];
      }
    };

    // Add the objects to the project and return
    return String(objects.forEach((object) => addObject(object).map(dispatch)));
  };

/** Create a list of tracks based on an inputted regex string */
export const createNewTracks: Thunk = (dispatch) =>
  promptUserForString({
    title: "Create New Tracks",
    description: [
      "Welcome to the TreeJS Terminal!",
      new Array(64).fill(`-`).join(""),
      `Rule 1: A => (B + C) means A is the parent of B and C`,
      `Rule 2: Scale Tracks are given by name, note, or degree`,
      `Rule 3: Pattern Tracks are given by name, category, or "sample"`,
      new Array(64).fill(`-`).join(""),
      `Example 1: "C major => Cmaj7 + Dmin7"`,
      `Example 2: "kick + snare + tom + cymbal"`,
      `Example 3: "F blues => piano"`,
      new Array(64).fill(`-`).join(""),
      "Please enter your prompt in TreeJS:",
    ],
    callback: (input) => {
      dispatch(createTracksFromString(input));
    },
    autoselect: true,
    backgroundColor: "bg-zinc-950",
    large: true,
  })();
