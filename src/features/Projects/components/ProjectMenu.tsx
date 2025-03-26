import { useProjectDispatch } from "types/hooks";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { createProject, deleteProject } from "types/Project/ProjectThunks";
import { Project } from "types/Project/ProjectTypes";
import { cancelEvent } from "utils/html";

interface ProjectMenuButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}
export const ProjectMenuButton = (props: ProjectMenuButtonProps) => (
  <button
    className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

interface ProjectMenuProps {
  project: Project;
  deleting: boolean;
  toggleDeleting: () => void;
  onClick: () => void;
}

export const ProjectMenu = (props: ProjectMenuProps) => {
  const dispatch = useProjectDispatch();
  return (
    <div className="peer max-[800px]:hidden select-none gap-2 p-2 flex order-2 justify-evenly text-md font-bold bg-slate-900/80 ease-in-out transition-all duration-500 px-5 mx-auto border-2 rounded border-indigo-400 cursor-pointer">
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={props.onClick}
      >
        Play
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={() => createProject(props.project)}
      >
        Copy
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={() => dispatch(exportProjectToHAM(props.project))}
      >
        Save
      </button>
      <div
        className="px-3 py-1 z-50 rounded relative border border-slate-500 hover:bg-slate-950"
        onClick={props.toggleDeleting}
      >
        Delete
        {props.deleting && (
          <div className="absolute p-1 w-32 bg-slate-950 shadow-xl left-16 top-4 rounded border-2 border-slate-600/80 text-xs text-slate-200 whitespace-nowrap">
            <p className="pb-1 mb-1 text-center border-b border-b-slate-500 w-full">
              Are you sure?
            </p>
            <div className="flex w-full items-center justify-center">
              <button
                className="px-4 hover:bg-slate-700 hover:text-red-500 rounded"
                onClick={(e) => {
                  cancelEvent(e);
                  dispatch(deleteProject(props.project.present.meta.id));
                }}
              >
                Yes
              </button>
              <button className="px-4 hover:bg-slate-700 hover:text-sky-200 rounded">
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
