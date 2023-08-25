import useDebouncedField from "hooks/useDebouncedField";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { Pattern, PatternId } from "types/patterns";
import { PatternEditorProps } from ".";
import { ListItem } from "../Editor";

import { usePatternDrag, usePatternDrop } from "./dnd";
import { BiCopy } from "react-icons/bi";
import { cancelEvent } from "appUtil";

export interface PresetPatternProps extends PatternEditorProps {
  pattern: Pattern;
}

export const PresetPattern = (props: PresetPatternProps) => {
  const pattern = props.pattern;
  if (!pattern) return null;

  const CopyButton = () => (
    <BiCopy
      className="absolute right-0 top-0 h-5 w-5 text-slate-500"
      onClick={(e) => {
        e.stopPropagation();
        props.copyPattern(pattern);
      }}
    />
  );

  return (
    <ListItem
      className={`${
        pattern.id === props.selectedPatternId
          ? "text-emerald-500 font-medium border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => props.setPatternId(pattern.id)}
    >
      <div className="flex relative items-center">
        <input
          className={`peer bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis`}
          value={pattern.name}
          disabled
        />
        <CopyButton />
      </div>
    </ListItem>
  );
};

export interface CustomPatternProps extends PatternEditorProps {
  pattern: Pattern;
  index: number;
  element?: any;
  movePattern: (dragId: PatternId, hoverId: PatternId) => void;
}

export const CustomPattern = (props: CustomPatternProps) => {
  // Pattern information
  const pattern = props.pattern;
  const NameInput = useDebouncedField<string>(
    (name: string) => props.setPatternName(pattern, name),
    pattern.name
  );

  // Ref information
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = usePatternDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = usePatternDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  if (!pattern) return null;

  const CopyButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-10 font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        props.copyPattern(pattern);
      }}
    >
      <BiCopy />
    </div>
  );

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-10 rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        props.deletePattern(pattern.id);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        pattern.id === props.selectedPatternId
          ? "text-emerald-500 border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.setPatternId(pattern.id)}
    >
      <div className="relative flex items-center" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`peer border border-white/50 bg-transparent h-10 rounded-l p-2 cursor-pointer outline-none overflow-ellipsis ${
            pattern.id === props.selectedPatternId
              ? "pointer-events-all focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={NameInput.value ?? ""}
          onChange={NameInput.onChange}
          onKeyDown={NameInput.onKeyDown}
        />
        <CopyButton />
        <DeleteButton />
      </div>
    </ListItem>
  );
};
