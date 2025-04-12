import { ProjectFormatter } from "features/Projects/ProjectsFormatter";
import { HomeContainer } from "features/Home/HomeContainer";
import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import { HomeList } from "features/Home/HomeList";
import { useDemos } from "features/Demos/useDemos";
import { DEMOS } from "app/demos";
import { useNavigate } from "react-router-dom";
import { selectProjectId, selectProjectName } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { useHotkeys } from "hooks/useHotkeys";
import { GiCompactDisc } from "react-icons/gi";
import { loadDemo } from "types/Project/ProjectLoaders";

export default function DemosPage() {
  const navigate = useNavigate();
  const { projects, paths } = useDemos();
  useHotkeys({ enter: () => navigate("/playground") });
  return (
    <HomeContainer>
      <HomeControlBar>
        {projects.map((project, i) => (
          <HomeControlButton
            key={selectProjectId(project)}
            className={DEMOS[i].colors}
            onClick={() => loadDemo(paths[i], () => navigate("/playground"))}
            title={
              <div className="w-24">
                {selectProjectName(projects[i])}:
                <br /> {DEMOS[i].type}
              </div>
            }
            icon={<GiCompactDisc className="pr-0" />}
          />
        ))}
        <div className="h-12 w-0" />
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
}
