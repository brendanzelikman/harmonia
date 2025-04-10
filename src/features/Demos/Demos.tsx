import { ProjectFormatter } from "features/Projects/ProjectsFormatter";
import { HomeContainer } from "features/Home/HomeContainer";
import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import { HomeList } from "features/Home/HomeList";
import { useDemos } from "features/Demos/useDemos";
import { useNavigate } from "react-router-dom";
import { selectProjectId, selectProjectName } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { useHotkeys } from "hooks/useHotkeys";
import { GiCompactDisc } from "react-icons/gi";
import { loadProjectByPath } from "types/Project/ProjectLoaders";

export const DemosPage = () => {
  const navigate = useNavigate();
  const { projects, paths } = useDemos();
  useHotkeys({ enter: () => navigate("/playground") });
  return (
    <HomeContainer>
      <HomeControlBar>
        {projects.map((project, i) => (
          <HomeControlButton
            key={selectProjectId(project)}
            className="border-indigo-400 text-indigo-400"
            onClick={() =>
              loadProjectByPath(paths[i], () => navigate("/playground"))
            }
            title={
              <div className="w-24">
                Demo {i + 1}: <br /> {selectProjectName(projects[i])}
              </div>
            }
            icon={<GiCompactDisc className="pr-0" />}
          />
        ))}
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
