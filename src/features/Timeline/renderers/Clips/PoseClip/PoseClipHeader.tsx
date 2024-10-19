import classNames from "classnames";
import { BsMagic } from "react-icons/bs";
import { GiClothespin, GiDramaMasks, GiHand } from "react-icons/gi";
import { isPoseStreamModule, PoseBlock } from "types/Pose/PoseTypes";
import { POSE_HEIGHT } from "utils/constants";
import { cancelEvent } from "utils/html";
import { selectClipName } from "types/Clip/ClipSelectors";
import { use, useProjectDispatch } from "types/hooks";
import {
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { numberToLower } from "utils/math";
import { PoseClipComponentProps } from "./usePoseClipRenderer";
import { useCallback } from "react";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { toggleClipDropdown } from "types/Clip/ClipThunks";

export const PoseClipHeader = (props: PoseClipComponentProps) => {
  const dispatch = useProjectDispatch();
  const { clip, block, portaledClip } = props;
  const { selectedTrackId, isSelected, isLive } = props;
  const { index, depths, setIndex, setDepths } = props;
  const pcId = portaledClip.id;
  const isDropdownOpen = !!clip.isOpen;
  const isTrackSelected = selectedTrackId === clip.trackId;
  const name = use((_) => selectClipName(_, clip.id));
  const pose = use((_) => selectPoseById(_, clip.poseId));
  const stream = pose?.stream ?? [];
  const streamLength = stream.length ?? 0;

  // Each block is labeled to show its index and depth
  const label = useCallback(
    (i: number) => {
      if (!depths.length || depths[0] !== i) return `${i + 1}`;
      const root = depths[0] + 1;
      const letters = depths.slice(1).map(numberToLower).join("");
      const topLetter = block ? numberToLower(index) : "";
      return `${root}${letters}${topLetter}`;
    },
    [depths, index, block]
  );

  // Render JSX for each pose vector in the stream
  const renderPoseBlock = useCallback(
    (block: PoseBlock, i: number) => {
      if (!block) return null;
      const onBlock = i === (depths.length ? depths[0] : index);
      const showLabel = streamLength > 1 || !!depths.length;
      const type = isPoseStreamModule(block) ? "Stream" : "Vector";
      return (
        <span
          data-onblock={onBlock}
          data-notlast={i < streamLength - 1}
          key={`pose-block-${clip.id}-${i}`}
          className="px-3 pointer-events-auto data-[onblock=true]:bg-fuchsia-600 bg-fuchsia-600/20 data-[notlast=true]:border-r"
          onClick={(e) => {
            cancelEvent(e);
            setIndex(i);
            setDepths([]);
          }}
        >
          {showLabel && `(${label(i)}) `}
          {type}
        </span>
      );
    },
    [clip, depths, index, label, streamLength]
  );

  // Each pose has a click handler that depends on its state
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      cancelEvent(e);

      // If the alt key is held, toggle the clip in the selection
      if (e.altKey) {
        dispatch(toggleClipIdInSelection(clip.id));
        return;
      }

      // If the meta key is held, toggle the dropdown
      if (e.metaKey) {
        dispatch(toggleClipDropdown({ data: { id: clip.id } }));
        return;
      }

      // If the clip is selected, select the track or close/deselect the clip
      if (isSelected) {
        if (!isTrackSelected) dispatch(setSelectedTrackId(clip.trackId));
        else dispatch(toggleClipDropdown({ data: { id: clip.id } }));
        if (isTrackSelected && isDropdownOpen) {
          dispatch(removeClipIdsFromSelection({ data: [clip.id] }));
        }
        return;
      }
      dispatch(onClipClick(e, clip));
    },
    [clip, isSelected, isDropdownOpen, pcId]
  );

  // The icon changes based on if the pose is open or live
  const PoseIcon = useCallback(() => {
    const Icon =
      isLive && isDropdownOpen
        ? GiClothespin
        : isLive
        ? GiHand
        : isDropdownOpen
        ? GiDramaMasks
        : BsMagic;
    return (
      <div
        data-open={isDropdownOpen}
        className="pointer-events-auto h-4 w-4 data-[open=true]:w-6 hover:opacity-75 mx-1 flex shrink-0 total-center"
      >
        <Icon className="pointer-events-none" />
      </div>
    );
  }, [isDropdownOpen, isLive]);

  // The name is visible on hover or when the dropdown is open
  const PoseName = useCallback(() => {
    return (
      <div
        data-open={isDropdownOpen}
        className="px-2 data-[open=false]:opacity-75 data-[open=true]:px-3 data-[open=true]:bg-fuchsia-600 data-[open=true]:border-r"
      >
        {name}
      </div>
    );
  }, [isDropdownOpen, name]);

  // The stream allows for selecting different pose vectors
  const PoseStream = useCallback(() => {
    if (!isDropdownOpen) return null;
    return (
      <div className="flex gap-1 pointer-events-auto">
        {stream.map(renderPoseBlock)}
      </div>
    );
  }, [stream, isDropdownOpen, renderPoseBlock]);

  return (
    <div
      className={classNames(
        "flex text-sm items-center whitespace-nowrap pointer-events-none font-nunito",
        isSelected ? "text-white font-semibold" : "text-white/80 font-light",
        isDropdownOpen ? "w-min z-20" : "overflow-hidden hover:overflow-visible"
      )}
      style={{ height: POSE_HEIGHT }}
      draggable
      onClick={onClick}
    >
      <PoseIcon />
      <PoseName />
      <PoseStream />
    </div>
  );
};
