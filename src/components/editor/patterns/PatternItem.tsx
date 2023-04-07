import useDebouncedField from "hooks/useDebouncedField";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { GiLinkedRings } from "react-icons/gi";
import { Pattern } from "types/patterns";
import { EditorPatternsProps } from ".";
import { ListItem } from "../Editor";

import { usePatternDrag, usePatternDrop } from "./dnd";

export interface PresetPatternProps extends EditorPatternsProps {
  pattern: Pattern;
}

export const PresetPattern = (props: PresetPatternProps) => {
  const pattern = props.pattern;
  if (!pattern) return null;
  return (
    <ListItem
      className={`${
        pattern.id === props.activePatternId
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
        <GiLinkedRings
          className="absolute right-0 top-0 h-5 w-5 text-slate-500"
          onClick={(e) => {
            e.stopPropagation();
            props.copyPatternPreset(pattern);
          }}
        />
      </div>
    </ListItem>
  );
};

export interface CustomPatternProps extends EditorPatternsProps {
  pattern: Pattern;
  index: number;
  element?: any;
  movePattern: (dragIndex: number, hoverIndex: number) => void;
}

export const CustomPattern = (props: CustomPatternProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = usePatternDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = usePatternDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const pattern = props.pattern;

  const NameInput = useDebouncedField<string>(
    (name: string) => props.setPatternName(pattern, name),
    pattern.name
  );

  if (!pattern) return null;

  return (
    <ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        pattern.id === props.activePatternId
          ? "text-emerald-500 border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.setPatternId(pattern.id)}
    >
      <div className="relative flex items-center" ref={ref}>
        <input
          className={`peer border border-white/50 bg-transparent h-10 rounded-l p-2 cursor-pointer outline-none overflow-ellipsis ${
            pattern.id === props.activePatternId
              ? "pointer-events-all focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={NameInput.value ?? ""}
          onChange={NameInput.onChange}
          onKeyDown={NameInput.onKeyDown}
        />
        <div
          className={`flex justify-center items-center px-1 h-10 font-thin border border-l-0 border-slate-50/50`}
          onClick={(e) => {
            e.stopPropagation();
            props.copyPatternPreset(pattern);
          }}
        >
          <GiLinkedRings />
        </div>
        <div
          className={`flex justify-center items-center px-1 h-10 rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
          onClick={(e) => {
            e.stopPropagation();
            props.deletePattern(pattern.id);
          }}
        >
          <BsTrash />
        </div>
      </div>
    </ListItem>
  );
};
