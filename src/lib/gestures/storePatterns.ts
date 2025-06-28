import { nanoid } from "@reduxjs/toolkit";
import { removePatternClip } from "types/Clip/ClipSlice";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { createUndoType } from "types/redux";
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
    const clipId = patternClips[0].id;
    const patternId = patternClips[0].patternId;
    const pattern = selectPatternById(project, patternId);
    if (!pattern) return;
    const undoType = createUndoType("savePatternToSlot", nanoid());
    dispatch(
      addPatternToStorage({ data: { index: slot - 1, pattern }, undoType })
    );
    dispatch(removePatternClip({ data: clipId, undoType }));
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
