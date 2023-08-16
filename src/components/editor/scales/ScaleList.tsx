import { Disclosure } from "@headlessui/react";
import { useCallback, useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import Scales, { Scale } from "types/scales";
import { ScaleEditorProps } from ".";
import * as Editor from "../Editor";
import { CustomScale, PresetScale } from "./ScaleItem";

export default function ScaleList(props: ScaleEditorProps) {
  const scale = props.scale;
  // Get all scale presets, including custom scales
  const ScalePresets = {
    ...Scales.PresetGroups,
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
    ? (openCategories as typeof Scales.PresetCategories)
    : Scales.PresetCategories;

  // Move a scale to a new index when dragging
  const moveScale = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newScaleIds = [...props.scaleIds];
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

  return (
    <>
      <Editor.SearchBox query={searchQuery} setQuery={setSearchQuery} />
      <Editor.List>
        {scaleCategories.map((category) => {
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
                          className={`font-nunito py-3 px-2 ${
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
        })}
      </Editor.List>
    </>
  );
}
