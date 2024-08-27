import {
  TypedUseSelectorHook as TypedSelector,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { isEqual } from "lodash";
import { Dispatch, Project } from "./Project/ProjectTypes";

/** A custom hook to get the project dispatch. */
export const useProjectDispatch: () => Dispatch = useReduxDispatch;

/** A custom hook to select from the project. */
export const useProjectSelector: TypedSelector<Project> = useReduxSelector;

/** A custom hook to select from the project with a deep equality check. */
export const useProjectDeepSelector = <T>(
  selector: (project: Project) => T
): T => useProjectSelector(selector, isEqual);

/** A short, curried project selector for convenience. */
export const use = useProjectSelector;

/** A short, curried project selector for deep equality checks. */
export const useDeep = useProjectDeepSelector;
