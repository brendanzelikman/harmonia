import {
  TypedUseSelectorHook,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { Project, Dispatch } from "types/Project";
import { isEqual } from "lodash";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type DispatchFunc = () => Dispatch;

export const useProjectDispatch: DispatchFunc = useReduxDispatch;
export const useProjectSelector: TypedUseSelectorHook<Project> =
  useReduxSelector;

export const useProjectDeepSelector = <T>(
  selector: (project: Project) => T
): T => useProjectSelector(selector, isEqual);
