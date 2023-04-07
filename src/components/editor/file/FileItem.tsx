import { loadStateFromString } from "redux/util";
import { EditorFileProps } from ".";
import { ListItem } from "../Editor";

export interface PresetFileProps extends EditorFileProps {
  file: any;
}

export const PresetFile = (props: PresetFileProps) => {
  const file = props.file;
  if (!file) return null;
  return (
    <ListItem
      className={`${"text-slate-300 border-l border-l-slate-500/80 hover:border-l-slate-300 active:text-sky-500"} select-none`}
    >
      <div className="flex relative items-center">
        <input
          className={`peer bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis`}
          value={file.name}
          disabled
          onClick={() => loadStateFromString(file)}
        />
      </div>
    </ListItem>
  );
};
