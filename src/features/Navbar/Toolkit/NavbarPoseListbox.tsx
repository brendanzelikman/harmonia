import { Listbox, Transition } from "@headlessui/react";
import {
  selectSelectedPose,
  selectEditor,
  selectPoses,
  selectTimeline,
} from "redux/selectors";
import { BsCheck } from "react-icons/bs";
import { useCallback, useEffect } from "react";
import { blurEvent } from "utils/html";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import {
  PoseGroupKey,
  PoseGroupMap,
  PresetPoseGroupList,
  PresetPoseGroupMap,
} from "presets/poses";
import { setSelectedPose } from "redux/Media";
import { isPoseEditorOpen } from "types/Editor";
import { Pose } from "types/Pose";
import classNames from "classnames";
import { isTimelineAddingPoseClips } from "types/Timeline";
import { UpAMinorSecond } from "presets/poses/InfinitelyRaisedIntervals";

export function NavbarPoseListbox() {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const editor = useProjectSelector(selectEditor);
  const poses = useProjectDeepSelector(selectPoses);
  const customPoses = poses;
  const selectedPose = useProjectSelector(selectSelectedPose);
  const onPoseEditor = isPoseEditorOpen(editor);
  const addingPoseClips = isTimelineAddingPoseClips(timeline);

  // Set the selected pose to the first pose in the list.
  useEffect(() => {
    if (!selectedPose) {
      dispatch(setSelectedPose(poses[0]?.id || UpAMinorSecond.id));
    }
  }, [selectedPose, poses]);

  // Compile the pose groups with the custom poses
  const PoseGroups: PoseGroupMap = {
    ...PresetPoseGroupMap,
    "Custom Poses": customPoses,
  };

  /** Render a pattern in the listbox. */
  const renderPose = useCallback(
    (pose: Pose) => {
      const isPoseSelected = selectedPose?.id === pose.id;
      const poseFont = isPoseSelected ? "font-semibold" : "font-normal";
      const poseColor = (active: boolean) => {
        if (isPoseSelected && !active) return "text-pink-500";
        return "text-white";
      };
      return (
        <Listbox.Option
          key={pose.id}
          className={({ active }) =>
            `${
              active ? "bg-pink-500 text-white" : ""
            } text-white cursor-default select-none font-light relative py-1.5 pl-4 pr-8`
          }
          value={pose.id}
        >
          {({ active }) => (
            <div className={poseColor(active)}>
              <span className={`block truncate ${poseFont}`}>{pose.name}</span>
              {isPoseSelected ? (
                <span
                  className={`absolute inset-y-0 right-0 flex items-center pr-2 text-xl`}
                >
                  <BsCheck />
                </span>
              ) : null}
            </div>
          )}
        </Listbox.Option>
      );
    },
    [selectedPose]
  );

  // The new category poses are padded with extra space
  const newCategoryPoses: PoseGroupKey[] = [
    "Raised Intervals (Indefinite)",
    "Raised Intervals (1 Measure)",
    "Basic Arpeggiations",
  ];

  /** Render a pattern category in the listbox. */
  const renderPoseCategory = useCallback(
    (category: PoseGroupKey) => {
      // Get the category style
      const isPadded = newCategoryPoses.includes(category);
      const categoryPadding = isPadded ? "pt-0.5" : "pt-0";
      const categoryClass = `${categoryPadding} group relative h-full bg-slate-300/50 whitespace-nowrap`;

      // Get the label style
      const isCategorySelected =
        selectedPose && isPoseInCategory(selectedPose, category);
      const labelColor = isCategorySelected ? "text-pink-400" : "text-white";
      const labelClass = `px-3 py-1.5 text-sm font-light backdrop-blur bg-slate-800 ${labelColor} group-hover:bg-pink-600 group-hover:text-white`;

      // Get the options style
      const optionsClass = `font-nunito bg-slate-800 border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden group-hover:block`;

      return (
        <div key={category} className={categoryClass}>
          <div className={labelClass}>{category}</div>
          <div className={optionsClass}>
            <div className="h-full flex flex-col">
              {PoseGroups[category].map((pose) => renderPose(pose))}
            </div>
          </div>
        </div>
      );
    },
    [selectedPose]
  );

  /** Checks if a pose is in a given category. */
  const isPoseInCategory = (pose: Pose, category: PoseGroupKey) => {
    return PoseGroups[category].some((m) => m.id === pose.id);
  };

  /** The selected pose is displayed in the listbox button. */
  const SelectedPoseName = () => {
    const opacity = !selectedPose?.id ? "opacity-75" : "opacity-100";
    const name = !selectedPose?.id ? "No Pose" : selectedPose.name;
    const nameClass = `block w-full truncate px-1.5 text-[14px] text-gray-200 font-light whitespace-nowrap ${opacity}`;
    return <span className={nameClass}>{name}</span>;
  };

  /** Clicking on the Pose Listbox button toggles the dropdown menu. */
  const PoseListboxButton = ({ open }: { open: boolean }) => (
    <Listbox.Button
      className={classNames(
        "select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none",
        { "ring-1 ring-slate-200": open }
      )}
      onMouseUp={blurEvent}
    >
      <SelectedPoseName />
    </Listbox.Button>
  );

  /** The Pose Dropdown Menu shows all custom and preset poses. */
  const PoseDropdownMenu = ({ open }: { open: boolean }) => (
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
      <Listbox.Options className="font-nunito animate-in fade-in zoom-in-90 duration-75 absolute z-10 min-w-full max-w-fit py-1 bg-slate-800 border border-white/50 text-base rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {PresetPoseGroupList.map(renderPoseCategory)}
      </Listbox.Options>
    </Transition>
  );

  /** The Pose Listbox is a dropdown menu that allows the user to select a pose. */
  const PoseListbox = () => {
    return (
      <Listbox
        value={selectedPose?.id ?? "major-chord"}
        onChange={(id) => dispatch(setSelectedPose(id))}
      >
        {({ open }) => (
          <div className="relative">
            <PoseListboxButton open={open} />
            {PoseDropdownMenu({ open })}
          </div>
        )}
      </Listbox>
    );
  };

  /** The Pose Label is a small label for the Pose Listbox. */
  const PoseLabel = () => (
    <span
      className={classNames(
        `absolute text-sm duration-300 transform -translate-y-4 scale-75 top-1.5 z-10 origin-0 bg-gray-900 rounded px-1 left-1`,
        { "text-fuchsia-400": addingPoseClips },
        { "text-pink-400": !addingPoseClips }
      )}
    >
      Pose
    </span>
  );

  // Assemble the classname
  const className = classNames(
    `xl:w-40 w-32 z-[80] relative flex flex-col rounded-md select-none border rounded-b-md`,
    { "border-pink-400 ring-1 ring-pink-400": onPoseEditor },
    { "border-fuchsia-500 ring-1 ring-fuchsia-500": addingPoseClips },
    { "border-slate-400/80": !onPoseEditor && !addingPoseClips }
  );

  // Return the component
  return (
    <div className={className}>
      <PoseLabel />
      {PoseListbox()}
    </div>
  );
}
