import { createEntityAdapter } from "@reduxjs/toolkit";
import { Portal } from "./PortalTypes";
import { createNormalSlice } from "lib/redux";

export const portalAdapter = createEntityAdapter<Portal>();

export const portalSlice = createNormalSlice({
  name: "portals",
  adapter: portalAdapter,
});

export const defaultPortalState = portalAdapter.getInitialState();

export const {
  addOne: addPortal,
  addMany: addPortals,
  setOne: setPortal,
  setMany: setPortals,
  setAll: setAllPortals,
  removeOne: removePortal,
  removeMany: removePortals,
  removeAll: removeAllPortals,
  updateOne: updatePortal,
  updateMany: updatePortals,
  upsertOne: upsertPortal,
  upsertMany: upsertPortals,
} = portalSlice.actions;
