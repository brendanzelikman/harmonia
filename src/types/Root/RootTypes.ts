import { ClipId } from "../Clip";
import { PatternId } from "../Pattern";
import { TrackId } from "../Track";
import { TranspositionId, TranspositionOffsetRecord } from "../Transposition";
import { Tick } from "../units";

/**
 * The `RootIds` interface contains the IDs of currently selected objects.
 * @property `selectedPatternId` - The ID of the currently selected pattern.
 * @property `selectedTrackId` - The ID of the currently selected track.
 * @property `selectedClipIds` - The IDs of the currently selected clips.
 * @property `selectedTranspositionIds` - The IDs of the currently selected transpositions.
 */
interface RootIds {
  selectedPatternId?: PatternId;
  selectedTrackId?: TrackId;
  selectedClipIds: ClipId[];
  selectedTranspositionIds: TranspositionId[];
}

/**
 * The `RootState` interface contains general state information.
 * @property `projectName` - The name of the project.
 * @property `showingShortcuts` - Whether the shortcuts modal is showing.
 * @property `showingTour` - Whether the tour is showing.
 * @property `tourStep` - The current step of the tour.
 */
interface RootState {
  projectName: string;
  showingShortcuts: boolean;
  showingTour: boolean;
  tourStep: number;
}

/**
 * The `RootMerge` interface contains information about merging clips.
 * @property `mergeName` - The name of the merged clip.
 * @property `mergeTranspositions` - Whether to merge transpositions.
 * @property `mergeWithNewPattern` - Whether to merge with a new pattern.
 */
interface RootMerge {
  mergeName: string;
  mergeTranspositions: boolean;
  mergeWithNewPattern: boolean;
}

/**
 * The `RootRepeat` interface contains information about repeating clips.
 * @property `repeatCount` - The number of times to repeat.
 * @property `repeatTranspositions` - Whether to repeat transpositions.
 * @property `repeatWithTransposition` - Whether to repeat with transposition.
 */
interface RootRepeat {
  repeatCount: number;
  repeatTranspositions: boolean;
  repeatWithTransposition: boolean;
}

/**
 * The `RootTranspose` interface contains information about transposing clips.
 * @property `transpositionOffsets` - The transposition offsets.
 * @property `transpositionDuration` - The transposition duration.
 */
interface RootTranspose {
  transpositionOffsets: TranspositionOffsetRecord;
  transpositionDuration: Tick;
}

/**
 * The `Toolkit` interface contains root operations.
 * @property `mergeName` - The name of the merged clip.
 * @property `mergeTranspositions` - Whether to merge transpositions.
 * @property `mergeWithNewPattern` - Whether to merge with a new pattern.
 * @property `repeatCount` - The number of times to repeat.
 * @property `repeatTranspositions` - Whether to repeat transpositions.
 * @property `repeatWithTransposition` - Whether to repeat with transposition.
 * @property `transpositionOffsets` - The transposition offsets.
 * @property `transpositionDuration` - The transposition duration.
 */
export type Toolkit = RootMerge & RootRepeat & RootTranspose;
interface RootToolkit {
  toolkit: Toolkit;
}

/**
 * The `Root` contains general information about the project, toolkit, and currently selected objects.
 * @property `projectName` - The name of the project.
 * @property `showingShortcuts` - Whether the shortcuts modal is showing.
 * @property `showingTour` - Whether the tour is showing.
 * @property `tourStep` - The current step of the tour.
 * @property `selectedPatternId` - The ID of the currently selected pattern.
 * @property `selectedTrackId` - The ID of the currently selected track.
 * @property `selectedClipIds` - The IDs of the currently selected clips.
 * @property `selectedTranspositionIds` - The IDs of the currently selected transpositions.
 * @property `toolkit` - The root operations.
 *
 */
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

/**
 * Checks if a given object is of type `Root`.
 * @param obj The object to check.
 * @returns True if the object is a `Root`, otherwise false.
 */
export const isRoot = (obj: unknown): obj is Root => {
  const candidate = obj as Root;
  return (
    candidate?.projectName !== undefined &&
    candidate?.showingTour !== undefined &&
    candidate?.tourStep !== undefined &&
    candidate?.selectedPatternId !== undefined &&
    candidate?.selectedClipIds !== undefined &&
    candidate?.selectedTranspositionIds !== undefined &&
    candidate?.showingShortcuts !== undefined &&
    candidate?.toolkit !== undefined
  );
};
