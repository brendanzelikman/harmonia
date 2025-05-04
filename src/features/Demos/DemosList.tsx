import { HomeList } from "features/Home/HomeList";
import { ProjectFormatter } from "features/Projects/ProjectsFormatter";
import { DEMO_PROJECTS } from "lib/demos";
import { Project } from "types/Project/ProjectTypes";
import { UPDATE_PROJECT_EVENT } from "utils/constants";

export const DemosList = () => {
  return (
    <HomeList signal={UPDATE_PROJECT_EVENT}>
      {DEMO_PROJECTS.map((demo, index) => (
        <ProjectFormatter
          key={demo.project.meta.id}
          project={{ present: demo.project } as Project}
          index={index}
          blurb={demo.blurb}
          isDemo
        />
      ))}
    </HomeList>
  );
};
