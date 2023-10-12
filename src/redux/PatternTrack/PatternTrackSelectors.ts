import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { selectInstrumentById } from "redux/selectors";
import { TrackId } from "types/Track";
import { LIVE_AUDIO_INSTANCES, LiveAudioInstance } from "types/Instrument";
import { getProperty, getProperties } from "types/util";

/**
 * Select the pattern track map from the store.
 * @param state The RootState object.
 * @returns A map of pattern track IDs to pattern track objects.
 */
export const selectPatternTrackMap = (state: RootState) =>
  state.session.present.patternTracks.byId;

/**
 * Select all pattern track IDs from the store.
 * @param state The RootState object.
 * @returns An array of pattern track IDs.
 */
export const selectPatternTrackIds = (state: RootState) =>
  state.session.present.patternTracks.allIds;

/**
 * Select all pattern tracks from the store.
 * @param state The RootState object.
 * @returns An array of pattern tracks.
 */
export const selectPatternTracks = createSelector(
  [selectPatternTrackMap, selectPatternTrackIds],
  getProperties
);

/**
 * Select a specific pattern track from the store.
 * @param state The RootState object.
 * @param id The pattern track ID.
 * @returns The pattern track object or undefined if not found.
 */
export const selectPatternTrackById = (state: RootState, id?: TrackId) => {
  const patternTrackMap = selectPatternTrackMap(state);
  return getProperty(patternTrackMap, id);
};

/**
 * Select the instrument of a pattern track.
 * @param state The RootState object.
 * @param id The pattern track ID.
 * @returns The instrument.
 */
export const selectPatternTrackInstrument = (
  state: RootState,
  id?: TrackId
) => {
  const patternTrack = selectPatternTrackById(state, id);
  if (!patternTrack?.instrumentId) return undefined;
  return selectInstrumentById(state, patternTrack.instrumentId);
};

/**
 * Select the instrument key of a pattern track from the store.
 * @param state The RootState object.
 * @param id The pattern track ID.
 * @returns The instrument key.
 */
export const selectPatternTrackInstrumentKey = (
  state: RootState,
  id?: TrackId
) => {
  const instrument = selectPatternTrackInstrument(state, id);
  return instrument?.key;
};

/**
 * Select all pattern track samplers from the store.
 * @param state The RootState object.
 * @returns A map of pattern track IDs to samplers.
 */
export const selectPatternTrackAudioInstances = (state: RootState) => {
  const patternTracks = selectPatternTracks(state);
  return patternTracks.reduce((acc, cur) => {
    if (!cur?.id || !cur.instrumentId) return acc;
    const instance = getProperty(LIVE_AUDIO_INSTANCES, cur.instrumentId);
    if (!instance) return acc;
    return { ...acc, [cur.id]: instance };
  }, {} as Record<TrackId, LiveAudioInstance>);
};
