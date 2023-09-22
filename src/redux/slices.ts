import { Clip, Transposition } from "types";

export * as Clips from "./slices/clips";
export * as Transpositions from "./slices/transpositions";
export * as Patterns from "./slices/patterns";
export * as Scales from "./slices/scales";

export * as PatternTracks from "./slices/patternTracks";
export * as ScaleTracks from "./slices/scaleTracks";
export * as Mixers from "./slices/mixers";
export * as Tracks from "redux/thunks/tracks";

export * as SessionMap from "./slices/sessionMap";

export * as Root from "./slices/root";
export * as Editor from "./slices/editor";
export * as Timeline from "./slices/timeline";
export * as Transport from "./slices/transport";

export type ObjectPayload = {
  clips?: Clip[];
  transpositions?: Transposition[];
};

export type PartialObjectPayload = {
  clips?: Partial<Clip>[];
  transpositions?: Partial<Transposition>[];
};
