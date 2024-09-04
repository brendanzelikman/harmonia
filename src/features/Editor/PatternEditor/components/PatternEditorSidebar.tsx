import { Disclosure, Transition } from "@headlessui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import { PatternEditorProps } from "../PatternEditor";
import { BiCopy } from "react-icons/bi";
import { cancelEvent } from "utils/html";
import { usePatternDrop, usePatternDrag } from "../hooks/usePatternEditorDnd";
import { PresetPatternGroupList, PresetPatternGroupMap } from "assets/patterns";
import { useProjectDeepSelector, useProjectDispatch } from "types/hooks";
import {
  EditorList,
  EditorListItem,
} from "features/Editor/components/EditorList";
import { EditorSearchBox } from "features/Editor/components/EditorSearchBox";
import {
  EditorSidebar,
  EditorSidebarHeader,
} from "features/Editor/components/EditorSidebar";
import { getPatternName } from "types/Pattern/PatternFunctions";
import { setPatternIds, updatePattern } from "types/Pattern/PatternSlice";
import { Pattern, PatternId } from "types/Pattern/PatternTypes";
import {
  selectCustomPatterns,
  selectPatternIds,
} from "types/Pattern/PatternSelectors";
import { setSelectedPattern } from "types/Media/MediaThunks";
import {
  createPattern,
  playPattern,
  deletePattern,
} from "types/Pattern/PatternThunks";

export function PatternEditorSidebar(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern } = props;
  const customPatterns = useProjectDeepSelector(selectCustomPatterns);
  const patternIds = useProjectDeepSelector(selectPatternIds);

  // Get all pattern presets, including custom patterns
  const PatternPresets = {
    ...PresetPatternGroupMap,
    "Custom Patterns": customPatterns,
    "Preset Patterns": [],
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchPattern = useCallback(
    (pattern: Pattern) => {
      return getPatternName(pattern)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    },
    [searchQuery]
  );

  // Get all categories with patterns that match the search query
  const openCategories = useMemo(() => {
    if (searchQuery === "") return [];
    return Object.keys(PatternPresets).filter((category) =>
      PatternPresets[category as keyof typeof PatternPresets].some(
        (pattern) => {
          return getPatternName(pattern)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
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
      const newPatternIds = [...patternIds];
      const dragIndex = newPatternIds.findIndex((id) => id === dragId);
      const hoverIndex = newPatternIds.findIndex((id) => id === hoverId);
      if (dragIndex < 0 || hoverIndex < 0) return;
      newPatternIds.splice(dragIndex, 1);
      newPatternIds.splice(hoverIndex, 0, patternIds[dragIndex]);
      dispatch(setPatternIds({ data: newPatternIds }));
    },
    [patternIds]
  );

  // Render a custom pattern
  const renderCustomPattern = useCallback(
    (pattern: Pattern, index: number) => (
      <CustomPattern
        {...props}
        key={pattern.id}
        customPattern={pattern}
        index={index}
        movePattern={movePattern}
      />
    ),
    [movePattern, props]
  );

  // Render a preset pattern
  const renderPresetPattern = useCallback(
    (pattern: Pattern) => (
      <PresetPattern {...props} key={pattern.id} presetPattern={pattern} />
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

      const isCategorySelected = pattern
        ? patterns.some((p) => p.id === pattern.id)
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
    [pattern, renderCustomPattern, renderPresetPattern, searchQuery]
  );

  if (!props.isShowingSidebar) return null;
  return (
    <EditorSidebar className={`ease-in-out duration-300`}>
      <EditorSidebarHeader className="border-b border-b-slate-500/50 mb-2">
        Preset Patterns
      </EditorSidebarHeader>
      <EditorSearchBox query={searchQuery} setQuery={setSearchQuery} />
      <EditorList>{patternCategories.map(renderCategory)}</EditorList>
    </EditorSidebar>
  );
}

export interface PresetPatternProps extends PatternEditorProps {
  presetPattern: Pattern;
}

export const PresetPattern = (props: PresetPatternProps) => {
  const dispatch = useProjectDispatch();
  const { pattern, presetPattern } = props;

  const CopyButton = () => (
    <BiCopy
      className="absolute right-0 top-0 h-full w-5 text-slate-500"
      onClick={(e) => {
        e.stopPropagation();
        dispatch(
          createPattern({
            data: {
              ...presetPattern,
              name: `${presetPattern.name} Copy`,
            },
          })
        );
      }}
    />
  );

  return (
    <EditorListItem
      className={`${
        pattern?.id === presetPattern.id
          ? "text-emerald-500 font-medium border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => {
        dispatch(setSelectedPattern({ data: presetPattern.id }));
        dispatch(playPattern(presetPattern));
      }}
    >
      <div className="flex relative items-center">
        <input
          className={`border-0 bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis whitespace-nowrap`}
          value={presetPattern.name}
          disabled
        />
        <CopyButton />
      </div>
    </EditorListItem>
  );
};

export interface CustomPatternProps extends PatternEditorProps {
  customPattern: Pattern;
  index: number;
  element?: any;
  movePattern: (dragId: PatternId, hoverId: PatternId) => void;
}

export const CustomPattern = (props: CustomPatternProps) => {
  const dispatch = useProjectDispatch();
  const { pattern, customPattern } = props;

  // Ref information
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = usePatternDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = usePatternDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const CopyButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-full font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        cancelEvent(e);
        dispatch(
          createPattern({
            data: {
              ...customPattern,
              name: `${customPattern.name} Copy`,
            },
          })
        );
      }}
    >
      <BiCopy />
    </div>
  );

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        dispatch(deletePattern({ data: customPattern.id }));
        cancelEvent(e);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <EditorListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        customPattern.id === pattern?.id
          ? "text-emerald-500 border-l border-l-emerald-500"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => dispatch(setSelectedPattern({ data: customPattern.id }))}
    >
      <div className="relative flex items-center h-9" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`border border-white/50 bg-transparent rounded-l h-full p-1 cursor-pointer outline-none overflow-ellipsis whitespace-nowrap ${
            customPattern.id === pattern?.id
              ? "pointer-events-all focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={customPattern?.name ?? ""}
          onChange={(e) =>
            dispatch(
              updatePattern({
                data: {
                  ...customPattern,
                  name: e.target.value,
                },
              })
            )
          }
        />
        <CopyButton />
        <DeleteButton />
      </div>
    </EditorListItem>
  );
};
