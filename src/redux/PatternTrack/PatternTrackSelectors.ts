import { Project } from "types/Project";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { LIVE_AUDIO_INSTANCES, LiveAudioInstance } from "types/Instrument";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { selectInstrumentById } from "redux/Instrument/InstrumentSelectors";

/** Select the pattern track map. */
export const selectPatternTrackMap = (project: Project) =>
  project.arrangement.present.patternTracks.byId;

/** Select all pattern track IDs. */
export const selectPatternTrackIds = (project: Project) =>
  project.arrangement.present.patternTracks.allIds;

/** Select all pattern tracks. */
export const selectPatternTracks = createSelector(
  [selectPatternTrackMap, selectPatternTrackIds],
  getValuesByKeys
);

/** Select a pattern track by ID. */
export const selectPatternTrackById = (project: Project, id?: TrackId) => {
  const patternTrackMap = selectPatternTrackMap(project);
  return getValueByKey(patternTrackMap, id);
};

/** Select the instrument of a pattern track. */
export const selectPatternTrackInstrument = (
  project: Project,
  id?: TrackId
) => {
  const patternTrack = selectPatternTrackById(project, id);
  return selectInstrumentById(project, patternTrack?.instrumentId);
};

/** Select the instrument key of a pattern track. */
export const selectPatternTrackInstrumentKey = (
  project: Project,
  id?: TrackId
) => {
  const instrument = selectPatternTrackInstrument(project, id);
  return instrument?.key;
};

/** Select a record of all pattern tracks and their live audio instances. */
export const selectPatternTrackAudioInstances = createSelector(
  [selectPatternTracks],
  (patternTracks) => {
    return patternTracks.reduce((acc, cur) => {
      if (!cur?.id || !cur.instrumentId) return acc;
      const instance = getValueByKey(LIVE_AUDIO_INSTANCES, cur.instrumentId);
      if (!instance) return acc;
      return { ...acc, [cur.id]: instance };
    }, {} as Record<TrackId, LiveAudioInstance>);
  }
);
