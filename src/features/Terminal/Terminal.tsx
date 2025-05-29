import { NodeData } from "json-edit-react";
import { BsFillXCircleFill } from "react-icons/bs";
import { FaMinusCircle, FaDownload } from "react-icons/fa";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { exportProjectToJSON } from "types/Project/ProjectExporters";
import Background from "assets/images/background.png";
import { useToggle } from "hooks/useToggle";
import { useState } from "react";
import { TerminalGraph } from "features/Terminal/TerminalGraph";
import { TerminalFile } from "./TerminalFile";

export default function Terminal() {
  const dispatch = useAppDispatch();
  const { isOpen, close, toggle } = useToggle("terminal");
  const projectName = useAppValue(selectProjectName);
  const [view, setView] = useState<"file" | "graph">("file");
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 animate-in fade-in flex flex-col total-center z-[100] bg-slate-950/80 backdrop-blur-lg">
      <img
        src={Background}
        className="absolute inset-0 opacity-50 h-screen object-cover animate-background"
      />
      <div className="animate-in fade-in relative h-full min-w-max w-full max-w-3xl border my-8 rounded flex flex-col bg-zinc-950 overflow-scroll">
        <div className="flex gap-2 shrink-0 items-center w-full p-2 border-b bg-neutral-100 text-slate-900">
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
            onClick={() => dispatch(exportProjectToJSON())}
          />
          <div className="font-mono">Project Editor ({projectName}.json)</div>
          <div className="ml-auto gap-2 *:w-20">
            <button
              data-active={view === "file"}
              className="bg-slate-800 data-[active=true]:ring hover:bg-slate-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => setView("file")}
            >
              File
            </button>
            <button
              data-active={view === "graph"}
              className="ml-2 bg-slate-800 data-[active=true]:ring hover:bg-slate-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => setView("graph")}
            >
              Graph
            </button>
          </div>
        </div>
        {view === "file" ? <TerminalFile /> : <TerminalGraph />}
      </div>
    </div>
  );
}

const RESTRICTED_KEYWORDS = new Set([
  "id",
  // "ids",
  // "entities",
  // "meta",
  // "tracks",
  // "instruments",
  // "patternClips",
  // "poseClips",
  // "scale",
  // "patterns",
  // "poses",
  // "portals",
  // "dateCreated",
  // "lastUpdated",
  // "project",
  // "diary",
]);

const restrictInput = (input: NodeData) =>
  input.level === 0 || RESTRICTED_KEYWORDS.has(String(input.key));
