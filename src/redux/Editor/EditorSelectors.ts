import { RootState } from "redux/store";

/**
 * Select the editor from the state.
 * @param state The RootState object.
 * @returns The editor object.
 */
export const selectEditor = (state: RootState) => state.editor;
