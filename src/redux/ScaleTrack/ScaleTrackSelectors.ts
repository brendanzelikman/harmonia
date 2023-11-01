import { createSelector } from "@reduxjs/toolkit";
import { selectScaleMap } from "redux/selectors";
import { Project } from "types/Project";
import { TrackId } from "types/Track";
import { getValueByKey, getValuesByKeys } from "utils/objects";

/** Select the scale track map. */
export const selectScaleTrackMap = (project: Project) =>
  project.arrangement.present.scaleTracks.byId;

/** Select all scale track IDs.. */
export const selectScaleTrackIds = (project: Project) =>
  project.arrangement.present.scaleTracks.allIds;

/** Select all scale tracks. */
export const selectScaleTracks = createSelector(
  [selectScaleTrackMap, selectScaleTrackIds],
  getValuesByKeys
);

/** Select a scale track by ID. */
export const selectScaleTrackById = (project: Project, id?: TrackId) => {
  const scaleTrackMap = selectScaleTrackMap(project);
  return getValueByKey(scaleTrackMap, id);
};

/** Select a scale track by scale ID. */
export const selectScaleTrackByScaleId = (project: Project, id?: TrackId) => {
  const scaleTrackMap = selectScaleTrackMap(project);
  return Object.values(scaleTrackMap).find((track) => track.scaleId === id);
};

/** Select the scales of a scale track. */
export const selectScaleTrackScale = (project: Project, id?: TrackId) => {
  const scaleTrack = selectScaleTrackById(project, id);
  const scaleMap = selectScaleMap(project);
  return getValueByKey(scaleMap, scaleTrack?.scaleId);
};

/** Select the scales of a list of scale tracks. */
export const selectScaleTrackScales = (project: Project, ids: TrackId[]) => {
  const scaleTrackMap = selectScaleTrackMap(project);
  const scaleMap = selectScaleMap(project);
  return getValuesByKeys(
    scaleMap,
    ids.map((id) => scaleTrackMap[id]?.scaleId)
  );
};
