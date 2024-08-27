import { PayloadAction } from "@reduxjs/toolkit";
import { Payload } from "lib/redux";

export type UndoType = string;

/** Stringify the action unless given the undoType parameter. */
export const groupByActionType = (action: PayloadAction<Payload>): UndoType => {
  const { type, payload } = action;
  if (payload?.undoType !== undefined) return payload.undoType;
  return `${type}:${JSON.stringify(payload?.data)}`;
};
