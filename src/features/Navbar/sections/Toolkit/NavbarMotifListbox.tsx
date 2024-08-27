import { Listbox as HeadlessListbox, Transition } from "@headlessui/react";
import { Pattern, PatternId } from "types/Pattern/PatternTypes";
import { BsCheck } from "react-icons/bs";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "presets/patterns";
import { blurEvent } from "utils/html";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "types/hooks";
import classNames from "classnames";
import { PresetPoseGroupList, PresetPoseGroupMap } from "presets/poses";
import { PresetScaleGroupList, PresetScaleGroupMap } from "presets/scales";
import { ScaleId, ScaleObject } from "types/Scale/ScaleTypes";
import { Pose, PoseId } from "types/Pose/PoseTypes";
import { NavbarToolkitProps } from "./NavbarToolkitSection";
import { selectIsSelectedEditorOpen } from "types/Editor/EditorSelectors";
import { selectCustomPatterns } from "types/Pattern/PatternSelectors";
import { selectPoses } from "types/Pose/PoseSelectors";
import {
  selectTrackScales,
  selectCustomScales,
} from "types/Scale/ScaleSelectors";
import {
  selectSelectedMotif,
  selectIsTimelineAddingSelectedClip,
} from "types/Timeline/TimelineSelectors";
import { selectSelectedMotifName } from "types/Arrangement/ArrangementScaleSelectors";
import { selectScaleNameMap } from "types/Arrangement/ArrangementTrackSelectors";
import { getValueByKey } from "utils/objects";
import {
  setSelectedPattern,
  setSelectedPose,
  setSelectedScale,
} from "types/Media/MediaThunks";

