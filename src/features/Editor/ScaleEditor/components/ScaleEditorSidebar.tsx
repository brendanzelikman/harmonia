import { Disclosure } from "@headlessui/react";
import { useCallback, useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ScaleEditorProps } from "../ScaleEditor";
import { PresetScaleGroupMap, PresetScaleGroupList } from "presets/scales";
import { useProjectDeepSelector, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { PresetScale } from "./ScaleEditorPresetScale";
import { CustomScale } from "./ScaleEditorCustomScale";
import { EditorList } from "features/Editor/components/EditorList";
import { EditorSearchBox } from "features/Editor/components/EditorSearchBox";
import {
  EditorSidebar,
  EditorSidebarHeader,
} from "features/Editor/components/EditorSidebar";
import { getTrackLabel } from "types/Track/TrackFunctions";
import {
  resolveScaleToMidi,
  resolveScaleChainToMidi,
} from "types/Scale/ScaleResolvers";
import { areScalesRelated } from "types/Scale/ScaleUtils";
import { ScaleObject, ScaleId, Scale } from "types/Scale/ScaleTypes";
import {
  selectCustomScales,
  selectTrackScales,
  selectScaleIds,
} from "types/Scale/ScaleSelectors";
import {
  selectScaleTrackMap,
  selectScaleTracks,
  selectTrackScaleChainMap,
} from "types/Track/TrackSelectors";
import { getArrayByKey } from "utils/objects";
import { setScaleIds } from "types/Scale/ScaleSlice";

export function ScaleEditorSidebar(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { scale } = props;
  const customScales = useProjectDeepSelector(selectCustomScales);
  const _trackScales = useProjectDeepSelector(selectTrackScales);
  const scaleIds = useProjectDeepSelector(selectScaleIds);
  const scaleTrackMap = useProjectDeepSelector(selectScaleTrackMap);
  const scaleTracks = useProjectDeepSelector(selectScaleTracks);
  const scaleChainMap = useProjectDeepSelector(selectTrackScaleChainMap);

  // Get all scale presets exlcuding the provided scale
  let unknownCount = 1;
  const trackScales = _trackScales.map((scale) => {
    const scaleTrack = scaleTracks.find((t) => t.scaleId === scale.id);
    if (!scaleTrack) {
      return {
        ...scale,
        notes: resolveScaleToMidi(scale),
        name: `Unknown Scale #${unknownCount++}`,
      };
    }
    const scaleChain = getArrayByKey(scaleChainMap, scaleTrack.id);
    const label = getTrackLabel(scaleTrack.id, scaleTrackMap);
    return {
      ...scale,
      notes: resolveScaleChainToMidi(scaleChain),
      name: `MIDI Scale (Track ${label})`,
    };
  });

  const ScalePresets = {
    ...PresetScaleGroupMap,
    "Track Scales": trackScales,
    "Custom Scales": customScales,
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
  const moveScale = (dragId: ScaleId, hoverId: ScaleId) => {
    const newScaleIds = [...scaleIds];
    const dragIndex = newScaleIds.findIndex((id) => id === dragId);
    const hoverIndex = newScaleIds.findIndex((id) => id === hoverId);
    if (dragIndex < 0 || hoverIndex < 0) return;
    newScaleIds.splice(dragIndex, 1);
    newScaleIds.splice(hoverIndex, 0, scaleIds[dragIndex]);
    dispatch(setScaleIds({ data: newScaleIds }));
  };

  // Render a custom scale
  const renderCustomScale = (scale: ScaleObject, index: number) => (
    <CustomScale
      key={scale.id}
      {...props}
      customScale={scale}
      index={index}
      moveScale={moveScale}
    />
  );

  // Render a preset scale
  const renderPresetScale = (scale: ScaleObject) => (
    <PresetScale {...props} key={JSON.stringify(scale)} presetScale={scale} />
  );

  // Render a category of scales
  const renderCategory = useCallback(
    (category: any) => {
      // Check if the current category is open
      const typedCategory = category as keyof typeof ScalePresets;
      const isCategoryOpen = openCategories.includes(typedCategory);

      // Check if the current category is a custom category
      const isCustomCategory =
        typedCategory === "Custom Scales" || typedCategory === "Track Scales";

      // Check if the user is searching
      const searching = searchQuery !== "";

      // Filter the scales if the user is searching
      const presetScales = ScalePresets[typedCategory];
      const scales = searching
        ? presetScales.filter(doesMatchScale)
        : presetScales;

      // Check if the category is being searched for
      const isCategorySelected = scale
        ? scales.some((s) => areScalesRelated(scale, s))
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
    <EditorSidebar>
      <EditorSidebarHeader className="border-b border-b-slate-500/50 mb-2">
        Preset Scales
      </EditorSidebarHeader>
      <EditorSearchBox query={searchQuery} setQuery={setSearchQuery} />
      <EditorList>{scaleCategories.map(renderCategory)}</EditorList>
    </EditorSidebar>
  );
}
