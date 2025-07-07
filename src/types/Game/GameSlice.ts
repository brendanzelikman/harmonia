import { createSlice } from "@reduxjs/toolkit";
import { defaultGame, Game, GameAction } from "./GameTypes";
import { union } from "lodash";
import { Action, unpackAction } from "types/redux";

export const gameSlice = createSlice({
  name: "game",
  initialState: defaultGame,
  reducers: {
    addGameActions: (state, action: Action<{ actions: GameAction[] }>) => {
      const { actions } = unpackAction(action);
      if (actions !== undefined) {
        state.actions = union(state.actions, actions).toSorted(
          (a, b) => a.tick - b.tick
        );
      }
    },
    removeGameActionsAtTick: (state, action: Action<{ tick: number }>) => {
      const { tick } = unpackAction(action);
      state.actions = state.actions.filter((a) => a.tick !== tick);
    },
    updateGame: (state, action: Action<Partial<Game>>) => {
      const { actions, ranks, leniency, trackId } = unpackAction(action);
      if (actions !== undefined) {
        state.actions = actions;
      }
      if (ranks !== undefined) {
        state.ranks = ranks;
      }
      if (leniency !== undefined) {
        state.leniency = leniency;
      }
      if (trackId !== undefined) {
        state.trackId = trackId;
      }
    },
    resetGame: (state) => {
      state.actions = defaultGame.actions;
      state.ranks = defaultGame.ranks;
      state.leniency = defaultGame.leniency;
    },
  },
});

export const {
  addGameActions,
  removeGameActionsAtTick,
  updateGame,
  resetGame,
} = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
