import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import { createTag } from "types/util";
import { getScaleTag } from "types/Scale";
import * as ScaleSlice from "./ScaleSlice";

export const SCALE_UNDO_TYPES: ActionGroup = {
  "scales/addScale": (action: PayloadAction<ScaleSlice.AddScalePayload>) => {
    const scaleTag = createTag(action.payload, getScaleTag);
    return `ADD_SCALE:${scaleTag}`;
  },
  "scales/removeScale": (
    action: PayloadAction<ScaleSlice.RemoveScalePayload>
  ) => {
    return `REMOVE_SCALE:${action.payload}`;
  },
  "scales/updateScale": (
    action: PayloadAction<ScaleSlice.UpdateScalePayload>
  ) => {
    const scaleTag = createTag(action.payload, getScaleTag);
    return `UPDATE_SCALE:${scaleTag}`;
  },
  "scales/addNoteToScale": (
    action: PayloadAction<ScaleSlice.AddNoteToScalePayload>
  ) => {
    return `ADD_NOTE_TO_SCALE:${action.payload.id}:${action.payload.note}`;
  },
  "scales/removeNoteFromScale": (
    action: PayloadAction<ScaleSlice.RemoveNoteFromScalePayload>
  ) => {
    return `REMOVE_NOTE_FROM_SCALE:${action.payload.id}:${action.payload.note}`;
  },
  "scales/transposeScale": (
    action: PayloadAction<ScaleSlice.TransposeScalePayload>
  ) => {
    return `TRANSPOSE_SCALE:${action.payload.id}:${action.payload.offset}`;
  },
  "scales/rotateScale": (
    action: PayloadAction<ScaleSlice.RotateScalePayload>
  ) => {
    return `ROTATE_SCALE:${action.payload.id}:${action.payload.offset}`;
  },
  "scales/clearScale": (
    action: PayloadAction<ScaleSlice.ClearScalePayload>
  ) => {
    return `CLEAR_SCALE:${action.payload}`;
  },
};
