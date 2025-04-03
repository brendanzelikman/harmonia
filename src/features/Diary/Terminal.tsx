import { githubDarkTheme, JsonEditor, NodeData } from "json-edit-react";
import { store, SafeBaseProject } from "providers/store";
import { BsFillXCircleFill } from "react-icons/bs";
import { FaMinusCircle, FaDownload } from "react-icons/fa";
import { useDeep, useProjectDispatch } from "types/hooks";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { sanitizeBaseProject } from "types/Project/ProjectFunctions";
import Background from "assets/images/landing-background.png";
import { useTerminal } from "types/Project/ProjectTypes";

export const Terminal = () => {
  const dispatch = useProjectDispatch();
  const name = useDeep(selectProjectName);
  const { isOpen, close, toggle } = useTerminal();
  const json = useDeep((state) => state.present);

  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 animate-in fade-in flex flex-col total-center z-[100] bg-slate-950/80 backdrop-blur-lg">
      <img
        src={Background}
        className="absolute inset-0 opacity-50 h-screen object-cover animate-landing-background"
      />
      <div className="animate-in fade-in relative h-full min-w-max w-full max-w-3xl border my-8 rounded flex flex-col bg-zinc-950 overflow-scroll">
        <div className="flex gap-2 shrink-0 items-center w-full p-2 border-b bg-neutral-100">
          <BsFillXCircleFill
            className="fill-red-500 rounded-full bg-red-500 hover:bg-slate-800 cursor-pointer"
            onClick={toggle}
          />
          <FaMinusCircle
            className="fill-yellow-500 rounded-full bg-yellow-500 hover:bg-slate-800 cursor-pointer"
            onClick={close}
          />
          <FaDownload
            className="text-slate-800 hover:opacity-75 cursor-pointer"
            onClick={() => dispatch(exportProjectToHAM())}
          />
          <span className="font-mono text-slate-900">
            Project Editor ({name}.json)
          </span>
        </div>
        <JsonEditor
          data={json}
          setData={(data) => {
            dispatch({
              type: "setProject",
              payload: {
                ...store.getState(),
                present: sanitizeBaseProject(data as SafeBaseProject),
              },
            });
          }}
          rootName=""
          restrictAdd={restrictInput}
          restrictEdit={restrictInput}
          restrictDelete={restrictInput}
          restrictDrag={restrictInput}
          restrictTypeSelection
          collapse={1}
          showCollectionCount={false}
          showArrayIndices={false}
          indent={4}
          className="size-full min-w-fit"
          theme={[
            githubDarkTheme,
            {
              container: {
                backgroundColor: "rgba(0,0,0,0)",
              },
              itemCount: { margin: "0 0.5em" },
              iconCollection: "#00fa50e0",
              bracket: {
                color: "#00fa50b0",
                fontWeight: "bold",
              },
              string: {
                color: "#00fa50e0",
                whiteSpace: "nowrap",
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

const RESTRICTED_KEYWORDS = new Set([
  "id",
  "ids",
  "entities",
  "meta",
  "tracks",
  "instruments",
  "patternClips",
  "poseClips",
  "scale",
  "pattern",
  "pose",
  "portals",
  "dateCreated",
  "lastUpdated",
  "project",
  "diary",
]);

const restrictInput = (input: NodeData) =>
  input.level === 0 || RESTRICTED_KEYWORDS.has(String(input.key));
