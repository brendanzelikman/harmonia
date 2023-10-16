import {
  TypedUseSelectorHook,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { AppDispatch, Project } from "./store";
import { isEqual } from "lodash";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type DispatchFunc = () => AppDispatch;

export const useAppDispatch: DispatchFunc = useReduxDispatch;
export const useAppSelector: TypedUseSelectorHook<Project> = useReduxSelector;
export const useDeepEqualSelector = <T>(selector: (state: Project) => T): T =>
  useAppSelector(selector, isEqual);
