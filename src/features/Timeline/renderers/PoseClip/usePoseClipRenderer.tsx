import { memo, useCallback, useState } from "react";

import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { PortaledPoseClipId, PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";

import {
  PoseBlock,
  PoseTransformation,
  PoseVector,
} from "types/Pose/PoseTypes";
import { selectPortaledPoseClip } from "types/Arrangement/ArrangementClipSelectors";
import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectIsAddingClips,
  selectIsAddingPatternClips,
  selectIsAddingPortals,
  selectIsAddingPoseClips,
  selectIsClipSelected,
  selectIsClipSelectedLast,
  selectTimelineState,
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { ScaleNote } from "types/Scale/ScaleTypes";
import { dispatchCustomEvent } from "utils/event";
import { useEvent } from "hooks/useEvent";
import {
  clipClassName,
  ClipComponentProps,
} from "features/Timeline/TimelineClips";
import { useDrag } from "react-dnd";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { replaceClipIdsInSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { useHeldKeys } from "hooks/useHeldkeys";
import classNames from "classnames";
import { POSE_NOTCH_HEIGHT } from "utils/constants";

export interface PoseClipRendererProps extends ClipComponentProps {
  id: PoseClipId;
  pcId: PortaledPoseClipId;
}

export type PoseClipView = "vector" | "stream";

export const PoseClipRenderer = memo((props: PoseClipRendererProps) => {
  const { id, pcId, isDragging } = props;

  const clip = useAppValue((_) => selectPortaledPoseClip(_, pcId));
  const { trackId, tick } = clip;
  const [isOpen, setIsOpen] = useState(false);
  const handleDropdown = useCallback(
    (e: CustomEvent<any>) => {
      if (e.detail.id === undefined || e.detail.id === id) {
        setIsOpen(e.detail.value === undefined ? !isOpen : e.detail.value);
      } else if (isOpen && e.detail.id.slice(0, 2) === id.slice(0, 2)) {
        setIsOpen(false);
      }
    },
    [isOpen, id]
  );
  useEvent("clipDropdown", handleDropdown);
  const isSelected = useAppValue((_) => selectIsClipSelected(_, id));

  const pose = useAppValue((_) => selectPoseById(_, clip.poseId));
  const stream = pose?.stream ?? [];
  const dispatch = useAppDispatch();
  const state = useAppValue(selectTimelineState);
  const isActive = state !== "idle";
  const isAdding = useAppValue(selectIsAddingClips);
  const isPortaling = useAppValue(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;

  // Each pose has a dropdown to reveal its editor
  const [field, setField] = useState<PoseClipView>("vector");

  // Each pose can be dragged into another cell
  const [_, drag] = useDrag({
    type: "clip",
    item: () => {
      dispatchCustomEvent(`dragClip`, true);
      return { id: pcId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      dispatchCustomEvent(`dragClip`, false);
      dispatch(onMediaDragEnd(item, monitor));
    },
  });

  // Any block can be selected by index, with depths for nested streams
  const vector = pose?.vector;
  const scale = pose?.scale;
  const reset = pose?.reset;
  const operations = pose?.operations;
  const block = pose?.stream ? stream[0] : undefined;

  const clipProps = {
    vector,
    scale,
    reset,
    operations,
    block,
    field,
    setField,
  };

  // Each pose has a style that depends on its state
  const top = useAppValue((_) => selectTrackTop(_, trackId));
  const left = useAppValue((_) => selectTimelineTickLeft(_, tick));
  const width = useAppValue((_) => selectClipWidth(_, pcId));
  const height = useAppValue((_) => selectTrackHeight(_, trackId));

  const heldKeys = useHeldKeys(["alt", "control", "shift", "meta"]);
  const holdingAlt = heldKeys["AltLeft"];
  const holdingCtrl = heldKeys["ControlLeft"];
  const holdingShift = heldKeys["ShiftLeft"];
  const holdingMeta = heldKeys["MetaLeft"];
  const menuLeft = (left ?? 0) + (width ?? 0) + 4;
  const isLast = useAppValue((_) => selectIsClipSelectedLast(_, id));
  const isMenuOpen =
    isLast && !isBlurred && !isOpen && !holdingAlt && !holdingShift;
  if (!clip) return null;
  return (
    <>
      <div
        ref={drag}
        data-type="pose"
        data-open={isOpen}
        data-selected={isSelected}
        data-blur={isBlurred}
        data-alt={!!holdingAlt}
        data-ctrl={!!holdingCtrl}
        data-shift={!!holdingShift}
        data-meta={!!holdingMeta}
        className={clipClassName}
        style={{
          top,
          left,
          width,
          height,
          borderColor:
            !!pose?.reset && !isSelected ? "rgba(10,10,10,0.5)" : undefined,
        }}
        onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
        onContextMenu={() => {
          dispatch(replaceClipIdsInSelection({ data: [id] }));
        }}
        onDragStart={() =>
          dispatchCustomEvent("clipDropdown", { id: pcId, value: false })
        }
      >
        <PoseClipHeader id={id} isOpen={!!isOpen} />
        {isOpen && !isActive && (
          <PoseClipDropdown {...props} {...clipProps} clip={clip} />
        )}
      </div>
      {isMenuOpen && (
        <div
          style={{ left: menuLeft, top: top + POSE_NOTCH_HEIGHT }}
          className="absolute select-none flex z-[31] text-xs flex-col gap-0.5 *:border-b font-light animate-in fade-in whitespace-nowrap w-48 p-[3px] px-1 rounded bg-slate-900/90 backdrop-blur text-emerald-300/80"
        >
          <div className="text-fuchsia-300/80">Cmd + Click to Edit Pose</div>
          <div className="text-cyan-300/80">Ctrl + Click to Edit Clips</div>
          <div className="text-indigo-300/90">
            Option + Click to Select Clips
          </div>
          <div className="text-violet-300/90">
            Shift + Click to Select Range
          </div>
          <div className="text-slate-200/90">Escape to Close Menus</div>
        </div>
      )}
    </>
  );
});

export interface PoseClipComponentProps extends PoseClipRendererProps {
  vector?: PoseVector;
  scale?: ScaleNote[];
  reset?: boolean;
  operations?: PoseTransformation[];
  block?: PoseBlock;
  field: PoseClipView;
  setField: (field: PoseClipView) => void;
}
