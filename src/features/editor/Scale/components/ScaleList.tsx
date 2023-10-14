import { Disclosure, Transition } from "@headlessui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import {
  Scale,
  ScaleId,
  ScaleObject,
  areScalesEqual,
  areScalesRelated,
  getScaleName,
  getScaleTag,
  getScaleNotes,
  mapNestedNote,
  realizeNestedScaleNotes,
} from "types/Scale";
import { ScaleEditorProps } from "..";
import * as Editor from "features/Editor";
import { blurOnEnter, cancelEvent } from "utils";
import { MIDI } from "types/midi";
import { useScaleDrop, useScaleDrag } from "../hooks/useScaleDnd";
import { PresetScaleGroupMap, PresetScaleGroupList } from "presets/scales";

export function ScaleList(props: ScaleEditorProps) {
  const scale = props.scale;
  // Get all scale presets, including custom scales
  const ScalePresets = {
    ...PresetScaleGroupMap,
    "Custom Scales": props.customScales.map(
      (scale) =>
        ({
          ...scale,
          notes: realizeNestedScaleNotes(scale.notes),
        } as ScaleObject)
    ),
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchScale = useCallback(
    (scale: ScaleObject) =>
      scale.name &&
      scale.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );

  // Get all categories with scales that match the search query
  const openCategories = useMemo(() => {
    if (searchQuery === "") return [];
    return Object.keys(ScalePresets).filter((category) =>
      ScalePresets[category as keyof typeof ScalePresets].some(
        (scale) =>
          scale.name &&
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
    (scale: ScaleObject, index: number) => (
      <CustomScale
        key={scale.id}
        {...props}
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
      <PresetScale {...props} key={getScaleTag(scale)} presetScale={scale} />
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
        ? scales.some((s) => areScalesRelated(scale, s))
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
                <Transition
                  show={isOpen}
                  appear
                  enter="transition-all ease-in-out duration-150"
                  enterFrom="opacity-0 transform scale-95"
                  enterTo="opacity-100 transform scale-100"
                  leave="transition-all ease-in-out duration-150"
                  leaveFrom="opacity-100 transform scale-100"
                  leaveTo="opacity-0 transform scale-95"
                >
                  <Disclosure.Panel static={isOpen}>
                    {scales.map(
                      isCustomCategory ? renderCustomScale : renderPresetScale
                    )}
                  </Disclosure.Panel>
                </Transition>
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
  const scaleTrack = props.scaleTrack;

  const trackScaleNotes = getScaleNotes(trackScale);
  const scaleNotes = getScaleNotes(scale);
  const name = getScaleName(scale);

  const firstScaleNote = trackScaleNotes[0];
  const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";
  const isScaleRelated = areScalesRelated(scale, trackScale);
  const isScaleEqual = areScalesEqual(scale, trackScale);

  const onScaleClick = () => {
    if (!scaleTrack) return;
    props.updateScale({ notes: scaleNotes.map(mapNestedNote) });
  };

  if (!scale || !trackScale || !scaleTrack) return null;

  return (
    <Editor.ListItem
      className={`group ${
        isScaleRelated
          ? "text-sky-500 border-l border-l-sky-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={onScaleClick}
    >
      <div className="flex relative items-center h-6">
        <div
          className={`border-0 bg-transparent w-full rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis whitespace-nowrap`}
        >
          {(isScaleEqual || isScaleRelated) && firstPitch ? (
            <>
              <span className={`group-hover:hidden`}>{firstPitch} </span>
              <span className={`hidden group-hover:inline`}>C </span>
              {name}
            </>
          ) : (
            name
          )}
        </div>
      </div>
    </Editor.ListItem>
  );
};

export interface CustomScaleProps extends ScaleEditorProps {
  customScale: ScaleObject;
  index: number;
  element?: any;
  moveScale: (dragId: ScaleId, hoverId: ScaleId) => void;
}

export const CustomScale = (props: CustomScaleProps) => {
  const scale = props.customScale;
  const trackScale = props.scale;
  const scaleTrack = props.scaleTrack;
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useScaleDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useScaleDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const isScaleRelated = areScalesRelated(scale, trackScale);
  const isScaleEqual = areScalesEqual(scale, trackScale);

  const onScaleClick = () => {
    if (!scaleTrack) return;
    props.updateScale({
      ...props.scale,
      notes: scale.notes.map(mapNestedNote),
    });
  };

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center w-7 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        props.deleteScale(scale?.id);
      }}
    >
      <BsTrash />
    </div>
  );

  if (!scale || !trackScale) return null;

  return (
    <Editor.ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        isScaleEqual
          ? "text-sky-500 border-l border-l-sky-500"
          : isScaleRelated
          ? "text-cyan-400 border-l border-l-cyan-400"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={onScaleClick}
    >
      <div className="relative flex items-center h-8" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`border border-white/50 bg-transparent h-full rounded-l p-2 cursor-pointer outline-none overflow-ellipsis whitespace-nowrap`}
          value={scale.name}
          onChange={(e) => props.setScaleName(scale, e.target.value)}
          onKeyDown={blurOnEnter}
        />
        <DeleteButton />
      </div>
    </Editor.ListItem>
  );
};
