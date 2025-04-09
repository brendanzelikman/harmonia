import { ProjectFormatter } from "features/Projects/ProjectFormatter";
import { HomeContainer } from "features/Home/HomeContainer";
import { HomeControlBar } from "features/Home/HomeControlBar";
import { HomeList } from "features/Home/HomeList";
import { useDemos } from "features/Demos/useDemos";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECT_EVENT } from "utils/constants";

export const DemosPage = () => {
  const navigate = useNavigate();
  const { projects, paths } = useDemos();
  useHotkeys("enter", () => navigate("/playground"));
  return (
    <HomeContainer>
      <HomeControlBar>
        <div className="h-12" />
      </HomeControlBar>
      <HomeList signal={UPDATE_PROJECT_EVENT}>
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
