import { createEntityAdapter } from "@reduxjs/toolkit";
import { createNormalSlice } from "utils/redux";
import { ScaleObject } from "./ScaleTypes";

export const scaleAdapter = createEntityAdapter<ScaleObject>();

export const scalesSlice = createNormalSlice({
  name: "scales",
  adapter: scaleAdapter,
});

export const defaultScaleState = scaleAdapter.getInitialState();

export const {
  addOne: addScale,
  addMany: addScales,
  setOne: setScale,
  setMany: setScales,
  setAll: setAllScales,
  setIds: setScaleIds,
  removeOne: removeScale,
  removeMany: removeScales,
  removeAll: removeAllScales,
  updateOne: updateScale,
  updateMany: updateScales,
  upsertOne: upsertScale,
  upsertMany: upsertScales,
} = scalesSlice.actions;
