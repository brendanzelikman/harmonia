import useDebouncedField from "hooks/useDebouncedField";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { MIDI } from "types/midi";
import Scales, { Scale, ScaleId } from "types/scales";
import { ScaleEditorProps } from ".";
import { ListItem } from "../Editor";

import { useScaleDrag, useScaleDrop } from "./dnd";
import { cancelEvent } from "appUtil";

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
  moveScale: (dragId: ScaleId, hoverId: ScaleId) => void;
}

export const CustomScale = (props: CustomScaleProps) => {
  const scale = props.customScale;
  const trackScale = props.scale;
  const NameInput = useDebouncedField<string>(
    (name: string) => props.setScaleName(scale, name),
    scale.name
  );

  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useScaleDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useScaleDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  if (!scale || !trackScale) return null;

  const areScalesRelated = Scales.areRelated(scale, trackScale);

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center w-7 h-10 rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
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
          ? "text-sky-500 border-l border-l-sky-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.updateScale({ ...trackScale, notes: scale.notes })}
    >
      <div className="relative flex items-center" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`peer border border-white/50 bg-transparent h-10 rounded-l p-2 cursor-pointer outline-none overflow-ellipsis ${
            props.matchesAnyScale
              ? "pointer-events-all focus:bg-zinc-800/30"
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
