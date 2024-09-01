import { Payload, unpackUndoType } from "lib/redux";
import { union, difference, without } from "lodash";
import { exportClipsToMidi } from "types/Clip/ClipThunks";
import { ClipId } from "types/Clip/ClipTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { selectOrderedTrackIds } from "types/Track/TrackSelectors";
import { deleteTrack } from "types/Track/TrackThunks";
import { mod } from "utils/math";
import {
  selectSelectedTrackId,
  selectSelectedClipIds,
} from "../TimelineSelectors";
import { setSelectedTrackId, updateMediaSelection } from "../TimelineSlice";

// ------------------------------------------------------------
// Selected Track
// ------------------------------------------------------------

/** Select the previous track in the timeline or pick the first one. */
export const selectPreviousTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = selectSelectedTrackId(project);
  const trackIds = selectOrderedTrackIds(project);
  const index = selectedTrackId ? trackIds.indexOf(selectedTrackId) : 1;
  const previousTrackId = trackIds[mod(index - 1, trackIds.length)];
  dispatch(setSelectedTrackId({ data: previousTrackId }));
};

/** Select the next track in the timeline or pick the first one. */
export const selectNextTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = selectSelectedTrackId(project);
  const trackIds = selectOrderedTrackIds(project);
  const index = selectedTrackId ? trackIds.indexOf(selectedTrackId) : -1;
  const nextTrackId = trackIds[mod(index + 1, trackIds.length)];
  dispatch(setSelectedTrackId({ data: nextTrackId }));
};

/** Delete the selected track. */
export const deleteSelectedTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  if (trackId) dispatch(deleteTrack({ data: trackId }));
};

// ------------------------------------------------------------
// Selected Clips
// ------------------------------------------------------------

/** Add a list of clip IDs to the current selection. */
export const addClipIdsToSelection =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "addClipIdsToSelection");
    const project = getProject();
    const selectedClipIds = selectSelectedClipIds(project);
    const newIds = union(selectedClipIds, payload.data);
    dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
  };

/** Remove a list of clip IDs from the current selection. */
export const removeClipIdsFromSelection =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "removeClipIdsFromSelection");
    const project = getProject();
    const selectedClipIds = selectSelectedClipIds(project);
    const newIds = difference(selectedClipIds, payload.data);
    dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
  };

/** Replace the list of clip IDs in the current selection. */
export const replaceClipIdsInSelection =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch) => {
    const clipIds = payload.data;
    const undoType = unpackUndoType(payload, "replaceClipIdsInSelection");
    dispatch(updateMediaSelection({ data: { clipIds }, undoType }));
  };

/** Clear the clip IDs in the current selection. */
export const clearClipIdsFromSelection =
  (payload: Payload): Thunk =>
  (dispatch) => {
    dispatch(updateMediaSelection({ ...payload, data: { clipIds: [] } }));
  };

/** Toggle the selection of a clip ID. */
export const toggleClipIdInSelection =
  (clipId: ClipId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = selectSelectedClipIds(project);
    const newIds = selectedClipIds.includes(clipId)
      ? without(selectedClipIds, clipId)
      : union(selectedClipIds, [clipId]);
    dispatch(updateMediaSelection({ data: { clipIds: newIds } }));
  };

/** Export all selected clips to a MIDI file. */
export const exportSelectedClipsToMIDI =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = selectSelectedClipIds(project);
    dispatch(exportClipsToMidi(selectedClipIds));
  };
