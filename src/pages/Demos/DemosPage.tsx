import { HomeContainer } from "pages/components/HomeContainer";
import {
  HomeControlBar,
  HomeControlButton,
} from "pages/components/HomeControlBar";
import { HomeList } from "pages/components/HomeList";
import { ProjectFormatter } from "pages/Projects/components/ProjectFormatter";
import { useDemoProjects } from "pages/Projects/hooks/useDemoProjects";
import { useHotkeys } from "react-hotkeys-hook";
import { GiRetroController } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";

export const DemosPage = () => {
  const navigate = useNavigate();
  useHotkeys("enter", () => navigate("/playground"));

  const { projects, paths } = useDemoProjects();

  return (
    <HomeContainer>
      <HomeControlBar>
        <HomeControlButton
          className="border-indigo-400 text-indigo-400"
          title="Open Playground"
          icon={<GiRetroController />}
          onClick={() => navigate("/playground")}
        />
      </HomeControlBar>
      <HomeList signal={UPDATE_PROJECTS}>
        {projects.map((project, index) => (
          <ProjectFormatter
            key={selectProjectId(project)}
            project={project}
            index={index}
            filePath={paths[index]}
          />
        ))}
      </HomeList>
    </HomeContainer>
  );
};
