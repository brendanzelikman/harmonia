import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeState } from "redux/util";
import { Mixer, Effect, EffectType, MixerId } from "types/mixer";
import { TrackId } from "types/tracks";

interface TrackMixer extends Mixer {
  trackId: TrackId;
  id: MixerId;
}

const initialState = initializeState<MixerId, TrackMixer>([]);

const updateMixerEffectByIndex = (
  mixer: Mixer,
  index: number,
  update: Partial<Effect>
): Mixer => {
  return {
    ...mixer,
    effects: mixer.effects.map((effect, i) => {
      if (i !== index) return effect;
      return { ...effect, ...update };
    }),
  };
};

const updateMixerByType = (
  mixer: Mixer,
  type: EffectType,
  update: Partial<Effect>
): Mixer => {
  const index = mixer.effects.findIndex((effect) => type === effect.type);
  if (index === -1) return mixer;
  return updateMixerEffectByIndex(mixer, index, update);
};

const mixersSlice = createSlice({
  name: "mixers",
  initialState,
  reducers: {
    addMixer: (state, action: PayloadAction<Mixer>) => {
      const mixer = action.payload;
      state.allIds.push(mixer.id);
      state.byId[mixer.id] = mixer;
    },
    updateMixerByTrackId: (state, action) => {
      const { trackId, ...update } = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      state.byId[mixer.id] = { ...mixer, ...update };
    },
    updateMixerEffectByTrackId: (state, action) => {
      const { trackId, type, update } = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      state.byId[mixer.id] = updateMixerByType(mixer, type, { ...update });
    },
    removeMixer: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      delete state.byId[mixer.id];
      const index = state.allIds.findIndex((id) => id === mixer.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
  },
});

export const {
  addMixer,
  updateMixerByTrackId,
  updateMixerEffectByTrackId,
  removeMixer,
} = mixersSlice.actions;

export default mixersSlice.reducer;
