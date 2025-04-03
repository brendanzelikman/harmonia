import { useCallback, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { isProject } from "types/Project/ProjectTypes";
import { loadProjectByPath, loadProject } from "types/Project/ProjectLoaders";
import { ProjectDisc, ProjectDiscPreview } from "./ProjectDisc";
import { ProjectTitle } from "./ProjectTitle";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { ProjectItem } from "../ProjectsPage";
import classNames from "classnames";
import {
  HomeListButton,
  HomeListButtonContainer,
  HomeListDeleteMenu,
  HomeListItem,
} from "pages/components/HomeList";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { createProject, deleteProject } from "types/Project/ProjectThunks";

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
    <HomeListItem
      className={classNames(
        isInvalid ? "ring ring-red-500 cursor-not-allowed" : "",
        isDemo ? "text-slate-400" : "text-indigo-200/70"
      )}
    >
      <ProjectTitle project={project} onClick={onClick} />
      <ProjectDisc
        deleting={deleting}
        projectId={props.project.present.meta.id}
        onClick={onClick}
        isDemo={isDemo}
        className="max-[800px]:hidden my-auto w-full ease-out p-2 h-fit rounded-full border-2 cursor-pointer transition-all active:text-indigo-200 hover:duration-150 border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25 bg-gradient-radial from-indigo-700 to-sky-500 data-[deleting=true]:from-red-500 data-[deleting=true]:to-red-700 shadow-[0px_0px_20px_rgb(100,100,200)]"
      />
      {!isDemo && <ProjectDiscPreview />}
      <HomeListButtonContainer>
        <HomeListButton onClick={onClick}>Play</HomeListButton>
        <HomeListButton onClick={() => createProject(props.project)}>
          Copy
        </HomeListButton>
        <HomeListButton
          onClick={() => dispatch(exportProjectToHAM(props.project))}
        >
          Save
        </HomeListButton>
        <HomeListButton onClick={() => setDeleting((prev) => !prev)}>
          Delete
          {deleting && (
            <HomeListDeleteMenu
              onClick={() =>
                dispatch(deleteProject(props.project.present.meta.id))
              }
            />
          )}
        </HomeListButton>
      </HomeListButtonContainer>
    </HomeListItem>
  );
}
