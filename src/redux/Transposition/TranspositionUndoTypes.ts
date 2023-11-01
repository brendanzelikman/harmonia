import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import {
  getTranspositionAsString,
  getTranspositionUpdateAsString,
} from "types/Transposition";
import { toString } from "utils/objects";
import * as TranspositionSlice from "./TranspositionSlice";

export const TRANSPOSITION_UNDO_TYPES: ActionGroup = {
  "transpositions/addTranspositions": (
    action: PayloadAction<TranspositionSlice.AddTranspositionsPayload>
  ) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(transpositions, getTranspositionAsString);
    return `ADD_MEDIA:${clipTag},${poseTag}`;
  },
  "transpositions/updateTranspositions": (
    action: PayloadAction<TranspositionSlice.UpdateTranspositionsPayload>
  ) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(transpositions, getTranspositionUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag}`;
  },
  "transpositions/removeTranspositions": (
    action: PayloadAction<TranspositionSlice.RemoveTranspositionsPayload>
  ) => {
    const { clipIds, transpositionIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(transpositionIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag}`;
  },
  "transpositions/_sliceTransposition": (
    action: PayloadAction<TranspositionSlice.SliceTranspositionPayload>
  ) => {
    const { oldTransposition, firstTransposition, secondTransposition } =
      action.payload;
    return `SLICE_MEDIA:${oldTransposition.id},${firstTransposition.id},${secondTransposition.id}`;
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
