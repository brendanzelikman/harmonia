import { ClipId } from "./clip";
import { PatternId } from "./pattern";
import { TrackId } from "./tracks";
import { TranspositionId, TranspositionOffsetRecord } from "./transposition";
import { Tick } from "./units";

// Active IDs
interface RootIds {
  selectedPatternId?: PatternId;
  selectedTrackId?: TrackId;
  selectedClipIds: ClipId[];
  selectedTranspositionIds: TranspositionId[];
}

interface RootState {
  projectName: string;
  showingShortcuts: boolean;
  showingTour: boolean;
  tourStep: number;
}

interface RootMerge {
  mergeName: string;
  mergeTranspositions: boolean;
  mergeWithNewPattern: boolean;
}
interface RootRepeat {
  repeatCount: number;
  repeatTranspositions: boolean;
  repeatWithTransposition: boolean;
}
interface RootTranspose {
  transpositionOffsets: TranspositionOffsetRecord;
  transpositionDuration: Tick;
}

export type Toolkit = RootMerge & RootRepeat & RootTranspose;
interface RootToolkit {
  toolkit: Toolkit;
}

export interface Root extends RootIds, RootState, RootToolkit {}

export const defaultRoot: Root = {
  projectName: "New Project",
  showingTour: false,
  tourStep: 1,

  selectedPatternId: "new-pattern",
  selectedClipIds: [],
  selectedTranspositionIds: [],
  showingShortcuts: false,

  toolkit: {
    mergeName: "",
    mergeTranspositions: false,
    mergeWithNewPattern: false,

    repeatCount: 1,
    repeatTranspositions: false,
    repeatWithTransposition: false,

    transpositionOffsets: {
      _self: 0,
      _chromatic: 0,
    },
    transpositionDuration: 0,
  },
};

export const isRoot = (obj: unknown): obj is Root => {
  return (
    (obj as Root).projectName !== undefined &&
    (obj as Root).showingTour !== undefined &&
    (obj as Root).tourStep !== undefined &&
    (obj as Root).selectedPatternId !== undefined &&
    (obj as Root).selectedClipIds !== undefined &&
    (obj as Root).selectedTranspositionIds !== undefined &&
    (obj as Root).showingShortcuts !== undefined &&
    (obj as Root).toolkit !== undefined
  );
};
