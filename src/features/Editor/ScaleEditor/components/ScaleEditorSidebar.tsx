import { Disclosure } from "@headlessui/react";
import { useCallback, useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import * as _ from "types/Scale";
import { ScaleEditorProps } from "../ScaleEditor";
import { Editor } from "features/Editor/components";
import { PresetScaleGroupMap, PresetScaleGroupList } from "presets/scales";
import { useProjectDeepSelector } from "redux/hooks";
import { selectCustomScales, selectScaleIds } from "redux/selectors";
import { setScaleIds } from "redux/Scale";
import classNames from "classnames";
import { PresetScale } from "./ScaleEditorPresetScale";
import { CustomScale } from "./ScaleEditorCustomScale";

export function ScaleEditorSidebar(props: ScaleEditorProps) {
  const { dispatch, scale } = props;
  const customScales = useProjectDeepSelector(selectCustomScales);
  const scaleIds = useProjectDeepSelector(selectScaleIds);

  // Get all scale presets, including custom scales
  const ScalePresets = {
    ...PresetScaleGroupMap,
    "Custom Scales": customScales.map((scale) => ({
      ...scale,
      notes: _.resolveScaleToMidi(scale),
    })),
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchScale = useCallback(
    (scale: _.ScaleObject) =>
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
  const moveScale = (dragId: _.ScaleId, hoverId: _.ScaleId) => {
    const newScaleIds = [...scaleIds];
    const dragIndex = newScaleIds.findIndex((id) => id === dragId);
    const hoverIndex = newScaleIds.findIndex((id) => id === hoverId);
    if (dragIndex < 0 || hoverIndex < 0) return;
    newScaleIds.splice(dragIndex, 1);
    newScaleIds.splice(hoverIndex, 0, scaleIds[dragIndex]);
    dispatch(setScaleIds(newScaleIds));
  };

  // Render a custom scale
  const renderCustomScale = (scale: _.ScaleObject, index: number) => (
    <CustomScale
      key={scale.id}
      {...props}
      customScale={scale}
      index={index}
      moveScale={moveScale}
    />
  );

  // Render a preset scale
  const renderPresetScale = (scale: _.Scale) => (
    <PresetScale
      {...props}
      key={_.getScaleAsString(scale)}
      presetScale={scale}
    />
  );

  // Render a category of scales
  const renderCategory = useCallback(
    (category: any) => {
      // Check if the current category is open
      const typedCategory = category as keyof typeof ScalePresets;
      const isCategoryOpen = openCategories.includes(typedCategory);

      // Check if the current category is a custom category
      const isCustomCategory = typedCategory === "Custom Scales";

      // Check if the user is searching
      const searching = searchQuery !== "";

      // Filter the scales if the user is searching
      const presetScales = ScalePresets[typedCategory];
      const scales = searching
        ? presetScales.filter(doesMatchScale)
        : presetScales;

      // Check if the category is being searched for
      const isCategorySelected = scale
        ? scales.some((s) => _.areScalesRelated(scale, s))
        : false;

      // Return the category
      return (
        <Disclosure key={category}>
          {({ open }) => {
            const isOpen = isCategoryOpen || open;

            // Open categories are bold and have an asterisk
            const CategoryLabel = () => (
              <label
                className={classNames("py-2.5 px-2", {
                  "font-extrabold": open,
                  "font-medium": !open,
                })}
              >
                {isCategorySelected ? "*" : ""} {typedCategory}
              </label>
            );

            // Open categories have a different chevron icon
            const CategoryIcon = () => (
              <span className="ml-auto mr-2">
                {isOpen ? <BsChevronDown /> : <BsChevronUp />}
              </span>
            );
            return (
              <>
                <Disclosure.Button>
                  <div className="flex items-center justify-center text-slate-50">
                    <CategoryLabel />
                    <CategoryIcon />
                  </div>
                </Disclosure.Button>
                {!isOpen ? null : (
                  <div className="animate-in fade-in zoom-in-95 duration-75">
                    <Disclosure.Panel static={isOpen}>
                      {scales.map(
                        isCustomCategory ? renderCustomScale : renderPresetScale
                      )}
                    </Disclosure.Panel>
                  </div>
                )}
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

  if (!props.isShowingSidebar) return null;
  return (
    <Editor.Sidebar>
      <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2">
        Preset Scales
      </Editor.SidebarHeader>
      <Editor.SearchBox query={searchQuery} setQuery={setSearchQuery} />
      <Editor.List>{scaleCategories.map(renderCategory)}</Editor.List>
    </Editor.Sidebar>
  );
}
