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
import {
  PoseClipComponentProps,
  PoseClipRendererProps,
} from "./usePoseClipRenderer";
import { useCallback } from "react";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import {
  selectIsClipLive,
  selectIsClipSelected,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { PortaledPoseClip } from "types/Clip/ClipTypes";
import { selectClipVectorJSX } from "types/Arrangement/ArrangementClipSelectors";

interface PoseClipHeaderProps
  extends PoseClipComponentProps,
    PoseClipRendererProps {
  clip: PortaledPoseClip;
}

export const PoseClipHeader = (props: PoseClipHeaderProps) => {
  const dispatch = useProjectDispatch();
  const { id, clip, block } = props;
  const { index, depths, setIndex, setDepths } = props;
  const isSelected = use((_) => selectIsClipSelected(_, id));
  const isLive = use((_) => selectIsClipLive(_, id));
  const isDropdownOpen = !!clip.isOpen;
  const selectedTrackId = use(selectSelectedTrackId);
  const isTrackSelected = selectedTrackId === clip.trackId;
  const name = use((_) => selectClipName(_, id));
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
          key={`pose-block-${id}-${i}`}
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
    [depths, block, index, label, streamLength]
  );

  // Each pose has a click handler that depends on its state
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      cancelEvent(e);

      // If the alt key is held, toggle the clip in the selection
      if (e.altKey) {
        dispatch(toggleClipIdInSelection(id));
        return;
      }

      // If the meta key is held, toggle the dropdown
      if (e.metaKey) {
        dispatch(toggleClipDropdown({ data: { id } }));
        return;
      }

      // If the clip is selected, select the track or close/deselect the clip
      if (isSelected) {
        if (isDropdownOpen && !isTrackSelected)
          dispatch(setSelectedTrackId(clip.trackId));
        else dispatch(toggleClipDropdown({ data: { id } }));
        if (isTrackSelected && isDropdownOpen) {
          dispatch(removeClipIdsFromSelection({ data: [id] }));
        }
        return;
      }
      dispatch(
        onClipClick(e, { ...clip, id }, { eyedropping: props.holdingI })
      );
    },
    [clip, isSelected, isTrackSelected, isDropdownOpen, props.holdingI]
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
        className="h-4 w-4 data-[open=true]:w-6 hover:opacity-85 mx-1 flex shrink-0 total-center"
        onClick={(e) => {
          cancelEvent(e);
          if (!e.altKey) {
            dispatch(toggleClipDropdown({ data: { id } }));
            if (!isSelected && !clip.isOpen)
              dispatch(toggleClipIdInSelection(id));
          } else {
            dispatch(toggleClipIdInSelection(id));
          }
        }}
      >
        <Icon className="pointer-events-none select-none" />
      </div>
    );
  }, [isDropdownOpen, isLive, isSelected, clip]);

  // The name is visible on hover or when the dropdown is open
  const PoseName = useCallback(() => {
    if (!isDropdownOpen) return null;
    return (
      <div
        data-open={isDropdownOpen}
        className="px-2 data-[open=false]:opacity-75 data-[open=true]:px-3 data-[open=true]:bg-fuchsia-600 data-[open=true]:border-r"
      >
        {name}
      </div>
    );
  }, [isDropdownOpen, name, isSelected]);

  const jsx = use((_) => selectClipVectorJSX(_, id));

  // The stream allows for selecting different pose vectors
  const PoseStream = useCallback(() => {
    if (!isDropdownOpen) return null;
    return (
      <div className="flex gap-1 px-2 pointer-events-auto">
        {jsx}
        {stream.map(renderPoseBlock)}
      </div>
    );
  }, [stream, isDropdownOpen, renderPoseBlock]);

  return (
    <div
      className={classNames(
        "flex text-sm items-center whitespace-nowrap font-nunito",
        isSelected ? "text-white font-semibold" : "text-white/80 font-light",
        isDropdownOpen ? "w-min z-20" : "overflow-hidden"
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
