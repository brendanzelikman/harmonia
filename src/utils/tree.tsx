// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

import { Track, TrackId } from "types/Track/TrackTypes";
import { PatternTrack } from "../types/Track/PatternTrack/PatternTrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
} from "../types/Track/ScaleTrack/ScaleTrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { Payload, unpackUndoType } from "lib/redux";
import { isString } from "lodash";
import {
  matchInstrumentKey,
  sampleInstrumentByCategory,
} from "types/Instrument/InstrumentFunctions";
import { Thunk } from "types/Project/ProjectTypes";
import { initializeScale, ScaleObject } from "types/Scale/ScaleTypes";
import { dispatchCustomEvent, promptUserForString } from "utils/html";
import { parseTrackHierarchy, Hierarchy } from "utils/track";
import { createPatternTrack } from "../types/Track/PatternTrack/PatternTrackThunks";
import {
  readMidiScaleFromString,
  createScaleTrack,
} from "../types/Track/ScaleTrack/ScaleTrackThunks";
import { selectTrackMidiScale } from "../types/Track/TrackSelectors";
import { convertMidiToNestedNote } from "types/Track/TrackUtils";
import { promptLineBreak } from "components/PromptModal";
import { promptUserForSample } from "types/Track/PatternTrack/PatternTrackThunks";
import { CLOSE_STATE, OPEN_STATE } from "hooks/useToggle";

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
    if (notes.some((n) => n.degree < 0)) return undefined;
    return initializeScale({ notes });
  };

export const createScaleTrackFromString =
  (payload: TrackStringPayload): Thunk<ScaleTrack | undefined> =>
  (dispatch) => {
    const { parentId } = payload.data;
    const undoType = unpackUndoType(payload, `createScaleTrack`);
    const scale = dispatch(createNestedScaleFromString(payload));
    if (scale) {
      return dispatch(
        createScaleTrack({ data: { track: { parentId }, scale }, undoType })
      );
    }
  };

export const createPatternTrackFromString =
  (payload: TrackStringPayload): Thunk<PatternTrack | undefined> =>
  (dispatch) => {
    const { input, parentId } = payload.data;
    const undoType = unpackUndoType(payload, `createPatternTrack-${nanoid()}`);
    const text = input.trim();
    if (text === "file") {
      dispatch(promptUserForSample({ data: { parentId }, undoType }));
    } else {
      let key = matchInstrumentKey(text) ?? sampleInstrumentByCategory(text);
      if (!key) return;
      const { track } = dispatch(
        createPatternTrack({
          data: { track: { parentId }, instrument: { key } },
          undoType,
        })
      );
      return track;
    }
  };

/** Create a family of tracks based on an input string. */
export const createTreeFromString =
  (payload: Payload<string>): Thunk<Track[]> =>
  (dispatch) => {
    const input = payload.data;
    const undoType = unpackUndoType(payload, `generateTracks-${nanoid()}`);

    // Get the list of objects based on the input track hierarchy
    const objects = parseTrackHierarchy(input);
    const tracks: Track[] = [];

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
              const track = _(createScaleTrackFromString({ data, undoType }));
              if (track) tracks.push(track);
            }

            // Create a pattern track if an instrument delimiter is found
            else if (input.startsWith("~")) {
              const data = { input: input.slice(1), parentId };
              const track = _(createPatternTrackFromString({ data, undoType }));
              if (track) tracks.push(track);
            }

            // Otherwise, try scale track then pattern track
            else {
              const payload = { data: { input, parentId }, undoType };
              const scaleTrack = _(createScaleTrackFromString(payload));
              if (scaleTrack) tracks.push(scaleTrack);
              else {
                const patternTrack = _(createPatternTrackFromString(payload));
                if (patternTrack) tracks.push(patternTrack);
              }
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
            const parent = _(
              createScaleTrack({
                data: { track: { parentId }, scale: ref },
                undoType,
              })
            );
            if (parent) tracks.push(parent);
            const children = Array.isArray(object[name])
              ? object[name]
              : [object[name]];
            children.forEach((child) => addObject(child, parent.id).map(_));
          },
        ];
      }
    };

    // Add the objects to the project and return
    objects.forEach((object) => addObject(object).map(dispatch));
    return tracks;
  };

/** Create a list of tracks based on an inputted regex string */
export const createNewTree: Thunk = (dispatch) =>
  promptUserForString({
    title: "Create New Tree",
    backgroundColor: "bg-slate-950",
    description: [
      <div className="mt-4">
        Trees can be created by prompt with a few simple rules:
      </div>,
      promptLineBreak,
      <span>
        Rule 1: <span className="text-sky-500">Scales</span> are matched by
        name, note, or degree
      </span>,
      <span>Example: "C major chord" or "C, E, G" or "0, 4, 7"</span>,
      promptLineBreak,
      <span>
        Rule 2: <span className="text-emerald-500">Samplers</span> are matched
        by name or uploaded by file
      </span>,
      <span>Example: "upright piano" or "xylophone" or "~file"</span>,
      promptLineBreak,
      <span>
        Rule 3: <span className="text-teal-500">Trees</span> are created with
        pluses, arrows, and parentheses
      </span>,
      <span>{`Example: "C major scale => C major chord => (piano + guitar)"`}</span>,
      promptLineBreak,
      <span className="underline">Please input your request:</span>,
    ],
    callback: (input) => {
      dispatch(createTreeFromString({ data: input }));
    },
    onFocus: () => dispatchCustomEvent(OPEN_STATE("inputTree")),
    onCancel: () => dispatchCustomEvent(CLOSE_STATE("inputTree")),
    autoselect: true,
    large: true,
  })();
