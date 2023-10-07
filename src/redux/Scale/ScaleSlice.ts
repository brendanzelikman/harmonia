import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { initializeState } from "types/util";
import { MIDI } from "types/midi";
import {
  defaultScale,
  ScaleId,
  getRotatedScale as _rotateScale,
  ScaleObject,
  TrackScaleName,
} from "types/Scale";
import { Note } from "types/units";

// The initial scale has the track scale name
const initialScale = { ...defaultScale, name: TrackScaleName };

/**
 * The list of Scale IDs can be directly set (used for dragging).
 */
export type SetScaleIdsPayload = ScaleId[];

/**
 * A `Scale` can be added to the store.
 */
export type AddScalePayload = ScaleObject;

/**
 * A `Scale` can be removed from the store by ID.
 */
export type RemoveScalePayload = ScaleId;

/**
 * A `Scale` can be updated with a partial `ScaleObject`.
 */
export type UpdateScalePayload = Partial<ScaleObject>;

/**
 * A `Note` can be added to a `Scale` by ID.
 */
export type AddNoteToScalePayload = { id: ScaleId; note: Note };

/**
 * A `Note` can be removed from a `Scale` by ID.
 */
export type RemoveNoteFromScalePayload = { id: ScaleId; note: Note };

/**
 * A `Scale` can be transposed by a number of semitones.
 */
export type TransposeScalePayload = { id: ScaleId; offset: number };

/**
 * A `Scale` can be rotated by a number of semitones.
 */
export type RotateScalePayload = { id: ScaleId; offset: number };

/**
 * A `Scale` can be cleared by ID.
 */
export type ClearScalePayload = ScaleId;

const initialState = initializeState<ScaleId, ScaleObject>([initialScale]);

/**
 * The scales slice contains all custom scales in the store.
 *
 * @property `setScaleIds` - Set the list of scale IDs.
 * @property `addScale` - Add a scale to the store.
 * @property `removeScale` - Remove a scale from the store.
 * @property `updateScale` - Update a scale in the store.
 * @property `addNoteToScale` - Add a note to a scale.
 * @property `removeNoteFromScale` - Remove a note from a scale.
 * @property `transposeScale` - Transpose a scale by a number of semitones.
 * @property `rotateScale` - Rotate a scale by a number of steps.
 * @property `clearScale` - Clear a scale by ID.
 *
 */
export const scalesSlice = createSlice({
  name: "scales",
  initialState,
  reducers: {
    /**
     * Set the list of scale IDs.
     * @param state The `scales` state.
     * @param action The payload action containing the list of scale IDs.
     */
    setScaleIds: (state, action: PayloadAction<SetScaleIdsPayload>) => {
      const scaleIds = action.payload;
      state.allIds = scaleIds;
    },
    /**
     * Add a scale to the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale.
     */
    addScale: (state, action: PayloadAction<AddScalePayload>) => {
      const scale = action.payload;
      state.allIds = union(state.allIds, [scale.id]);
      state.byId[scale.id] = scale;
    },
    /**
     * Remove a scale from the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID.
     */
    removeScale: (state, action: PayloadAction<RemoveScalePayload>) => {
      const scaleId = action.payload;
      const index = state.allIds.findIndex((id) => id === scaleId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[scaleId];
    },
    /**
     * Update a scale in the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and partial scale.
     */
    updateScale: (state, action: PayloadAction<UpdateScalePayload>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
    /**
     * Add a note to a scale.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and note.
     */
    addNoteToScale: (state, action: PayloadAction<AddNoteToScalePayload>) => {
      const { id, note } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Get the pitch classes of the scale and note
      const scalePitches = scale.notes.map((n) => MIDI.toPitchClass(n));
      const notePitch = MIDI.toPitchClass(note);

      // Make sure the note is not already in the scale
      if (scalePitches.includes(notePitch)) return;

      // Add the note to the scale and sort the notes
      state.byId[id].notes = [...scale.notes, note].sort((a, b) => a - b);
    },
    /**
     * Remove a note from a scale.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and note.
     */
    removeNoteFromScale: (
      state,
      action: PayloadAction<RemoveNoteFromScalePayload>
    ) => {
      const { id, note } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Get the pitch classes of the scale and note
      const scalePitches = scale.notes.map((n) => MIDI.toPitchClass(n));
      const notePitch = MIDI.toPitchClass(note);

      // Make sure the note is in the scale
      if (!scalePitches.includes(notePitch)) return;

      // Remove the note from the scale by pitch
      state.byId[id].notes = scale.notes.filter(
        (n) => MIDI.toPitchClass(n) !== notePitch
      );
    },
    /**
     * Transpose a scale by a number of semitones.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and offset.
     */
    transposeScale: (state, action: PayloadAction<TransposeScalePayload>) => {
      const { id, offset } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Transpose the notes in the scale by the offset
      state.byId[id].notes = scale.notes.map((n) => n + offset);
    },
    /**
     * Rotate a scale by a number of steps.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and offset.
     */
    rotateScale: (state, action: PayloadAction<RotateScalePayload>) => {
      const { id, offset } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Invert the notes in the scale by the offset
      state.byId[id] = {
        ...state.byId[id],
        ..._rotateScale(scale, offset),
      };
    },
    /**
     * Clear a scale by ID.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID.
     */
    clearScale: (state, action: PayloadAction<ClearScalePayload>) => {
      const id = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      state.byId[id].notes = [];
    },
  },
});

export const {
  setScaleIds,
  addScale,
  removeScale,
  addNoteToScale,
  removeNoteFromScale,
  clearScale,
  updateScale,
  transposeScale,
  rotateScale,
} = scalesSlice.actions;

export default scalesSlice.reducer;
