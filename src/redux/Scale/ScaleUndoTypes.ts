import * as _ from "./ScaleSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getScaleAsString, getScaleUpdateAsString } from "types/Scale";

export const SCALE_UNDO_TYPES: ActionGroup = {
  "scales/addScale": (action: PayloadAction<_.AddScalePayload>) => {
    return `ADD_SCALE:${getScaleAsString(action.payload)}`;
  },
  "scales/removeScale": (action: PayloadAction<_.RemoveScalePayload>) => {
    return `REMOVE_SCALE:${action.payload}`;
  },
  "scales/updateScale": (action: PayloadAction<_.UpdateScalePayload>) => {
    return `UPDATE_SCALE:${getScaleUpdateAsString(action.payload)}`;
  },
};
