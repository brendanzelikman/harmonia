import { Disclosure } from "@headlessui/react";
import { useCallback, useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import Patterns, { Pattern, PatternId } from "types/patterns";
import { PatternEditorProps } from ".";
import * as Editor from "../Editor";
import { CustomPattern, PresetPattern } from "./PatternItem";

export default function PatternList(props: PatternEditorProps) {
  // Get all pattern presets, including custom patterns
  const PatternPresets = {
    ...Patterns.PresetGroups,
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
  }, [searchQuery, props.selectedPatternId]);

  // If there are no open categories, show all categories
  const patternCategories = openCategories.length
    ? (openCategories as typeof Patterns.PresetCategories)
    : Patterns.PresetCategories;

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

      const isCategorySelected = props.selectedPatternId
        ? patterns.some((pattern) => pattern.id === props.selectedPatternId)
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
                      className={`font-nunito py-3 px-2 ${
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
                <Disclosure.Panel static={isOpen}>
                  {patterns.map(
                    isCustomCategory ? renderCustomPattern : renderPresetPattern
                  )}
                </Disclosure.Panel>
              </>
            );
          }}
        </Disclosure>
      );
    },
    [
      props.selectedPatternId,
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
