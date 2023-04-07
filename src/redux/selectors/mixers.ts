import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { MixerId } from "types/mixer";
import { TrackId } from "types/tracks";

const selectMixerId = (state: RootState, id: MixerId) => id;
const selectTrackId = (state: RootState, trackId: TrackId) => trackId;

const selectTimelineMixers = (state: RootState) =>
  state.timeline.present.mixers;

export const selectMixers = createSelector([selectTimelineMixers], (mixers) =>
  mixers.allIds.map((id) => mixers.byId[id])
);

export const selectMixerById = createSelector(
  [selectTimelineMixers, selectMixerId],
  (mixers, id) => mixers.byId[id]
);

export const selectMixerByTrackId = createSelector(
  [selectMixers, selectTrackId],
  (mixers, trackId) => mixers.find((mixer) => mixer.trackId === trackId)
);
