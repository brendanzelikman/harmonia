import { githubDarkTheme, JsonEditor, NodeData } from "json-edit-react";
import { store } from "app/store";
import { setProject } from "app/store";
import { sanitizeBaseProject } from "types/Project/ProjectMergers";
import { SafeBaseProject } from "app/reducer";

export const TerminalFile = () => {
  return (
    <JsonEditor
      data={store.getState().present}
      setData={(data) => {
        setProject({
          ...store.getState(),
          present: sanitizeBaseProject(data as SafeBaseProject),
        });
      }}
      className="size-full min-w-fit"
      theme={[githubDarkTheme, terminalTheme]}
      rootName="project"
      restrictAdd={restrictInput}
      restrictEdit={restrictInput}
      restrictDelete={restrictInput}
      restrictDrag={restrictInput}
      restrictTypeSelection
      collapse={1}
      showCollectionCount={false}
      showArrayIndices={false}
      indent={4}
    />
  );
};

const terminalTheme = {
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
};

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
