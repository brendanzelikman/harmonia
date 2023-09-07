import { Disclosure } from "@headlessui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import Scales, { Scale, ScaleId } from "types/scale";
import { ScaleEditorProps } from "..";
import * as Editor from "features/editor";
import { cancelEvent } from "utils";
import useDebouncedField from "hooks/useDebouncedField";
import { MIDI } from "types/midi";
import { useScaleDrop, useScaleDrag } from "../hooks/useScaleDnd";
import {
  PresetScaleGroupMap,
  PresetScaleGroupList,
} from "types/presets/scales";

export function ScaleList(props: ScaleEditorProps) {
  const scale = props.scale;
  // Get all scale presets, including custom scales
  const ScalePresets = {
    ...PresetScaleGroupMap,
    "Custom Scales": props.customScales,
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchScale = useCallback(
    (scale: Scale) =>
      scale.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );

  // Get all categories with scales that match the search query
  const openCategories = useMemo(() => {
    if (searchQuery === "") return [];
    return Object.keys(ScalePresets).filter((category) =>
      ScalePresets[category as keyof typeof ScalePresets].some((scale) =>
        scale.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // If there are no open categories, show all categories
  const scaleCategories = openCategories.length
    ? (openCategories as typeof PresetScaleGroupList)
    : PresetScaleGroupList;

  // Move a scale to a new index when dragging
  const moveScale = useCallback(
    (dragId: ScaleId, hoverId: ScaleId) => {
      const newScaleIds = [...props.scaleIds];
      const dragIndex = newScaleIds.findIndex((id) => id === dragId);
      const hoverIndex = newScaleIds.findIndex((id) => id === hoverId);
      if (dragIndex < 0 || hoverIndex < 0) return;
      newScaleIds.splice(dragIndex, 1);
      newScaleIds.splice(hoverIndex, 0, props.scaleIds[dragIndex]);
      props.setScaleIds(newScaleIds);
    },
    [props.scaleIds]
  );

  // Render a custom scale
  const renderCustomScale = useCallback(
    (scale: Scale, index: number) => (
      <CustomScale
        {...props}
        key={scale.id}
        customScale={scale}
        index={index}
        moveScale={moveScale}
      />
    ),
    [moveScale, props]
  );

  // Render a preset scale
  const renderPresetScale = useCallback(
    (scale: Scale) => (
      <PresetScale {...props} key={scale.id} presetScale={scale} />
    ),
    [props]
  );

  const renderCategory = useCallback(
    (category: any) => {
      const typedCategory = category as keyof typeof ScalePresets;
      const isCategoryOpen = openCategories.includes(typedCategory);
      const isCustomCategory = typedCategory === "Custom Scales";

      const searching = searchQuery !== "";
      const presetScales = ScalePresets[typedCategory];
      const scales = searching
        ? presetScales.filter(doesMatchScale)
        : presetScales;
      const isCategorySelected = scale
        ? scales.some((s) => Scales.areRelated(scale, s))
        : false;
      return (
        <Disclosure key={category}>
          {({ open }) => {
            const isOpen = isCategoryOpen || open;
            return (
              <>
                <Disclosure.Button>
                  <div
                    className={`flex items-center justify-center text-slate-50`}
                  >
                    <label
                      className={`py-2.5 px-2 ${
                        open ? "font-extrabold" : "font-medium"
                      }`}
                    >
                      {isCategorySelected ? "*" : ""} {typedCategory}
                    </label>
                    <span className="ml-auto mr-2">
                      {isOpen ? <BsChevronDown /> : <BsChevronUp />}
                    </span>
                  </div>
                </Disclosure.Button>
                <Disclosure.Panel static={isOpen}>
                  {scales.map(
                    isCustomCategory ? renderCustomScale : renderPresetScale
                  )}
                </Disclosure.Panel>
              </>
            );
          }}
        </Disclosure>
      );
    },
    [
      renderCustomScale,
      renderPresetScale,
      scale,
      doesMatchScale,
      openCategories,
      searchQuery,
    ]
  );

  return (
    <>
      <Editor.SearchBox query={searchQuery} setQuery={setSearchQuery} />
      <Editor.List>{scaleCategories.map(renderCategory)}</Editor.List>
    </>
  );
}

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
    <Editor.ListItem
      className={`${
        areScalesRelated
          ? "text-sky-500 border-l border-l-sky-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => props.updateScale({ ...trackScale, notes: scale.notes })}
    >
      <div className="flex relative items-center h-6">
        <input
          className={`peer bg-transparent w-full rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis`}
          value={`${scale.name} ${
            areScalesRelated && firstPitch ? `(${firstPitch})` : ""
          }`}
          disabled
        />
      </div>
    </Editor.ListItem>
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
      className={`flex justify-center items-center w-7 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        props.deleteScale(scale.id);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <Editor.ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        areScalesRelated
          ? "text-sky-500 border-l border-l-sky-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.updateScale({ ...trackScale, notes: scale.notes })}
    >
      <div className="relative flex items-center h-8" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`peer border border-white/50 bg-transparent h-full rounded-l p-2 cursor-pointer outline-none overflow-ellipsis ${
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
    </Editor.ListItem>
  );
};
