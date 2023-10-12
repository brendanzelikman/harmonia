import { Disclosure, Transition } from "@headlessui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import { Pattern, PatternId } from "types/Pattern";
import * as Editor from "features/Editor";
import { PatternEditorProps } from "..";
import { BiCopy } from "react-icons/bi";
import { cancelEvent } from "utils";
import { usePatternDrop, usePatternDrag } from "../hooks/usePatternDnd";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "presets/patterns";

export function PatternList(props: PatternEditorProps) {
  // Get all pattern presets, including custom patterns
  const PatternPresets = {
    ...PresetPatternGroupMap,
    "Custom Patterns": props.customPatterns,
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchPattern = useCallback(
    (pattern: Pattern) =>
      pattern.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );

  // Get all categories with patterns that match the search query
  const openCategories = useMemo(() => {
    if (searchQuery === "") return [];
    return Object.keys(PatternPresets).filter((category) =>
      PatternPresets[category as keyof typeof PatternPresets].some((pattern) =>
        pattern.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // If there are no open categories, show all categories
  const patternCategories = openCategories.length
    ? (openCategories as typeof PresetPatternGroupList)
    : PresetPatternGroupList;

  // Move a pattern to a new index when dragging
  const movePattern = useCallback(
    (dragId: PatternId, hoverId: PatternId) => {
      const newPatternIds = [...props.patternIds];
      const dragIndex = newPatternIds.findIndex((id) => id === dragId);
      const hoverIndex = newPatternIds.findIndex((id) => id === hoverId);
      if (dragIndex < 0 || hoverIndex < 0) return;
      newPatternIds.splice(dragIndex, 1);
      newPatternIds.splice(hoverIndex, 0, props.patternIds[dragIndex]);
      props.setPatternIds(newPatternIds);
    },
    [props.patternIds]
  );

  // Render a custom pattern
  const renderCustomPattern = useCallback(
    (pattern: Pattern, index: number) => (
      <CustomPattern
        {...props}
        key={pattern.id}
        pattern={pattern}
        index={index}
        movePattern={movePattern}
      />
    ),
    [movePattern, props]
  );

  // Render a preset pattern
  const renderPresetPattern = useCallback(
    (pattern: Pattern) => (
      <PresetPattern {...props} key={pattern.id} pattern={pattern} />
    ),
    [props]
  );

  // Render a category of patterns
  const renderCategory = useCallback(
    (category: any) => {
      const typedCategory = category as keyof typeof PatternPresets;
      const isCategoryOpen = openCategories.includes(typedCategory);
      const isCustomCategory = typedCategory === "Custom Patterns";

      const searching = searchQuery !== "";
      const presetPatterns = PatternPresets[typedCategory];
      const patterns = searching
        ? presetPatterns.filter(doesMatchPattern)
        : presetPatterns;

      const isCategorySelected = props.selectedPattern
        ? patterns.some((pattern) => pattern.id === props.selectedPattern?.id)
        : false;

      return (
        <Disclosure key={category}>
          {({ open }) => {
            const isOpen = isCategoryOpen || open;
            return (
              <>
                <Disclosure.Button>
                  <div
                    className={`flex items-center justify-center ${
                      isCategorySelected ? "text-green-200" : "text-slate-50"
                    }`}
                  >
                    <label
                      className={`py-2.5 px-2 ${
                        open ? "font-bold" : "font-medium"
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
                    {patterns.map(
                      isCustomCategory
                        ? renderCustomPattern
                        : renderPresetPattern
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
      props.selectedPattern,
      renderCustomPattern,
      renderPresetPattern,
      searchQuery,
    ]
  );

  return (
    <>
      <Editor.SearchBox query={searchQuery} setQuery={setSearchQuery} />
      <Editor.List>{patternCategories.map(renderCategory)}</Editor.List>
    </>
  );
}

export interface PresetPatternProps extends PatternEditorProps {
  pattern: Pattern;
}

export const PresetPattern = (props: PresetPatternProps) => {
  const pattern = props.pattern;
  if (!pattern) return null;

  const CopyButton = () => (
    <BiCopy
      className="absolute right-0 top-0 h-full w-5 text-slate-500"
      onClick={(e) => {
        e.stopPropagation();
        props.copyPattern(pattern);
      }}
    />
  );

  return (
    <Editor.ListItem
      className={`${
        pattern.id === props.selectedPattern?.id
          ? "text-emerald-500 font-medium border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => {
        props.setSelectedPattern(pattern.id);
        props.playPattern(pattern);
      }}
    >
      <div className="flex relative items-center">
        <input
          className={`peer border-0 bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis`}
          value={pattern.name}
          disabled
        />
        <CopyButton />
      </div>
    </Editor.ListItem>
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
      className={`flex justify-center items-center px-1 h-full font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        props.copyPattern(pattern);
        cancelEvent(e);
      }}
    >
      <BiCopy />
    </div>
  );

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        props.deletePattern(pattern.id);
        cancelEvent(e);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <Editor.ListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        pattern.id === props.selectedPattern?.id
          ? "text-emerald-500 border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => props.setSelectedPattern(pattern.id)}
    >
      <div className="relative flex items-center h-9" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`peer border border-white/50 bg-transparent rounded-l h-full p-1 cursor-pointer outline-none overflow-ellipsis ${
            pattern.id === props.selectedPattern?.id
              ? "pointer-events-all focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={pattern.name ?? ""}
          onChange={(e) => props.setPatternName(pattern, e.target.value)}
        />
        <CopyButton />
        <DeleteButton />
      </div>
    </Editor.ListItem>
  );
};
