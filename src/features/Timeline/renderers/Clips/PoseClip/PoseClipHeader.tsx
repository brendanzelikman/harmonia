import classNames from "classnames";
import { BsMagic } from "react-icons/bs";
import { GiDramaMasks, GiHand, GiOrbWand } from "react-icons/gi";
import { getPoseVectorAsJSX } from "types/Pose/PoseFunctions";
import { isPoseVectorModule, Pose, PoseBlock } from "types/Pose/PoseTypes";
import { POSE_HEIGHT } from "utils/constants";
import { cancelEvent, dispatchCustomEvent } from "utils/html";
import { useCallback } from "react";
import { selectClipName } from "types/Clip/ClipSelectors";
import { use, useProjectDispatch } from "types/hooks";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { PoseClip } from "types/Clip/ClipTypes";
import {
  selectIsLive,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { Portaled } from "types/Portal/PortalTypes";
import {
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { showEditor } from "types/Editor/EditorThunks";
import { setSelectedPose } from "types/Media/MediaThunks";
import { createUndoType } from "lib/redux";
import { LiveAudioInstance } from "types/Instrument/InstrumentClass";

interface PoseClipHeaderProps {
  clip: Timed<PoseClip>;
  portaledClip: Portaled<PoseClip>;
  pose?: Pose;
  isSelected: boolean;
  index: number;
  setIndex: (index: number) => void;
  isDropdownOpen: boolean;
}

export const PoseClipHeader = (props: PoseClipHeaderProps) => {
  const { clip, portaledClip, pose, isSelected, index, isDropdownOpen } = props;
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();
  const trackMap = use(selectTrackMap);
  const selectedTrack = use(selectSelectedTrackId);
  const isTrackSelected = selectedTrack === clip.trackId;
  const name = use((_) => selectClipName(_, clip?.id));
  const streamLength = pose?.stream.length ?? 0;
  const isLive = use(selectIsLive) && isSelected;

  // Render JSX for each pose vector in the stream
  const renderPoseBlock = useCallback(
    (block: PoseBlock, i: number) => {
      if (!isPoseVectorModule(block)) return null;
      return (
        <span
          key={`pose-block-${clip.id}-${i}`}
          className={classNames(
            index === i ? "bg-fuchsia-600" : "bg-fuchsia-400",
            i < streamLength - 1 ? "border-r" : "",
            "px-3 pointer-events-auto"
          )}
          onClick={(e) => {
            cancelEvent(e);
            props.setIndex(i);
          }}
        >
          {getPoseVectorAsJSX(block.vector, trackMap)}
        </span>
      );
    },
    [index, streamLength, trackMap]
  );

  const IconType = isLive ? GiHand : isDropdownOpen ? GiDramaMasks : BsMagic;

  const headerClass = classNames(
    "flex text-sm items-center whitespace-nowrap pointer-events-none font-nunito",
    isSelected ? "text-white font-semibold" : "text-white/80 font-light",
    isDropdownOpen ? "w-min z-20" : "overflow-hidden"
  );

  return (
    <div
      className={headerClass}
      style={{ height: POSE_HEIGHT }}
      draggable
      onClick={(e) => {
        cancelEvent(e);
        if (e.altKey) {
          dispatch(toggleClipIdInSelection(clip.id));
        } else if (e.metaKey) {
          dispatchCustomEvent(
            `${isDropdownOpen ? "close" : "open"}_dropdown_${pcId}`
          );
        } else if (isSelected) {
          if (!isTrackSelected) dispatch(setSelectedTrackId(clip.trackId));
          else {
            dispatchCustomEvent(
              `${isDropdownOpen ? "close" : "open"}_dropdown_${pcId}`
            );
          }
          if (isTrackSelected && isDropdownOpen) {
            dispatch(removeClipIdsFromSelection({ data: [clip.id] }));
          }
        } else {
          dispatch(onClipClick(e, clip));
        }
      }}
    >
      <IconType className="flex flex-shrink-0 mx-1 w-4 h-4 pointer-events-auto" />

      {isDropdownOpen ? (
        <>
          <span className="bg-fuchsia-500 px-3">{name}</span>
          <span
            className="pointer-events-auto bg-fuchsia-500 hover:bg-fuchsia-400/50 border-l border-l-slate-200/30 size-full flex items-center ml-1 p-2"
            onClick={(e) => {
              cancelEvent(e);
              if (!pose?.id) return;
              const undoType = createUndoType("editPose");
              dispatch(setSelectedPose({ data: pose?.id, undoType }));
              dispatch(showEditor({ data: { view: "pose" }, undoType }));
            }}
          >
            <GiOrbWand className="pointer-events-none" />
          </span>
          {(pose?.stream ?? []).map(renderPoseBlock)}
        </>
      ) : (
        name
      )}
    </div>
  );
};
