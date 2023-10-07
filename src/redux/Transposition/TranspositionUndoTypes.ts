import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import { getClipTag } from "types/Clip";
import { getTranspositionTag } from "types/Transposition";
import { createTag } from "types/util";
import * as TranspositionSlice from "./TranspositionSlice";

export const TRANSPOSITION_UNDO_TYPES: ActionGroup = {
  "transpositions/addTranspositions": (
    action: PayloadAction<TranspositionSlice.AddTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `ADD_MEDIA:${clipTag},${transpositionTag}`;
  },
  "transpositions/removeTranspositions": (
    action: PayloadAction<TranspositionSlice.RemoveTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `REMOVE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "transpositions/updateTranspositions": (
    action: PayloadAction<TranspositionSlice.UpdateTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `UPDATE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "transpositions/removeTranspositionsByTrackId": (
    action: PayloadAction<TranspositionSlice.RemoveTranspositionsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "transpositions/clearTranspositionsByTrackId": (
    action: PayloadAction<TranspositionSlice.ClearTranspositionsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
};
