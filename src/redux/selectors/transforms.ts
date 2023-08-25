import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { getClipDuration } from "types/clips";
import { selectPatterns } from "./patterns";
import { inRange } from "lodash";
import { TransformId } from "types/transform";
// import { Transform } from "types/transform";

export const selectTransformId = (state: RootState, id: TransformId) => id;

// Select all transforms from the store
export const selectTransforms = createSelector(
  [(state: RootState) => state.timeline.present.transforms],
  (transforms) => transforms.allIds.map((id) => transforms.byId[id])
);

// Select all transform IDs from the store
export const selectTransformIds = (state: RootState) => {
  if (!state?.timeline?.present?.transforms?.allIds) return [];
  return state.timeline.present.transforms.allIds;
};

export const selectTransformsByIds = (state: RootState, ids: TransformId[]) => {
  if (!state || !ids) return [];
  return ids.map((id) => state.timeline.present.transforms.byId[id]);
};

// Select a specific transform from the store
export const selectTransform = createSelector(
  [selectTransforms, selectTransformId],
  (transforms, id) => transforms.find((transform) => transform.id === id)
);

export const selectSelectedClipTransforms = createSelector(
  [
    selectTransforms,
    selectPatterns,
    (state: RootState) =>
      state.timeline.present.clips.allIds.map(
        (id) => state.timeline.present.clips.byId[id]
      ),
    (state: RootState) => state.root.selectedClipIds,
  ],
  (transforms, patterns, clips, clipIds) => {
    const selectedClips = clipIds.map((id) =>
      clips.find((clip) => clip.id === id)
    );
    return transforms.filter((transform) => {
      return selectedClips.some((clip) => {
        if (!clip) return false;
        if (clip.trackId !== transform.trackId) return false;
        const pattern = patterns.find(
          (pattern) => pattern.id === clip.patternId
        );
        if (!pattern) return false;
        const duration = getClipDuration(clip, pattern);
        return inRange(
          transform.time,
          clip.startTime,
          clip.startTime + duration
        );
      });
    });
  }
);
