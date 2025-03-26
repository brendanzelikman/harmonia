// ------------------------------------------------------------
// Track Slice
// ------------------------------------------------------------

import { createEntityAdapter } from "@reduxjs/toolkit";
import { createNormalSlice } from "lib/redux";
import { Track } from "./TrackTypes";

export const trackAdapter = createEntityAdapter<Track>();
export const trackSlice = createNormalSlice<Track>({
  name: "tracks",
  adapter: trackAdapter,
});
export const trackActions = trackSlice.actions;
export const defaultTrackState = trackAdapter.getInitialState();
