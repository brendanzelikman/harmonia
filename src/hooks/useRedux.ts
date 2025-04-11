import { useDispatch, useSelector } from "react-redux";
import { Dispatch, Project } from "types/Project/ProjectTypes";
import { isEqual } from "lodash";

/** A custom hook to get the project dispatch. */
export const useAppDispatch: () => Dispatch = useDispatch;

/** A project selector for deep equality checks. */
export const useAppValue = <T>(s: (project: Project) => T): T =>
  useSelector(s, isEqual);
