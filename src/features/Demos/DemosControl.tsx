import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import { DEMO_PROJECTS } from "lib/demos";
import { useCallback } from "react";
import { GiCompactDisc } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";

export const DemosControl = () => {
  const navigate = useNavigate();
  const callback = useCallback(() => navigate("/playground"), [navigate]);
  return (
    <HomeControlBar>
      {DEMO_PROJECTS.map((demo) => (
        <HomeControlButton
          key={demo.project.meta.id}
          className={demo.colors}
          onClick={() => loadDemoProject(demo.project, callback)}
          title={
            <div className="w-24">
              {demo.project.meta.name}:
              <br /> {demo.type}
            </div>
          }
          icon={<GiCompactDisc className="pr-0" />}
        />
      ))}
      <div className="h-12 w-0" />
    </HomeControlBar>
  );
};
