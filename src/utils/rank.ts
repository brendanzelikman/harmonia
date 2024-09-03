import { IS_PROD } from "./constants";

export type Rank = "prodigy" | "maestro" | "virtuoso";

// Project Limits
export const PRODIGY_PROJECT_LIMIT = 1;
export const MAESTRO_PROJECT_LIMIT = 50;
export const VIRTUOSO_PROJECT_LIMIT = Infinity;

// Prices
export const PRODIGY_PRICE = 0;
export const MAESTRO_PRICE = 10;
export const VIRTUOSO_PRICE = 20;

/* Get the price ID for the given rank. */
export const getRankPriceId = (rank: Rank) => {
  if (rank === "maestro") {
    if (IS_PROD) return import.meta.env.VITE_MAESTRO_LIVE_PRICE_ID;
    return import.meta.env.VITE_MAESTRO_TEST_PRICE_ID;
  }
  if (rank === "virtuoso") {
    if (IS_PROD) return import.meta.env.VITE_VIRTUOSO_LIVE_PRICE_ID;
    return import.meta.env.VITE_VIRTUOSO_TEST_PRICE_ID;
  }
  return null;
};
