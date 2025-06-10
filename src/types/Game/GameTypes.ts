import { EntityState } from "@reduxjs/toolkit";
import { TrackId } from "types/Track/TrackTypes";

export type GameId = string;

/** A game action is a timed shortcut */
export interface GameAction {
  tick: number;
  key: string;
  value: string | number;
}

// A game can have multiple ranks, each representing a level of performance.
export type GameRank = { percent: number; rank: number };

// A game has a leniency indicating the tolerance for timing errors in milliseconds.
export type GameLeniency = number;

export interface Game {
  actions: GameAction[];
  ranks: GameRank[];
  leniency: GameLeniency;
  trackId?: TrackId;
}
export type GameState = EntityState<Game, GameId>;

export const defaultGameRanks: GameRank[] = [
  { percent: 0, rank: 1 },
  { percent: 0.5, rank: 2 },
  { percent: 0.75, rank: 3 },
  { percent: 0.9, rank: 4 },
  { percent: 1, rank: 5 },
];
export const defaultGameLeniency: GameLeniency = 200;

export const defaultGame: Game = {
  actions: [],
  ranks: defaultGameRanks,
  leniency: defaultGameLeniency,
};
