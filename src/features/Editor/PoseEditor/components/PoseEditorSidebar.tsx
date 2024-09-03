import { Disclosure, Transition } from "@headlessui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import { PoseEditorProps } from "../PoseEditor";
import { BiCopy } from "react-icons/bi";
import { cancelEvent } from "utils/html";
import { useProjectDeepSelector, useProjectDispatch } from "types/hooks";
import {
  PoseGroupKey,
  PresetPoseGroupList,
  PresetPoseGroupMap,
} from "assets/poses";
import { usePoseDrag, usePoseDrop } from "../hooks/usePoseEditorDnd";
import {
  EditorList,
  EditorListItem,
} from "features/Editor/components/EditorList";
import { EditorSearchBox } from "features/Editor/components/EditorSearchBox";
import {
  EditorSidebar,
  EditorSidebarHeader,
} from "features/Editor/components/EditorSidebar";
import { getPoseName } from "types/Pose/PoseFunctions";
import { setPoseIds, removePose, updatePose } from "types/Pose/PoseSlice";
import { Pose, PoseId } from "types/Pose/PoseTypes";
import { selectPoseIds, selectPoses } from "types/Pose/PoseSelectors";
import { setSelectedPose } from "types/Media/MediaThunks";
import { copyPose } from "types/Pose/PoseThunks";

export function PoseEditorSidebar(props: PoseEditorProps) {
  const dispatch = useProjectDispatch();
  const { pose } = props;
  const customPoses = useProjectDeepSelector(selectPoses);
  const poseIds = useProjectDeepSelector(selectPoseIds);

  // Get all pose presets, including custom poses
  const PosePresets = {
    ...PresetPoseGroupMap,
    "Custom Poses": customPoses,
  };

  // Store the search query for filtering presets
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchPose = useCallback(
    (pose: Pose) => {
      return getPoseName(pose)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    },
    [searchQuery]
  );

  // Get all categories with poses that match the search query
  const openCategories = useMemo(() => {
    if (searchQuery === "") return [];
    return Object.keys(PosePresets).filter((category) =>
      PosePresets[category as keyof typeof PosePresets].some((pose) => {
        return getPoseName(pose)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    );
  }, [searchQuery]);

  // If there are no open categories, show all categories
  const poseCategories = openCategories.length
    ? (openCategories as typeof PresetPoseGroupList)
    : PresetPoseGroupList;

  // Move a pose to a new index when dragging
  const movePose = useCallback(
    (dragId: PoseId, hoverId: PoseId) => {
      const newPoseIds = [...poseIds];
      const dragIndex = newPoseIds.findIndex((id) => id === dragId);
      const hoverIndex = newPoseIds.findIndex((id) => id === hoverId);
      if (dragIndex < 0 || hoverIndex < 0) return;
      newPoseIds.splice(dragIndex, 1);
      newPoseIds.splice(hoverIndex, 0, poseIds[dragIndex]);
      dispatch(setPoseIds(newPoseIds));
    },
    [poseIds]
  );

  // Render a custom pose
  const renderCustomPose = useCallback(
    (pose: Pose, index: number) => (
      <CustomPose
        {...props}
        key={pose.id}
        customPose={pose}
        index={index}
        movePose={movePose}
      />
    ),
    [movePose, props]
  );

  // Render a preset pattern
  const renderPresetPose = useCallback(
    (pose: Pose) => <PresetPose {...props} key={pose.id} presetPose={pose} />,
    [props]
  );

  // Render a category of patterns
  const renderCategory = useCallback(
    (category: PoseGroupKey) => {
      const typedCategory = category as keyof typeof PosePresets;
      const isCategoryOpen = openCategories.includes(typedCategory);
      const isCustomCategory = typedCategory === "Custom Poses";

      const searching = searchQuery !== "";
      const presetPoses = PosePresets[typedCategory];
      const poses = searching ? presetPoses.filter(doesMatchPose) : presetPoses;

      const isCategorySelected = pose
        ? poses.some((p) => p.id === pose.id)
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
                      isCategorySelected ? "text-pink-200" : "text-slate-50"
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
                    {poses.map(
                      isCustomCategory ? renderCustomPose : renderPresetPose
                    )}
                  </Disclosure.Panel>
                </Transition>
              </>
            );
          }}
        </Disclosure>
      );
    },
    [pose, renderCustomPose, renderPresetPose, searchQuery]
  );

  if (!props.isShowingSidebar) return null;
  return (
    <EditorSidebar className={`ease-in-out duration-300`}>
      <EditorSidebarHeader className="border-b border-b-slate-500/50 mb-2">
        Preset Poses
      </EditorSidebarHeader>
      <EditorSearchBox query={searchQuery} setQuery={setSearchQuery} />
      <EditorList>{poseCategories.map(renderCategory)}</EditorList>
    </EditorSidebar>
  );
}

export interface PresetPoseProps extends PoseEditorProps {
  presetPose: Pose;
}

export const PresetPose = (props: PresetPoseProps) => {
  const dispatch = useProjectDispatch();
  const { pose, presetPose } = props;

  const CopyButton = () => (
    <BiCopy
      className="absolute right-0 top-0 h-full w-5 text-slate-500"
      onClick={(e) => {
        e.stopPropagation();
        dispatch(copyPose(presetPose));
      }}
    />
  );

  return (
    <EditorListItem
      className={`${
        pose?.id === presetPose.id
          ? "text-pink-400 font-medium border-l border-l-pink-400"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      } select-none`}
      onClick={() => dispatch(setSelectedPose({ data: presetPose.id }))}
    >
      <div className="flex relative items-center">
        <input
          className={`border-0 bg-transparent h-6 rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis whitespace-nowrap`}
          value={presetPose.name}
          disabled
        />
        <CopyButton />
      </div>
    </EditorListItem>
  );
};

export interface CustomPoseProps extends PoseEditorProps {
  customPose: Pose;
  index: number;
  element?: any;
  movePose: (dragId: PoseId, hoverId: PoseId) => void;
}

export const CustomPose = (props: CustomPoseProps) => {
  const dispatch = useProjectDispatch();
  const { pose, customPose } = props;

  // Ref information
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = usePoseDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = usePoseDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  const CopyButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-full font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        cancelEvent(e);
        dispatch(copyPose(customPose));
      }}
    >
      <BiCopy />
    </div>
  );

  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center px-1 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        dispatch(removePose(customPose.id));
        cancelEvent(e);
      }}
    >
      <BsTrash />
    </div>
  );

  return (
    <EditorListItem
      className={`${isDragging ? "opacity-50" : "opacity-100"} ${
        customPose.id === pose?.id
          ? "text-pink-400 border-l border-l-pink-400"
          : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
      }`}
      onClick={() => dispatch(setSelectedPose({ data: customPose.id }))}
    >
      <div className="relative flex items-center h-9" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`border border-white/50 bg-transparent rounded-l h-full p-1 cursor-pointer outline-none overflow-ellipsis whitespace-nowrap ${
            customPose.id === pose?.id
              ? "pointer-events-all focus:bg-zinc-800/30"
              : "pointer-events-none"
          }`}
          value={customPose?.name ?? ""}
          onChange={(e) =>
            dispatch(updatePose({ ...customPose, name: e.target.value }))
          }
        />
        <CopyButton />
        <DeleteButton />
      </div>
    </EditorListItem>
  );
};
