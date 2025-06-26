import { selectPatternById } from "types/Pattern/PatternSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectCurrentTimelineTick,
  selectSelectedPatternClips,
  selectSelectedTrackId,
  selectStoredPatternByIndex,
} from "types/Timeline/TimelineSelectors";
import { addPatternToStorage } from "types/Timeline/TimelineSlice";
import { createNewPatternClip } from "types/Track/PatternTrack/PatternTrackThunks";

/** Store the first pattern selected to the given slot. */
export const savePatternToSlot =
  (slot: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternClips = selectSelectedPatternClips(project);
    if (patternClips.length === 0) return;
    const patternId = patternClips[0].patternId;
    const pattern = selectPatternById(project, patternId);
    if (!pattern) return;
    dispatch(addPatternToStorage({ data: { index: slot - 1, pattern } }));
  };

/** Create a new clip based on the pattern in the given slot. */
export const applyPatternFromSlot =
  (slot: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pattern = selectStoredPatternByIndex(project, slot - 1);
    const trackId = selectSelectedTrackId(project);
    if (!pattern || !trackId) return;
    const tick = selectCurrentTimelineTick(project);
    dispatch(
      createNewPatternClip({ data: { pattern, clip: { tick, trackId } } })
    );
  };
