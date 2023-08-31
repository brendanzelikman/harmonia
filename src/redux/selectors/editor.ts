import { RootState } from "redux/store";

export const selectEditor = (state: RootState) => {
  return state.editor;
};
