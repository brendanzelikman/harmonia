import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { isEqual } from "lodash";
import { Dispatch, Project } from "../types/Project/ProjectTypes";

/** A custom hook to get the project dispatch. */
export const useDispatch: () => Dispatch = useReduxDispatch;

/** A project selector for deep equality checks. */
export const useStore = <T>(s: (project: Project) => T): T =>
  useReduxSelector(s, isEqual);
