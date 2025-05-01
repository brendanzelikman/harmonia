import { Payload, unpackUndoType } from "types/redux";
import { union, difference, without, pick } from "lodash";
import { exportClipsToMidi } from "types/Clip/ClipExporters";
import { ClipId } from "types/Clip/ClipTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { selectTrackIds } from "types/Track/TrackSelectors";
import { deleteTrack } from "types/Track/TrackThunks";
import { next, prev } from "utils/array";
import {
  selectSelectedTrackId,
  selectSelectedClipIds,
  selectIsClipSelected,
} from "../TimelineSelectors";
import { setSelectedTrackId, updateMediaSelection } from "../TimelineSlice";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { exportProjectToWAV } from "types/Project/ProjectExporters";

// ------------------------------------------------------------
// Selected Track
// ------------------------------------------------------------

/** Select the previous track in the timeline or pick the first one. */
export const selectPreviousTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = selectSelectedTrackId(project);
  const trackIds = selectTrackIds(project);
  const index = selectedTrackId ? trackIds.indexOf(selectedTrackId) : 1;
  const previousTrackId = prev(trackIds, index);
  dispatch(setSelectedTrackId({ data: previousTrackId }));
};

/** Select the next track in the timeline or pick the first one. */
export const selectNextTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = selectSelectedTrackId(project);
  const trackIds = selectTrackIds(project);
  const index = selectedTrackId ? trackIds.indexOf(selectedTrackId) : -1;
  const nextTrackId = next(trackIds, index);
  dispatch(setSelectedTrackId({ data: nextTrackId }));
};

/** Delete the selected track. */
export const deleteSelectedTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  if (trackId) dispatch(deleteTrack({ data: trackId }));
};

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
    const oldLength = selectedClipIds.length;
    if (!oldLength) return;
    const newIds = difference(selectedClipIds, payload.data);
    const newLength = newIds.length;
    if (oldLength === newLength) return;
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
  (payload: Payload<ClipId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clipId = payload.data;
    const undoType = unpackUndoType(payload, "toggleClipIdInSelection");
    const selectedClipIds = selectSelectedClipIds(project);
    const newIds = selectedClipIds.includes(clipId)
      ? without(selectedClipIds, clipId)
      : union(selectedClipIds, [clipId]);
    dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
  };

/** Export all selected clips to a MIDI file. */
export const exportSelectedClipsToMIDI =
  (filename?: string): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const name = selectProjectName(project);
    const selectedClipIds = selectSelectedClipIds(project);
    dispatch(
      exportClipsToMidi(selectedClipIds, {
        filename: filename ?? `${name} Clips`,
        download: true,
      })
    );
  };

/** Export all selected clips to a WAV file. */
export const exportSelectedClipsToWAV =
  (filename?: string): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternClipIds = project.present.patternClips.ids.filter((id) =>
      selectIsClipSelected(project, id as ClipId)
    );
    const patternClipMap = pick(
      project.present.patternClips.entities,
      patternClipIds
    );
    const poseClipIds = project.present.poseClips.ids.filter((id) =>
      selectIsClipSelected(project, id as ClipId)
    );
    const poseClipMap = pick(project.present.poseClips.entities, poseClipIds);

    dispatch(
      exportProjectToWAV(
        {
          ...project,
          present: {
            ...project.present,
            patternClips: { ids: patternClipIds, entities: patternClipMap },
            poseClips: { ids: poseClipIds, entities: poseClipMap },
          },
        },
        { download: true, filename }
      )
    );
  };
