import { Project } from "types/Project";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { LIVE_AUDIO_INSTANCES, LiveAudioInstance } from "types/Instrument";
import { getProperty, getProperties } from "types/util";
import { selectInstrumentById } from "redux/Instrument/InstrumentSelectors";

/**
 * Select the pattern track map from the store.
 * @param project The Project object.
 * @returns A map of pattern track IDs to pattern track objects.
 */
export const selectPatternTrackMap = (project: Project) =>
  project.arrangement.present.patternTracks.byId;

/**
 * Select all pattern track IDs from the store.
 * @param project The Project object.
 * @returns An array of pattern track IDs.
 */
export const selectPatternTrackIds = (project: Project) =>
  project.arrangement.present.patternTracks.allIds;

/**
 * Select all pattern tracks from the store.
 * @param project The Project object.
 * @returns An array of pattern tracks.
 */
export const selectPatternTracks = createSelector(
  [selectPatternTrackMap, selectPatternTrackIds],
  getProperties
);

/**
 * Select a specific pattern track from the store.
 * @param project The Project object.
 * @param id The pattern track ID.
 * @returns The pattern track object or undefined if not found.
 */
export const selectPatternTrackById = (project: Project, id?: TrackId) => {
  const patternTrackMap = selectPatternTrackMap(project);
  return getProperty(patternTrackMap, id);
};

/**
 * Select the instrument of a pattern track.
 * @param project The Project object.
 * @param id The pattern track ID.
 * @returns The instrument.
 */
export const selectPatternTrackInstrument = (
  project: Project,
  id?: TrackId
) => {
  const patternTrack = selectPatternTrackById(project, id);
  if (!patternTrack?.instrumentId) return undefined;
  return selectInstrumentById(project, patternTrack.instrumentId);
};

/**
 * Select the instrument key of a pattern track from the store.
 * @param project The Project object.
 * @param id The pattern track ID.
 * @returns The instrument key.
 */
export const selectPatternTrackInstrumentKey = (
  project: Project,
  id?: TrackId
) => {
  const instrument = selectPatternTrackInstrument(project, id);
  return instrument?.key;
};

/**
 * Select all pattern track samplers from the store.
 * @param project The Project object.
 * @returns A map of pattern track IDs to samplers.
 */
export const selectPatternTrackAudioInstances = (project: Project) => {
  const patternTracks = selectPatternTracks(project);
  return patternTracks.reduce((acc, cur) => {
    if (!cur?.id || !cur.instrumentId) return acc;
    const instance = getProperty(LIVE_AUDIO_INSTANCES, cur.instrumentId);
    if (!instance) return acc;
    return { ...acc, [cur.id]: instance };
  }, {} as Record<TrackId, LiveAudioInstance>);
};
