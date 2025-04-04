import classNames from "classnames";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { Dispatch, SetStateAction, useState } from "react";
import { useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { useProjectDispatch } from "types/hooks";
import { loadProject } from "types/Project/ProjectLoaders";
import { dispatchCustomEvent } from "utils/html";

interface ProjectSearchBarProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

export const ProjectSearchBar = (props: ProjectSearchBarProps) => {
  const { query, setQuery } = props;
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  useCustomEventListener("dragged-project", (e) => setIsDragging(e.detail));
  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: "project",
      collect(monitor) {
        return {
          isOver: monitor.isOver(),
        };
      },
      drop: (item: any) => {
        dispatch(loadProject(item.id, () => navigate("/playground")));
        setTimeout(() => dispatchCustomEvent("dragged-project", false), 500);
      },
    };
  }, []);

  return (
    <input
      ref={drop}
      name="project-search"
      type="text"
      className={classNames(
        "min-w-56 h-10 px-4 rounded-lg shadow-xl focus:ring-sky-400/70 max-[820px]:hidden focus:outline-none focus:ring-2 text-slate-200 border-none focus:border-transparent transition-all",
        isOver
          ? "shadow-[0_0_6px_6px_rgba(255,255,255,0.4)] bg-indigo-950"
          : isDragging
          ? "shadow-[0_0_10px_5px_indigo] bg-transparent ring-2 ring-indigo-400/75 placeholder:text-slate-300/80"
          : "ring-2 ring-slate-600 bg-transparent"
      )}
      placeholder={isDragging ? "Insert Project Disc" : "Search By Any Fields"}
      aria-description={`Search Projects by Name, Date, Patterns, Scales, Instruments, etc.`}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
