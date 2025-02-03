import {
  Listbox as HeadlessListbox,
  ListboxButton,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { Pattern, PatternId } from "types/Pattern/PatternTypes";
import { BsCheck } from "react-icons/bs";
import { PresetPatternGroupList, PresetPatternGroupMap } from "assets/patterns";
import { blurEvent } from "utils/html";
import { useProjectDispatch, use, useDeep } from "types/hooks";
import classNames from "classnames";
import { PresetScaleGroupList, PresetScaleGroupMap } from "assets/scales";
import { ScaleId, ScaleObject } from "types/Scale/ScaleTypes";
import { Pose, PoseId } from "types/Pose/PoseTypes";
import { selectIsSelectedEditorOpen } from "types/Editor/EditorSelectors";
import { selectCustomPatterns } from "types/Pattern/PatternSelectors";
import { selectPoses } from "types/Pose/PoseSelectors";
import {
  selectTrackScales,
  selectCustomScales,
} from "types/Scale/ScaleSelectors";
import {
  selectSelectedMotif,
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { selectSelectedMotifName } from "types/Arrangement/ArrangementScaleSelectors";
import { selectScaleNameMap } from "types/Arrangement/ArrangementTrackSelectors";
import { getValueByKey } from "utils/objects";
import {
  setSelectedPattern,
  setSelectedPose,
  setSelectedScale,
} from "types/Media/MediaThunks";
import {
  toolkitMotifBackground,
  toolkitMotifText,
} from "features/Navbar/components/NavbarStyles";
import { useCallback } from "react";
import { ClipType } from "types/Clip/ClipTypes";
import { MotifId } from "types/Motif/MotifTypes";

export function NavbarMotifbox(props: { type?: ClipType }) {
  const dispatch = useProjectDispatch();
  const type = use((_) => props.type ?? selectTimelineType(_));
  const onEditor = use(selectIsSelectedEditorOpen);
  const customPatterns = useDeep(selectCustomPatterns);
  const customPoses = useDeep(selectPoses);
  const trackScales = useDeep(selectTrackScales);
  const customScales = useDeep(selectCustomScales);
  const motif = useDeep((_) => selectSelectedMotif(_, type));
  const motifName = use((_) => selectSelectedMotifName(_, type));
  const scaleNameMap = useDeep(selectScaleNameMap);
  const addingClips = use((_) => selectIsAddingClips(_, type));
  if (!type) return null;

  // Compile groups with custom motifs
  const Group = {
    pattern: {
      ...PresetPatternGroupMap,
      "Custom Patterns": customPatterns,
      "Preset Patterns": [],
    } as Record<string, Pattern[]>,
    pose: {
      "Custom Poses": customPoses,
    } as Record<string, Pose[]>,
    scale: {
      ...PresetScaleGroupMap,
      "Track Scales": trackScales,
      "Custom Scales": customScales,
    } as Record<string, ScaleObject[]>,
  }[type];

  /** The Motif Listbox is a dropdown menu that allows the user to select a motif. */
  const callback = {
    pattern: (id: PatternId) => dispatch(setSelectedPattern({ data: id })),
    pose: (id: PoseId) => dispatch(setSelectedPose({ data: id })),
    scale: (id: ScaleId) => dispatch(setSelectedScale({ data: id })),
  }[type] as (id: MotifId) => void;

  /** Render a motif in the listbox. */
  const renderMotif = useCallback(
    (obj: Pattern | Pose | ScaleObject) => {
      const isSelected = motif?.id === obj.id;
      const font = isSelected ? "font-semibold" : "font-normal";
      const name =
        type === "scale"
          ? getValueByKey(scaleNameMap, obj.id as ScaleId) || obj.name
          : obj.name;

      const color = (active: boolean) => {
        if (isSelected && !active) return toolkitMotifText[type];
        return "text-white";
      };
      return (
        <HeadlessListbox.Option
          key={obj.id}
          className={({ active }) =>
            `${
              active ? `${toolkitMotifBackground[type]} text-white` : ""
            } text-white cursor-default select-none font-light relative py-1.5 pl-4 pr-8`
          }
          value={obj.id}
          onClick={() => callback(obj.id)}
        >
          {({ active }) => (
            <div className={color(active)}>
              <span className={`block truncate ${font}`}>{name}</span>
              {isSelected ? (
                <span
                  className={`absolute inset-y-0 right-0 flex items-center pr-2 text-xl`}
                >
                  <BsCheck />
                </span>
              ) : null}
            </div>
          )}
        </HeadlessListbox.Option>
      );
    },
    [motif, scaleNameMap, callback, type]
  );

  /** Render a motif category in the listbox. */
  const renderCategory = useCallback(
    (category: string) => {
      const isPadded = newCategorys[type].includes(category);
      const isCategorySelected = motif && isMotifInCategory(motif, category);
      const labelColor = isCategorySelected
        ? toolkitMotifText[type]
        : "text-white";

      return (
        <div
          key={category}
          className={`${
            isPadded ? "pt-0.5" : "pt-0"
          } group/category relative h-full min-h-fit min-w-fit bg-slate-300/50 whitespace-nowrap`}
        >
          <div
            className={`peer px-3 py-1.5 text-sm font-light backdrop-blur bg-slate-800 ${labelColor} ${hoverColor[type]} hover:text-white`}
          >
            {category}
          </div>
          <div
            className={`font-nunito bg-slate-800 border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden peer-hover:block group-hover/category:block`}
          >
            <div className="h-full flex flex-col">
              {Group[category].map((obj) => renderMotif(obj))}
            </div>
          </div>
        </div>
      );
    },
    [motif, renderMotif, type]
  );

  /** Checks if a motif is in a given category. */
  const isMotifInCategory = (
    motif: Pattern | Pose | ScaleObject,
    category: string
  ) => {
    return Group[category].some((m) => m.id === motif.id);
  };

  /** The Dropdown Menu shows all custom and preset motifs. */
  const DropdownMenu = ({ open }: { open: boolean }) => (
    <Transition
      show={open}
      appear
      enter="transition-all ease-out duration-75"
      enterFrom="transform opacity-0 scale-90"
      enterTo="transform opacity-100 scale-100"
      leave="transition-all ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-90"
    >
      <ListboxOptions className="font-nunito absolute min-w-full max-w-fit py-1 bg-slate-800 border border-white/50 text-sm rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {GroupList[type].map(renderCategory)}
      </ListboxOptions>
    </Transition>
  );

  const Listbox = () => {
    return (
      <HeadlessListbox value={[motif?.id ?? ""]} multiple>
        {({ open }) => (
          <div className="relative">
            <ListboxButton
              className={classNames(
                `select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none`,
                { "ring-1 ring-slate-200": open }
              )}
              onMouseUp={blurEvent}
            >
              <span
                className={`block w-full truncate px-1.5 text-[14px] text-gray-200 font-light whitespace-nowrap ${
                  !motif?.id ? "opacity-75" : "opacity-100"
                }`}
              >
                {motifName}
              </span>
            </ListboxButton>
            {DropdownMenu({ open })}
          </div>
        )}
      </HeadlessListbox>
    );
  };

  const labelColor = {
    pattern: addingClips ? "text-teal-500" : "text-emerald-500",
    pose: addingClips ? "text-fuchsia-500" : "text-pink-500",
    scale: addingClips ? "text-sky-500" : "text-blue-500",
  }[type];

  // Return the component
  return (
    <div
      className={classNames(
        "xl:w-40 w-32 relative flex flex-col rounded-md select-none border rounded-b-md",
        { [editorClass[type]]: onEditor },
        { [clipClass[type]]: addingClips },
        { "border-slate-400/80": !onEditor && !addingClips }
      )}
    >
      <span
        className={classNames(
          `absolute capitalize text-sm duration-300 transform -translate-y-4 scale-75 top-1.5 z-10 origin-0 bg-gray-900 rounded px-1 left-1`,
          labelColor
        )}
      >
        Selected {type}
      </span>
      {Listbox()}
    </div>
  );
}

const GroupList = {
  pattern: PresetPatternGroupList,
  pose: ["Custom Poses"],
  scale: PresetScaleGroupList,
};

const hoverColor = {
  pattern: "hover:bg-emerald-600",
  pose: "hover:bg-pink-600",
  scale: "hover:bg-blue-600",
};

const editorClass = {
  pattern: "border-emerald-500 ring-1 ring-green-400",
  pose: "border-pink-500 ring-1 ring-fuchsia-400",
  scale: "border-sky-500 ring-1 ring-blue-400",
};

const clipClass = {
  pattern: "border-teal-500 ring-1 ring-teal-500",
  pose: "border-fuchsia-500 ring-1 ring-fuchsia-500",
  scale: "border-sky-500 ring-1 ring-sky-500",
};

// The new category patterns are padded with extra space
const newCategorys = {
  pattern: ["Basic Intervals", "Straight Durations"],
  pose: ["Raised Intervals"],
  scale: ["Basic Scales", "Diatonic Modes", "Double Harmonic Modes"],
};
