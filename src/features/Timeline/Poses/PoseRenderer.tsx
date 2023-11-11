import { useMemo } from "react";
import { getPoseVectorAsString, Pose, PoseId } from "types/Pose";
import {
  selectMediaDragState,
  selectTimeline,
  selectTrackParents,
  selectPoseWidth,
} from "redux/selectors";
import { cancelEvent } from "utils/html";
import { usePoseDrag } from "./usePoseDragAndDrop";
import {
  onPoseClick,
  selectTimelineObjectHeight,
  selectTimelineTickLeft,
  selectTrackedObjectTop,
  toggleAddingPoses,
  updateMediaDragState,
} from "redux/Timeline";
import {
  useProjectDeepSelector,
  useProjectDispatch,
  useProjectSelector as use,
} from "redux/hooks";
import { pick } from "lodash";
import {
  isTimelineAddingClips,
  isTimelineAddingPoses,
  isTimelinePortalingMedia,
  isTimelineSlicingMedia,
} from "types/Timeline";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { POSE_HEIGHT } from "utils/constants";
import { EasyTransition } from "components/Transition";
import classNames from "classnames";
import { onMediaDragEnd } from "redux/Media";

interface PoseRendererProps {
  pose: Pose;
  chunkId: PoseId;
  isSelected: boolean;
}

export function PoseRenderer(props: PoseRendererProps) {
  const { pose, chunkId, isSelected } = props;
  const { tick, trackId, vector } = pose;
  const vectorString = getPoseVectorAsString(vector);
  const dispatch = useProjectDispatch();
  const parents = useProjectDeepSelector((_) => selectTrackParents(_, trackId));

  /** Update the timeline when dragging poses. */
  const onDragStart = () => {
    dispatch(updateMediaDragState({ draggingPose: true }));
  };

  /** Update the timeline when releasing poses and call the thunk. */
  const onDragEnd = (item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingPose: false }));
    dispatch(onMediaDragEnd(item, monitor));
  };

  /** A custom hook for dragging poses into cells */
  const [{ isDragging }, drag] = usePoseDrag({
    pose: { ...pose, id: chunkId },
    onDragStart,
    onDragEnd,
  });
  const dragState = use(selectMediaDragState);
  const { draggingClip, draggingPortal } = dragState;

  // Timeline info
  const timeline = use(selectTimeline);
  const isAdding = isTimelineAddingClips(timeline);
  const isSlicing = isTimelineSlicingMedia(timeline);
  const isTransposing = isTimelineAddingPoses(timeline);
  const isPortaling = isTimelinePortalingMedia(timeline);
  const isActive = isPortaling || isDragging || isAdding;
  const isDraggingOther = draggingClip || draggingPortal;

  // Pose dimensions
  const top = use((_) => selectTrackedObjectTop(_, pose));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectPoseWidth(_, pose));
  const height = use((_) => selectTimelineObjectHeight(_, pose));
  const isSmall = width < vectorString.length * 8;

  /** The pose header sits above a clip and contains the pose label. */
  const PoseHeader = useMemo(() => {
    // The icon is a star wand when selected, magic wand otherwise
    const IconType = isSelected ? SlMagicWand : BsMagic;

    // The label is more visible when selected
    const wrapperClass = classNames(
      "flex relative items-center whitespace-nowrap pointer-events-none fade-in-100 font-nunito",
      isSelected ? "text-white font-semibold" : "text-white/80 font-light"
    );

    // The vector is formatted to only include the track's parents
    const filteredVector = pick(vector, [
      "chromatic",
      "chordal",
      ...parents.map((track) => track.id),
    ]);
    const vectorString = getPoseVectorAsString(filteredVector);

    // The pose height refers to the notch above the clip
    const height = POSE_HEIGHT;

    return (
      <div
        className={wrapperClass}
        style={{ height }}
        draggable
        onDragStart={cancelEvent}
      >
        <IconType className="text-md ml-1 h-4" />
        <EasyTransition
          show={isSelected && isSmall}
          scale={50}
          className="absolute flex -top-8 z-20 px-2 bg-fuchsia-600 border border-slate-200/50 flex-col rounded"
        >
          {vectorString}
        </EasyTransition>
        {!isSmall && (
          <div className="ml-2 flex space-x-1 overflow-hidden">
            {vectorString}
          </div>
        )}
      </div>
    );
  }, [isSelected, vector, parents, isSmall]);

  /** The pose body is filled in behind a clip. */
  const PoseBody = useMemo(() => {
    return <div className={`w-full fade-in-100 flex-grow`} />;
  }, []);

  // Assemble the classname
  const className = classNames(
    "group absolute flex flex-col",
    "bg-pose border rounded",
    isSelected ? "overflow-visible" : "overflow-hidden",
    isSelected ? "border-white " : "border-slate-400",
    { "cursor-scissors": isSlicing },
    { "cursor-wand": isTransposing },
    { "cursor-pointer": !isSlicing && !isTransposing },
    { "hover:animate-pulse hover:ring hover:ring-fuchsia-400": isTransposing },
    isActive || isDraggingOther ? "pointer-events-none" : "pointer-events-all",
    isDragging ? "opacity-50" : isDraggingOther ? "opacity-80" : "opacity-100"
  );

  // Render the pose
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width, height }}
      onClick={(e) => dispatch(onPoseClick(e, pose))}
      onDoubleClick={() => dispatch(toggleAddingPoses())}
    >
      {PoseHeader}
      {PoseBody}
    </div>
  );
}
