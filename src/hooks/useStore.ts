import { useDispatch as useReduxDispatch, useSelector } from "react-redux";
import { Dispatch, Project } from "../types/Project/ProjectTypes";
import { isEqual } from "lodash";

/** A custom hook to get the project dispatch. */
export const useDispatch: () => Dispatch = useReduxDispatch;

/** A project selector for deep equality checks. */
export const useSelect = <T>(s: (project: Project) => T): T =>
  useSelector(s, isEqual);
