import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import {
  getTranspositionAsString,
  getTranspositionUpdateAsString,
} from "types/Transposition";
import { toString } from "utils/objects";
import * as TranspositionSlice from "./TranspositionSlice";
import { getPortalAsString, getPortalUpdateAsString } from "types/Portal";

export const TRANSPOSITION_UNDO_TYPES: ActionGroup = {
  "transpositions/addTranspositions": (
    action: PayloadAction<TranspositionSlice.AddTranspositionsPayload>
  ) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(poses, getTranspositionAsString);
    const portalTag = toString(portals, getPortalAsString);
    return `ADD_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "transpositions/_updateTranspositions": (
    action: PayloadAction<TranspositionSlice.UpdateTranspositionsPayload>
  ) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(poses, getTranspositionUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "transpositions/removeTranspositions": (
    action: PayloadAction<TranspositionSlice.RemoveTranspositionsPayload>
  ) => {
    const { clipIds, poseIds, portalIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(poseIds);
    const portalTag = toString(portalIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "transpositions/_sliceTransposition": (
    action: PayloadAction<TranspositionSlice.SliceTranspositionPayload>
  ) => {
    const { oldTransposition, firstTransposition, secondTransposition } =
      action.payload;
    return `SLICE_MEDIA:${oldTransposition.id},${firstTransposition.id},${secondTransposition.id}`;
  },
  "transpositions/clearTranspositionsByTrackId": (
    action: PayloadAction<TranspositionSlice.ClearTranspositionsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "transpositions/removeTranspositionsByTrackId": (
    action: PayloadAction<TranspositionSlice.RemoveTranspositionsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.originalId}`;
  },
};
