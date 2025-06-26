import { Thunk } from "types/Project/ProjectTypes";
import {
  selectSelectedClipIds,
  selectSelectedClips,
  selectSelectedMedia,
  selectSelectedPatternClips,
  selectSelectedTrackId,
  selectTimelineState,
} from "../TimelineSelectors";
import {
  seekTransportLeft,
  seekTransportRight,
} from "types/Transport/TransportTick";
import { nanoid } from "@reduxjs/toolkit";
import { updateClips } from "types/Clip/ClipSlice";
import { createUndoType } from "types/redux";
import { selectTrackIds } from "types/Track/TrackSelectors";
import { clearTimelineState, updateMediaSelection } from "../TimelineSlice";
import { selectTrackClipIds } from "types/Arrangement/ArrangementTrackSelectors";
import { isPatternClipId } from "types/Clip/ClipTypes";
import { selectPortals } from "types/Portal/PortalSelectors";
import {
  selectHasClips,
  selectClipDuration,
  selectClips,
} from "types/Clip/ClipSelectors";
import { sliceClip } from "types/Clip/ClipThunks";
import {
  moveSelectedMediaLeft,
  moveSelectedMediaRight,
} from "types/Media/MediaThunks";
import { replaceClipIdsInSelection } from "./TimelineSelectionThunks";

// -------------------------------
// Movement
// -------------------------------

/** Scrub the selected clips or the playhead one left. */
export const scrubClipsLeft = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const mediaLength = selectSelectedMedia(project).length;
  if (!mediaLength) dispatch(seekTransportLeft(1));
  else dispatch(moveSelectedMediaLeft(1));
};

/** Scrub the selected clips or the playhead one right. */
export const scrubClipsRight = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const mediaLength = selectSelectedMedia(project).length;
  if (!mediaLength) dispatch(seekTransportRight(1));
  else dispatch(moveSelectedMediaRight(1));
};

/** Move the selected clips or the playhead one left. */
export const moveClipsLeft = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const mediaLength = selectSelectedMedia(project).length;
  if (!mediaLength) dispatch(seekTransportLeft());
  else dispatch(moveSelectedMediaLeft());
};

/** Move the selected clips or the playhead one right. */
export const moveClipsRight = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const mediaLength = selectSelectedMedia(project).length;
  if (!mediaLength) dispatch(seekTransportRight());
  else dispatch(moveSelectedMediaRight());
};

/** Move the selected clips up. */
export const moveClipsUp = (): Thunk => (dispatch, getProject) => {
  const clips = selectSelectedClips(getProject());
  const trackIds = selectTrackIds(getProject());
  const undoType = createUndoType("moveClipsUp", nanoid());
  for (const clip of clips) {
    const newTrackId = trackIds[trackIds.indexOf(clip.trackId) - 1];
    if (newTrackId) {
      const data = [{ id: clip.id, trackId: newTrackId }];
      dispatch(updateClips({ data, undoType }));
    }
  }
};

/** Move the selected clips down. */
export const moveClipsDown = (): Thunk => (dispatch, getProject) => {
  const clips = selectSelectedClips(getProject());
  const trackIds = selectTrackIds(getProject());
  const undoType = createUndoType("moveClipsDown", nanoid());
  for (const clip of clips) {
    const newTrackId = trackIds[trackIds.indexOf(clip.trackId) + 1];
    if (newTrackId) {
      const data = [{ id: clip.id, trackId: newTrackId }];
      dispatch(updateClips({ data, undoType }));
    }
  }
};

/** Select the clip to the left of the selection. */
export const selectLeftClip = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const allClips = selectClips(project);
  const clips = selectSelectedClips(project);
  const trackId = selectSelectedTrackId(project) ?? clips[0]?.trackId;
  if (!trackId) return;

  const minTick = Math.min(...clips.map((c) => c.tick));
  const leftClip = allClips
    .filter((c) => c.trackId === trackId && c.tick < minTick)
    .sort((a, b) => b.tick - a.tick)[0];

  if (!leftClip) return;
  dispatch(replaceClipIdsInSelection({ data: [leftClip.id] }));
};

//** Select the clip to the right of the selection. */
export const selectRightClip = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const allClips = selectClips(project);
  const clips = selectSelectedClips(project);
  const trackId = selectSelectedTrackId(project) ?? clips[0]?.trackId;
  if (!trackId) return;

  const maxTick = Math.max(...clips.map((c) => c.tick));
  const rightClip = allClips
    .filter((c) => c.trackId === trackId && c.tick > maxTick)
    .sort((a, b) => a.tick - b.tick)[0];

  if (!rightClip) return;
  dispatch(replaceClipIdsInSelection({ data: [rightClip.id] }));
};

/** Unselect all clips */
export const unselectClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const state = selectTimelineState(project);
  if (state !== "idle") {
    dispatch(clearTimelineState());
  } else {
    dispatch(updateMediaSelection({ data: { clipIds: [], portalIds: [] } }));
  }
};

// --------------------------------
// Filters
// --------------------------------

/** Filter the selected clips to only include patterns. */
export const filterPatterns = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  const clipIds = selectSelectedClipIds(project);
  if (clipIds.length) {
    dispatch(
      updateMediaSelection({
        data: { clipIds: clipIds.filter(isPatternClipId) },
      })
    );
  } else if (trackId) {
    const trackClipIds = selectTrackClipIds(project, trackId);
    dispatch(
      updateMediaSelection({
        data: { clipIds: trackClipIds.filter(isPatternClipId) },
      })
    );
  }
};

/** Filter the selected clips to only include poses. */
export const filterPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  const clipIds = selectSelectedClipIds(project);
  if (clipIds.length) {
    dispatch(
      updateMediaSelection({
        data: { clipIds: clipIds.filter((id) => !isPatternClipId(id)) },
      })
    );
  } else if (trackId) {
    const trackClipIds = selectTrackClipIds(project, trackId);
    dispatch(
      updateMediaSelection({
        data: { clipIds: trackClipIds.filter((id) => !isPatternClipId(id)) },
      })
    );
  }
};

/** Filter the selected clips to only include portals. */
export const filterPortals = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  let portals = selectPortals(project);
  if (trackId) {
    portals = portals.filter((clipId) => clipId.trackId === trackId);
  }
  const portalIds = portals.map((clip) => clip.id);
  dispatch(updateMediaSelection({ data: { portalIds } }));
};

// --------------------------------
// Actions
// --------------------------------

/** Slice the selected clips */
export const sliceClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  if (!selectHasClips(project)) return;
  const selectedClips = selectSelectedPatternClips(project);
  const undoType = createUndoType("slice", selectedClips);
  for (const clip of selectedClips) {
    const duration = selectClipDuration(project, clip.id);
    if (clip.duration === 0) continue;
    const tick = Math.round(clip.tick + duration / 2);
    if (tick === clip.tick || tick === clip.tick + duration) continue;
    dispatch(sliceClip({ data: { id: clip.id, tick }, undoType }));
  }
};
