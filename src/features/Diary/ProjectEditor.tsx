import { JsonEditor, NodeData } from "json-edit-react";
import { store, SafeBaseProject } from "providers/store";
import { BsFillXCircleFill } from "react-icons/bs";
import { FaMinusCircle, FaDownload } from "react-icons/fa";
import { useDiary } from "types/Diary/DiaryTypes";
import { useDeep, useProjectDispatch } from "types/hooks";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { sanitizeBaseProject } from "types/Project/ProjectFunctions";

const RESTRICTED_KEYWORDS = new Set([
  "id",
  "ids",
  "entities",
  "meta",
  "patternTracks",
  "scaleTracks",
  "instruments",
  "motifs",
  "clips",
  "scale",
  "pattern",
  "pose",
  "portals",
  "timeline",
  "transport",
  "editor",
  "dateCreated",
  "lastUpdated",
  "project",
  "diary",
]);
const isRestricted = (input: string) => RESTRICTED_KEYWORDS.has(input);

// Prevent editing any id field in the JSON editor
const restrictInput = (input: NodeData) =>
  input.level === 0 || isRestricted(String(input.key));

interface ProjectEditorProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export const ProjectEditor = (props: ProjectEditorProps) => {
  const dispatch = useProjectDispatch();
  const diaryState = useDiary();
  const json = useDeep((state) => state.present);

  if (!props.show) return null;
  return (
    <div className="animate-in fade-in relative h-full min-w-max w-full max-w-3xl border my-8 rounded flex flex-col bg-zinc-950 overflow-scroll">
      <div className="flex gap-2 shrink-0 items-center w-full p-2 border-b bg-neutral-100">
        <BsFillXCircleFill
          className="fill-red-500 rounded-full bg-red-500 hover:bg-slate-800 cursor-pointer"
          onClick={diaryState.toggle}
        />
        <FaMinusCircle
          className="fill-yellow-500 rounded-full bg-yellow-500 hover:bg-slate-800 cursor-pointer"
          onClick={() => props.setShow(false)}
        />
        <FaDownload
          className="text-slate-800 hover:opacity-75 cursor-pointer"
          onClick={() => dispatch(exportProjectToHAM())}
        />
        <span className="font-mono text-slate-900">Project Editor</span>
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
          "githubDark",
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
  );
};
