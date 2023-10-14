import { RootState } from "redux/store";

/**
 * Select the root.
 */
export const selectRoot = (state: RootState) => state.root;

/**
 * Select the root tour.
 */
export const selectRootTour = (state: RootState) => state.root.tour;
