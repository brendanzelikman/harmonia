import { ClipId } from "./clips";
import { PatternId } from "./patterns";
import { TrackId } from "./tracks";
import { TransformId } from "./transform";

// Active IDs
interface RootIds {
  selectedPatternId?: PatternId;
  selectedTrackId?: TrackId;
  selectedClipIds: ClipId[];
  selectedTransformIds: TransformId[];
}

interface RootState {
  projectName: string;
  showingShortcuts: boolean;
  showingTour: boolean;
  tourStep: number;
}

interface RootMerge {
  mergeName: string;
  mergeTransforms: boolean;
  mergeWithNewPattern: boolean;
}
interface RootRepeat {
  repeatCount: number;
  repeatTransforms: boolean;
  repeatWithTranspose: boolean;
}
interface RootTranspose {
  chromaticTranspose: number;
  scalarTranspose: number;
  chordalTranspose: number;
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
  selectedTransformIds: [],
  showingShortcuts: false,

  toolkit: {
    mergeName: "",
    mergeTransforms: false,
    mergeWithNewPattern: false,

    repeatCount: 1,
    repeatTransforms: false,
    repeatWithTranspose: false,

    chromaticTranspose: 0,
    scalarTranspose: 0,
    chordalTranspose: 0,
  },
};

export const isRoot = (obj: any): obj is Root => {
  const { projectName, showingShortcuts, showingTour, tourStep, toolkit } = obj;
  return (
    projectName !== undefined &&
    showingShortcuts !== undefined &&
    showingTour !== undefined &&
    tourStep !== undefined &&
    toolkit !== undefined
  );
};
