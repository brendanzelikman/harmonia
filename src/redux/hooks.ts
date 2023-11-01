import {
  TypedUseSelectorHook as TypedSelector,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { Project, Dispatch } from "types/Project";
import { isEqual } from "lodash";

/** A custom hook to get the project dispatch. */
export const useProjectDispatch: () => Dispatch = useReduxDispatch;

/** A custom hook to select from the project. */
export const useProjectSelector: TypedSelector<Project> = useReduxSelector;

/** A custom hook to select from the project with a deep equality check. */
export const useProjectDeepSelector = <T>(
  selector: (project: Project) => T
): T => useProjectSelector(selector, isEqual);
