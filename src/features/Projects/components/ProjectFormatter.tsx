import { useCallback, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { isProject } from "types/Project/ProjectTypes";
import { loadProjectByPath, loadProject } from "types/Project/ProjectLoaders";
import { ProjectDisc, ProjectDiscPreview } from "./ProjectDisc";
import { ProjectMenu } from "./ProjectMenu";
import { ProjectTitle } from "./ProjectTitle";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { ProjectItem } from "../ProjectList";

interface ProjectFormatterProps extends ProjectItem {
  index?: number;
}

export function ProjectFormatter(props: ProjectFormatterProps) {
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();
  const { project, filePath } = props;
  const id = selectProjectId(project);
  const isInvalid = !isProject(project);
  const isDemo = !!props.filePath;
  const canPlay = !isInvalid;

  // The user must confirm before deleting a project
  const [deleting, setDeleting] = useState(false);
  useHotkeys("esc", () => setDeleting(false));

  // Load the project by path or database if necessary
  const onClick = useCallback(() => {
    if (!canPlay) return;
    const callback = () => navigate("/playground");
    if (filePath) {
      dispatch(loadProjectByPath(filePath, callback));
    } else {
      dispatch(loadProject(id, callback));
    }
  }, [id, canPlay, filePath]);

  return (
    <div className="snap-start snap-mandatory px-4">
      <div
        data-invalid={isInvalid}
        className="flex flex-col size-full gap-4 p-4 bg-sky-500/10 data-[invalid=true]:ring data-[invalid=true]:ring-red-500 data=[invalid=true]:cursor-not-allowed rounded-lg animate-in fade-in text-slate-200 border-2 border-indigo-300/50 text-sm"
      >
        <div
          data-demo={isDemo}
          className="size-full flex flex-col justify-between gap-4 shrink mx-auto order-1 data-[demo=true]:text-slate-400 data-[demo=false]:text-indigo-200/70"
        >
          <ProjectTitle project={project} onClick={onClick} />
          <ProjectDisc
            deleting={deleting}
            projectId={props.project.present.meta.id}
            onClick={onClick}
            className="max-[800px]:hidden my-auto w-full p-2 h-fit rounded-full border-2 cursor-pointer transition-all duration-500 active:text-indigo-200 hover:duration-150 border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25 bg-gradient-radial from-indigo-700 to-sky-500 data-[deleting=true]:from-red-500 data-[deleting=true]:to-red-700 shadow-[0px_0px_20px_rgb(100,100,200)]"
          />
          <ProjectDiscPreview />
        </div>
        <ProjectMenu
          project={project}
          toggleDeleting={() => setDeleting((prev) => !prev)}
          deleting={deleting}
          onClick={onClick}
        />
      </div>
    </div>
  );
}