export function NavbarMotifListbox({
  type,
  motifText,
  motifBackground,
}: NavbarToolkitProps) {
  const dispatch = useProjectDispatch();

  const onEditor = useProjectSelector(selectIsSelectedEditorOpen);

  const customPatterns = useProjectDeepSelector(selectCustomPatterns);
  const customPoses = useProjectDeepSelector(selectPoses);
  const trackScales = useProjectDeepSelector(selectTrackScales);
  const customScales = useProjectDeepSelector(selectCustomScales);

  const motif = useProjectSelector(selectSelectedMotif);
  const motifName = useProjectSelector(selectSelectedMotifName);
  const scaleNameMap = useProjectSelector(selectScaleNameMap);
  const addingClips = useProjectSelector(selectIsTimelineAddingSelectedClip);

  if (!type) return null;

  // Compile groups with custom motifs
  const Group = {
    pattern: {
      ...PresetPatternGroupMap,
      "Custom Patterns": customPatterns,
      "Preset Patterns": [],
    } as Record<string, Pattern[]>,
    pose: {
      ...PresetPoseGroupMap,
      "Custom Poses": customPoses,
    } as Record<string, Pose[]>,
    scale: {
      ...PresetScaleGroupMap,
      "Track Scales": trackScales,
      "Custom Scales": customScales,
    } as Record<string, ScaleObject[]>,
  }[type];

  /** Render a motif in the listbox. */
  const renderMotif = (obj: Pattern | Pose | ScaleObject) => {
    const isSelected = motif?.id === obj.id;
    const font = isSelected ? "font-semibold" : "font-normal";
    const name =
      type === "scale"
        ? getValueByKey(scaleNameMap, obj.id as ScaleId) || obj.name
        : obj.name;

    const color = (active: boolean) => {
      if (isSelected && !active) return motifText;
      return "text-white";
    };
    return (
      <HeadlessListbox.Option
        key={obj.id}
        className={({ active }) =>
          `${
            active ? `${motifBackground} text-white` : ""
          } text-white cursor-default select-none font-light relative py-1.5 pl-4 pr-8`
        }
        value={obj.id}
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
  };

  // The new category patterns are padded with extra space
  const newCategorys = {
    pattern: ["Basic Intervals", "Straight Durations"],
    pose: ["Raised Intervals"],
    scale: ["Basic Scales", "Diatonic Modes", "Double Harmonic Modes"],
  }[type];

  /** Render a motif category in the listbox. */
  const renderCategory = (category: string) => {
    // Get the category style
    const isPadded = newCategorys.includes(category);
    const categoryPadding = isPadded ? "pt-0.5" : "pt-0";
    const categoryClass = `${categoryPadding} group relative h-full bg-slate-300/50 whitespace-nowrap`;

    // Get the label style
    const isCategorySelected = motif && isMotifInCategory(motif, category);
    const labelColor = isCategorySelected ? motifText : "text-white";
    const labelClass = `px-3 py-1.5 text-sm font-light backdrop-blur bg-slate-800 ${labelColor} ${hoverColor} group-hover:text-white`;

    // Get the options style
    const optionsClass = `font-nunito bg-slate-800 border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden group-hover:block`;

    return (
      <div key={category} className={categoryClass}>
        <div className={labelClass}>{category}</div>
        <div className={optionsClass}>
          <div className="h-full flex flex-col">
            {Group[category].map((obj) => renderMotif(obj))}
          </div>
        </div>
      </div>
    );
  };

  /** Checks if a motif is in a given category. */
  const isMotifInCategory = (
    motif: Pattern | Pose | ScaleObject,
    category: string
  ) => {
    return Group[category].some((m) => m.id === motif.id);
  };

  /** The selected motif is displayed in the listbox button. */
  const ListboxTitle = () => {
    const opacity = !motif?.id ? "opacity-75" : "opacity-100";
    const nameClass = `block w-full truncate px-1.5 text-[14px] text-gray-200 font-light whitespace-nowrap ${opacity}`;
    return <span className={nameClass}>{motifName}</span>;
  };

  /** Clicking on the Listbox button toggles the dropdown menu. */
  const ListboxButton = ({ open }: { open: boolean }) => (
    <HeadlessListbox.Button
      className={classNames(
        `select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none`,
        { "ring-1 ring-slate-200": open }
      )}
      onMouseUp={blurEvent}
    >
      <ListboxTitle />
    </HeadlessListbox.Button>
  );

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
      <HeadlessListbox.Options className="font-nunito absolute min-w-full max-w-fit py-1 bg-slate-800 border border-white/50 text-sm rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {GroupList.map(renderCategory)}
      </HeadlessListbox.Options>
    </Transition>
  );

  /** The Motif Listbox is a dropdown menu that allows the user to select a motif. */
  const callback = {
    pattern: (id: PatternId) => dispatch(setSelectedPattern({ data: id })),
    pose: (id: PoseId) => dispatch(setSelectedPose({ data: id })),
    scale: (id: ScaleId) => dispatch(setSelectedScale({ data: id })),
  }[type];

  const Listbox = () => {
    return (
      <HeadlessListbox value={motif?.id ?? ""} onChange={callback}>
        {({ open }) => (
          <div className="relative">
            <ListboxButton open={open} />
            {DropdownMenu({ open })}
          </div>
        )}
      </HeadlessListbox>
    );
  };

  /** The Pattern Label is a small label for the Pattern Listbox. */
  const GroupList = {
    pattern: PresetPatternGroupList,
    pose: PresetPoseGroupList,
    scale: PresetScaleGroupList,
  }[type];

  const labelColor = {
    pattern: addingClips ? "text-teal-500" : "text-emerald-500",
    pose: addingClips ? "text-fuchsia-500" : "text-pink-500",
    scale: addingClips ? "text-sky-500" : "text-blue-500",
  }[type];

  const hoverColor = {
    pattern: "group-hover:bg-emerald-600",
    pose: "group-hover:bg-pink-600",
    scale: "group-hover:bg-blue-600",
  }[type];

  const Label = () => (
    <span
      className={classNames(
        `absolute capitalize text-sm duration-300 transform -translate-y-4 scale-75 top-1.5 z-10 origin-0 bg-gray-900 rounded px-1 left-1`,
        labelColor
      )}
    >
      Selected {type}
    </span>
  );

  const editorClass = {
    pattern: "border-emerald-500 ring-1 ring-green-400",
    pose: "border-pink-500 ring-1 ring-fuchsia-400",
    scale: "border-sky-500 ring-1 ring-blue-400",
  }[type];

  const clipClass = {
    pattern: "border-teal-500 ring-1 ring-teal-500",
    pose: "border-fuchsia-500 ring-1 ring-fuchsia-500",
    scale: "border-sky-500 ring-1 ring-sky-500",
  }[type];

  const className = classNames(
    "xl:w-40 w-32 z-[80] relative flex flex-col rounded-md select-none border rounded-b-md",
    { [editorClass]: onEditor },
    { [clipClass]: addingClips },
    { "border-slate-400/80": !onEditor && !addingClips }
  );

  // Return the component
  return (
    <div className={className}>
      {Label()}
      {Listbox()}
    </div>
  );
}
