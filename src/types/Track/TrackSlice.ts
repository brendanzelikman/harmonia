// ------------------------------------------------------------
// Pattern Track Slice
// ------------------------------------------------------------

import { createEntityAdapter } from "@reduxjs/toolkit";
import { createNormalSlice } from "lib/redux";
import { PatternTrack } from "./PatternTrack/PatternTrackTypes";
import { ScaleTrack } from "./ScaleTrack/ScaleTrackTypes";

export const patternTrackAdapter = createEntityAdapter<PatternTrack>();
export const patternTrackSlice = createNormalSlice<PatternTrack>({
  name: "patternTracks",
  adapter: patternTrackAdapter,
});
export const defaultPatternTrackState = patternTrackAdapter.getInitialState();

// ------------------------------------------------------------
// Scale Track Slice
// ------------------------------------------------------------

export const scaleTrackAdapter = createEntityAdapter<ScaleTrack>();
export const scaleTrackSlice = createNormalSlice<ScaleTrack>({
  name: "scaleTracks",
  adapter: scaleTrackAdapter,
});
export const defaultScaleTrackState = scaleTrackAdapter.getInitialState();
