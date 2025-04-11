// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

import { Track, TrackId } from "types/Track/TrackTypes";
import { PatternTrack } from "../../types/Track/PatternTrack/PatternTrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
} from "../../types/Track/ScaleTrack/ScaleTrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { Payload, unpackUndoType } from "types/redux";
import {
  matchInstrumentKey,
  sampleInstrumentByCategory,
} from "types/Instrument/InstrumentFunctions";
import { Thunk } from "types/Project/ProjectTypes";
import { initializeScale, ScaleObject } from "types/Scale/ScaleTypes";
import { promptUserForString } from "lib/prompts/html";
import { createPatternTrack } from "../../types/Track/PatternTrack/PatternTrackThunks";
import {
  readMidiScaleFromString,
  createScaleTrack,
} from "../../types/Track/ScaleTrack/ScaleTrackThunks";
import { selectTrackMidiScale } from "../../types/Track/TrackSelectors";
import { convertMidiToNestedNote } from "types/Track/TrackUtils";
import { promptLineBreak } from "components/PromptModal";
import { promptUserForSample } from "./sampler";
import { dispatchClose, dispatchOpen } from "hooks/useToggle";
import { isString } from "types/utils";

export interface Hierarchy {
  [key: string]: string | Hierarchy | (string | Hierarchy)[];
}

/**
 * Read a string and return a corresponding structure
 * - Example: "A + B + C" => [A, B, C]
 * - Example: "A => (B + C)" => [{ A: [B, C] }]
 */
function parseTrackHierarchy(input: string): (string | Hierarchy)[] {
  const text = input.trim();

  // Space out the input string for easier tokenization
  const spaced = text.replace(/((=>|->)|[+]|[(]|[)])/g, "_$1_");
  const tokens = spaced
    .split(/\_/)
    .filter(Boolean)
    .map((s) => s.trim());

  // Recursive function to parse tokens into a nested structure
  function parseExpression(index: number): [(string | Hierarchy)[], number] {
    const children: (string | Hierarchy)[] = [];

    // Iterate through all the matching tokens
    while (index < tokens.length) {
      const token = tokens[index++];

      // If nesting a group, try to merge the nodes
      if (token === "=>" || token === "->") {
        const parent = children.pop();
        if (!parent) break;
        const [child, newIndex] = parseExpression(index);

        // Make sure the parent is a single node
        if (typeof parent !== "string") break;

        children.push({ [parent]: child });
        index = newIndex;
      }

      // If starting a group, parse recursively
      else if (token === "(") {
        const [group, newIndex] = parseExpression(index);
        children.push(...group);
        index = newIndex;
      }

      // If ending a group, return the current nodes
      else if (token === ")") {
        return [children, index--];
      }

      // Otherwise, add the node to the current level
      else if (token === "+") continue;
      else children.push(token);
    }
    return [children, index];
  }

  // Begin parsing from index 0
  const [parsedTree] = parseExpression(0);
  return parsedTree;
}

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

/** Create a scale track from a string. */
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

/** Create a pattern track from a string. */
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
export const promptUserForTree: Thunk = (dispatch) =>
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
    onFocus: () => dispatchOpen("inputTree"),
    onCancel: () => dispatchClose("inputTree"),
    autoselect: true,
    large: true,
  })();
