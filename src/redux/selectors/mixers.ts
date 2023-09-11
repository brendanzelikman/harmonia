import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { MixerId } from "types";

const selectMixerId = (state: RootState, mixerId: MixerId) => {
  return mixerId;
};
const selectMixerIds = (state: RootState) => {
  return state.session.present.mixers.allIds;
};
const selectMixerMap = (state: RootState) => {
  return state.session.present.mixers.byId;
};

export const selectMixers = createSelector(
  [selectMixerIds, selectMixerMap],
  (ids, mixers) => ids.map((id) => mixers[id])
);

export const selectMixerById = createSelector(
  [selectMixerMap, selectMixerId],
  (mixers, trackId) => mixers[trackId]
);
