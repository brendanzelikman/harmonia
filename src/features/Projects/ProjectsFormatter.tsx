import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isProject } from "types/Project/ProjectTypes";
import { loadProjectByPath, loadProject } from "types/Project/ProjectLoaders";
import { ProjectDisc, ProjectDiscPreview } from "./ProjectsDisc";
import { ProjectTitle } from "./ProjectsTitle";
import { selectProjectId } from "types/Meta/MetaSelectors";
import classNames from "classnames";
import {
  HomeListButton,
  HomeListButtonContainer,
  HomeListItem,
  HomeListTitle,
} from "features/Home/HomeList";
import { exportProjectToJSON } from "types/Project/ProjectExporters";
import { createProject } from "types/Project/ProjectFunctions";
import { useDispatch } from "hooks/useStore";
import { ProjectItem } from "features/Projects/Projects";
import { DEMO_BLURBS } from "features/Demos/useDemos";
import { deleteProject } from "app/projects";
import { useHotkeys } from "hooks/useHotkeys";

export interface ProjectFormatterProps extends ProjectItem {
  index?: number;
}

export function ProjectFormatter(props: ProjectFormatterProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { project, filePath } = props;
  const id = selectProjectId(project);
  const isInvalid = !isProject(project);
  const isDemo = !!props.filePath;
  const canPlay = !isInvalid;

  // The user must confirm before deleting a project
  const [deleting, setDeleting] = useState(false);
  useHotkeys({ escape: () => setDeleting(false) });

  // Load the project by path or database if necessary
  const onClick = useCallback(() => {
    if (!canPlay) return;
    const callback = () => navigate("/playground");
    if (filePath) {
      loadProjectByPath(filePath, callback);
    } else {
      loadProject(id, callback);
    }
  }, [id, canPlay, filePath]);

  return (
    <HomeListItem
      index={props.index}
      className={classNames(
        isInvalid ? "ring ring-red-500 cursor-not-allowed" : "",
        isDemo ? "text-violet-50/50 " : "text-sky-50/50",
        isDemo ? "border-2 border-violet-500" : "border-2 border-sky-500/60"
      )}
    >
      <ProjectDisc
        projectId={id}
        onClick={onClick}
        isDemo={isDemo}
        deleting={deleting}
        className="max-[800px]:hidden size-48 mt-4 mb-4 ease-out rounded-full border-2 border-sky-500/50 cursor-pointer transition-all active:text-indigo-200 hover:duration-150 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25 bg-radial from-indigo-700 to-sky-500 data-[deleting=true]:from-red-500 data-[deleting=true]:to-red-700 shadow-[0px_0px_20px_rgb(100,100,200)]"
      />
      <HomeListTitle title={project.present.meta.name} />
      <ProjectTitle project={project} onClick={onClick} />
      {!isDemo && <ProjectDiscPreview />}
      {!isDemo && (
        <HomeListButtonContainer>
          <HomeListButton onClick={onClick}>Start</HomeListButton>
          <HomeListButton onClick={() => createProject(props.project)}>
            Copy
          </HomeListButton>
          <HomeListButton
            onClick={() => dispatch(exportProjectToJSON(props.project))}
          >
            Save
          </HomeListButton>
          <HomeListButton
            border={`border ${
              deleting ? "border-slate-300" : "border-slate-500"
            }`}
            onClick={() => (!deleting ? setDeleting(true) : deleteProject(id))}
            onMouseLeave={() => setDeleting(false)}
          >
            {deleting ? "Confirm" : "Delete"}
          </HomeListButton>
        </HomeListButtonContainer>
      )}
      {isDemo && filePath && (
        <div className="py-2">{DEMO_BLURBS[filePath]}</div>
      )}
    </HomeListItem>
  );
}
