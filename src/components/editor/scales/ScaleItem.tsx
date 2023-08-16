import useDebouncedField from "hooks/useDebouncedField";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { MIDI } from "types/midi";
import Scales, { Scale } from "types/scales";
import { ScaleEditorProps } from ".";
import { ListItem } from "../Editor";

import { useScaleDrag, useScaleDrop } from "./dnd";

export interface PresetScaleProps extends ScaleEditorProps {
  presetScale: Scale;
}

export const PresetScale = (props: PresetScaleProps) => {
  const scale = props.presetScale;
  const trackScale = props.scale;
  if (!scale || !trackScale) return null;

  const firstScaleNote = trackScale.notes[0];
  const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";
  const areScalesRelated = Scales.areRelated(scale, trackScale);

  return (
    <ListItem
      className={`font-nunito ${
        areScalesRelated
          ? "text-sky-500 border-l border-l-sky-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => props.updateScale({ ...trackScale, notes: scale.notes })}
    >
      <div className="flex relative items-center">
        <input
          className={`peer bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis`}
          value={`${scale.name} ${
            areScalesRelated && firstPitch ? `(${firstPitch})` : ""
          }`}
          disabled
        />
      </div>
    </ListItem>
  );
};

export interface CustomScaleProps extends ScaleEditorProps {
  customScale: Scale;
  index: number;
  element?: any;
  moveScale: (dragIndex: number, hoverIndex: number) => void;
}

export const CustomScale = (props: CustomScaleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useScaleDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useScaleDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const scale = props.customScale;
  const trackScale = props.scale;

  const NameInput = useDebouncedField<string>(
    (name: string) => props.setScaleName(scale, name),
    scale.name
  );

  if (!scale || !trackScale) return null;

  const areScalesRelated = Scales.areRelated(scale, trackScale);

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center w-10 h-10 rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        props.deleteScale(scale.id);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        areScalesRelated
          ? "text-emerald-500 font-medium border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.updateScale({ ...trackScale, notes: scale.notes })}
    >
      <div className="relative flex items-center" ref={ref}>
        <input
          className={`peer border border-white/50 bg-transparent h-10 rounded-l p-2 cursor-pointer outline-none overflow-ellipsis ${
            Scales.areRelated(scale, trackScale)
              ? "focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={NameInput.value}
          onChange={NameInput.onChange}
          onKeyDown={NameInput.onKeyDown}
        />
        <DeleteButton />
      </div>
    </ListItem>
  );
};
