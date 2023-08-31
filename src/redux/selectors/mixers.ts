import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { TrackId } from "types/tracks";

const selectTrackId = (state: RootState, trackId: TrackId) => {
  return trackId;
};
const selectMixerIds = (state: RootState) => {
  return state.timeline.present.mixers.allIds;
};
const selectMixerMap = (state: RootState) => {
  return state.timeline.present.mixers.byId;
};

export const selectMixers = createSelector(
  [selectMixerIds, selectMixerMap],
  (ids, mixers) => ids.map((id) => mixers[id])
);

export const selectMixerById = createSelector(
  [selectMixerMap, selectTrackId],
  (mixers, trackId) => mixers[trackId]
);

export const selectMixerByTrackId = createSelector(
  [selectMixers, selectTrackId],
  (mixers, trackId) => mixers.find((mixer) => mixer.trackId === trackId)
);
