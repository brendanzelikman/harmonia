import { useEffect, useMemo, useState } from "react";
import {
  selectMediaDragState,
  selectClipName,
  selectPoseClipPose,
  selectScaleTrackMap,
} from "redux/selectors";
import { blurOnEnter, cancelEvent } from "utils/html";
import { usePoseClipDrag } from "./usePoseClipDrag";
import {
  onPoseClipClick,
  onPoseClipDoubleClick,
  selectClipWidth,
  selectTimelineObjectHeight,
  selectTimelineTickLeft,
  selectTrackedObjectTop,
  updateMediaDragState,
} from "redux/Timeline";
import { useProjectDispatch, useProjectSelector as use } from "redux/hooks";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { POSE_HEIGHT } from "utils/constants";
import classNames from "classnames";
import { onMediaDragEnd } from "redux/Media";
import { PoseClip, PoseClipId } from "types/Clip";
import { ClipRendererProps } from "./TimelineClips";
import {
  getPoseBucketVector,
  getPoseVectorAsJSX,
  isPoseBucket,
} from "types/Pose";
import { getTrackLabel } from "types/Track";
import { updatePose } from "redux/Pose";
import { isFiniteNumber } from "types/util";
import { trimStart } from "lodash";

interface PoseClipRendererProps extends ClipRendererProps {
  clip: PoseClip;
}

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const {
    clip,
    portaledClip,
    isSelected,
    isAddingPatterns,
    isAddingPoses,
    isSlicingClips,
    isPortalingClips,
    heldKeys,
    cell,
  } = props;
  const { tick } = clip;
  const dispatch = useProjectDispatch();
  const trackMap = use(selectScaleTrackMap);

  // Close the dropdown when the clip is unselected
  useEffect(() => {
    if (!isSelected) setIsDropdownOpen(false);
  }, [isSelected]);

  /** Each pose has a dropdown for editing offsets. */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  /** Update the timeline when dragging poses. */
  const onDragStart = () => {
    dispatch(updateMediaDragState({ draggingPoseClip: true }));
  };

  /** Update the timeline when releasing poses and call the thunk. */
  const onDragEnd = (item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingPoseClip: false }));
    dispatch(onMediaDragEnd(item, monitor));
  };

  /** A custom hook for dragging poses into cells */
  const [{ isDragging }, drag] = usePoseClipDrag({
    clip: { ...clip, id: portaledClip.id as PoseClipId },
    onDragStart,
    onDragEnd,
  });
  const dragState = use(selectMediaDragState);
  const { draggingPatternClip, draggingPortal } = dragState;

  // Timeline info
  const isActive = isPortalingClips || isDragging || isAddingPatterns;
  const isDraggingOther = draggingPatternClip || draggingPortal;
  const isEyedropping = heldKeys.i;

  // Pose dimensions
  const top = use((_) => selectTrackedObjectTop(_, clip));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectClipWidth(_, portaledClip));
  const height = use((_) => selectTimelineObjectHeight(_, clip));

  /** The pose header contains a clip name and vector if it is a bucket. */
  const pose = use((_) => selectPoseClipPose(_, clip.id));
  const name = use((_) => selectClipName(_, clip?.id));
  const isBucket = isPoseBucket(pose);
  const isInfinite = !isFiniteNumber(clip.duration);
  const bucketVector = getPoseBucketVector(pose);

  const PoseHeader = useMemo(() => {
    const vectorJSX = getPoseVectorAsJSX(bucketVector, trackMap, "mx-0.5");

    // The icon is a star wand when selected, magic wand otherwise
    const IconType = isSelected ? SlMagicWand : BsMagic;

    // The label is more visible when selected
    const wrapperClass = classNames(
      "flex text-sm relative items-center whitespace-nowrap pointer-events-none font-nunito",
      "gap-2 animate-in fade-in duration-75",
      isSelected ? "text-white font-semibold" : "text-white/80 font-light"
    );

    // The pose height refers to the notch above the clip
    const height = POSE_HEIGHT;

    return (
      <div className={wrapperClass} style={{ height }} draggable>
        <IconType
          className="flex flex-shrink-0 text-md ml-1 w-4 h-4 pointer-events-auto"
          onClick={(e) => {
            toggleDropdown();
            if (isSelected) {
              cancelEvent(e);
            }
          }}
          onDoubleClick={cancelEvent}
        />
        {!isInfinite && !isDropdownOpen && (
          <>
            {name}
            {isBucket && <span className="ml-0.5">({vectorJSX})</span>}
          </>
        )}
      </div>
    );
  }, [
    isSelected,
    isInfinite,
    name,
    isBucket,
    bucketVector,
    isDropdownOpen,
    trackMap,
  ]);

  /** The pose body is filled in behind a clip. */
  const PoseBody = useMemo(() => {
    return (
      <div className={`w-full animate-in fade-in duration-75 flex-grow`} />
    );
  }, []);

  const PoseDropdown = () => {
    if (!pose || !isDropdownOpen) return null;
    const values = [
      { id: "chromatic", name: "Chromatic" },
      ...Object.values(trackMap).map((track) => ({
        id: track.id,
        name: `Scale Track ${getTrackLabel(track.id, trackMap)}`,
      })),
      { id: "chordal", name: "Chordal" },
    ];
    return (
      <div
        style={{ top: POSE_HEIGHT }}
        className={`animate-in fade-in duration-300 left-1 absolute flex p-2 px-4 flex-col bg-slate-800/95 ring-4 ring-pose-clip rounded z-50 cursor-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(isInfinite || isSelected) && (
          <div className="text-white font-bold border-b pb-2 mb-2">{name}</div>
        )}
        <div className="mt-2 space-y-2">
          {values.map(({ id, name }) => {
            const offset = bucketVector[id] ?? 0;
            return (
              <div key={id} className="flex items-center justify-between">
                <span className="mr-2 text-md text-white">{name}</span>
                <input
                  className="rounded text-white text-xs font-bold bg-indigo-300/50 border-slate-500 focus:border-slate-300/80 focus:ring-slate-300/80"
                  type="tel"
                  disabled={pose.id.startsWith("preset")}
                  value={offset}
                  onKeyDown={blurOnEnter}
                  onChange={(e) => {
                    let value = offset;

                    // Set to 0 if the value is empty or read the value
                    if (e.target.value === "") value = 0;
                    else value = parseInt(trimStart(e.target.value, "0"));

                    // Flip the sign if the value ends with a dash
                    if (e.target.value.endsWith("-"))
                      value = offset === 0 ? -1 : -offset;

                    dispatch(
                      updatePose({
                        id: pose.id,
                        stream: [
                          {
                            ...pose.stream[0],
                            vector: { ...bucketVector, [id]: value },
                          },
                        ],
                      })
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Assemble the classname
  const className = classNames(
    "group absolute flex flex-col",
    isInfinite ? "bg-fuchsia-400" : "bg-pose-clip",
    "border rounded",
    isSelected && isDropdownOpen ? "overflow-visible" : "overflow-hidden",
    isSelected ? "border-white " : "border-slate-400",
    { "cursor-scissors": isSlicingClips },
    { "cursor-wand": isAddingPoses },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": isEyedropping },
    { "cursor-pointer": !isEyedropping && !isAddingPoses },
    { "hover:animate-pulse hover:ring hover:ring-fuchsia-400": isAddingPoses },
    isActive || isDraggingOther
      ? "pointer-events-none"
      : isInfinite && isAddingPoses
      ? "pointer-events-none"
      : "pointer-events-all",
    isDragging ? "opacity-50" : isDraggingOther ? "opacity-80" : "opacity-100"
  );

  // Render the pose clip
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width: isInfinite ? cell.width : width, height }}
      onClick={(e) => dispatch(onPoseClipClick(e, clip, isEyedropping))}
      onDoubleClick={() => dispatch(onPoseClipDoubleClick(clip))}
    >
      {PoseDropdown()}
      {PoseHeader}
      {PoseBody}
    </div>
  );
}
