import classNames from "classnames";
import { Slider } from "components/Slider";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { omit } from "lodash";
import { ChromaticKey } from "assets/keys";
import { useCallback, useMemo } from "react";
import { PoseClip } from "types/Clip/ClipTypes";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { updatePose } from "types/Pose/PoseSlice";
import {
  isPoseVectorModule,
  Pose,
  PoseBlock,
  PoseVector,
  PoseVectorId,
} from "types/Pose/PoseTypes";
import {
  selectCellHeight,
  selectIsLive,
} from "types/Timeline/TimelineSelectors";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getTrackDepth, getTrackLabel } from "types/Track/TrackFunctions";
import {
  selectScaleTracks,
  selectTrackDepthById,
  selectTrackMap,
  selectTrackMidiScaleMap,
} from "types/Track/TrackSelectors";
import { POSE_HEIGHT } from "utils/constants";
import { cancelEvent } from "utils/html";
import { getScaleName } from "utils/key";

interface PoseClipDropdownProps {
  clip: PoseClip;
  pose?: Pose;
  index: number;
  isOpen: boolean;
}

export const PoseClipDropdown = (props: PoseClipDropdownProps) => {
  const { clip, pose, index, isOpen } = props;
  const clipDepth = use((_) => selectTrackDepthById(_, clip.trackId));
  const dispatch = useProjectDispatch();
  const trackMap = useDeep(selectTrackMap);
  const trackScaleMap = useDeep(selectTrackMidiScaleMap);
  const scaleTracks = useDeep(selectScaleTracks);
  const clipLabel = `Track ${getTrackLabel(clip.trackId, trackMap)}`;
  const cellHeight = use(selectCellHeight);
  const isLive = use(selectIsLive);
  const heldKeys = useHeldHotkeys(["v", "q", "w", "e", "r", "t", "y"]);

  // Get the current vector selected from the stream
  const selectedVector = isPoseVectorModule(pose?.stream[index])
    ? pose?.stream[index].vector
    : {};

  // Render the vector field
  const renderVectorField = useCallback(
    (props: VectorField) => {
      const { id, name, scaleName, depth } = props;
      const offset = selectedVector[id as PoseVectorId] ?? 0;
      if (!pose) return null;

      // Omit the value from the vector on double click
      const onDoubleClick = () => {
        const vector: PoseVector = omit(selectedVector, id);
        const block: PoseBlock = { ...(pose.stream[index] ?? []), vector };
        const stream = pose.stream.map((_, i) => (index === i ? block : _));
        dispatch(updatePose({ id: pose.id, stream }));
      };

      // Update the value in the vector on value change
      const onValueChange = (value: number) => {
        const vector: PoseVector = { ...selectedVector, [id]: value };
        const block: PoseBlock = { ...(pose.stream[index] ?? []), vector };
        const stream = pose.stream.map((_, i) => (index === i ? block : _));
        dispatch(updatePose({ id: pose.id, stream }));
      };
      const holdingKey =
        (depth === 1 && heldKeys.q) ||
        (depth === 2 && heldKeys.w) ||
        (depth === 3 && heldKeys.e) ||
        (id === "chordal" && heldKeys.r) ||
        (id === "chromatic" && heldKeys.t) ||
        (id === "octave" && heldKeys.y);

      // Render the vector field
      return (
        <div
          key={id}
          className={classNames(
            depth && depth >= clipDepth ? "opacity-50" : "",
            "flex flex-col total-center p-1 min-w-28 max-h-20 overflow-scroll whitespace-nowrap border border-slate-500 text-slate-200 text-center text-xs rounded"
          )}
        >
          <div
            className={classNames(
              "px-1",
              isScaleTrackId(id) ? "text-sky-300" : "text-emerald-300"
            )}
          >
            {name}:{" "}
            <span className="text-slate-300 font-bold whitespace-nowrap">
              {scaleName}
            </span>
          </div>
          {isLive && (
            <div
              className={classNames(
                "text-fuchsia-300",
                holdingKey ? "font-bold" : "font-light"
              )}
            >
              {depth === 1
                ? "Hold Q + Press Key"
                : depth === 2
                ? "Hold W + Press Key"
                : depth === 3
                ? "Hold E + Press Key"
                : id === "chordal"
                ? "Hold R + Press Key"
                : id === "chromatic"
                ? "Hold T + Press Key"
                : id === "octave"
                ? "Hold Y + Press Key"
                : ""}
            </div>
          )}
          <Slider
            hideValue
            horizontal
            className="h-7 pt-4"
            width={"w-full"}
            disabled={pose.id.startsWith("preset")}
            value={offset}
            min={-24}
            max={24}
            step={1}
            defaultValue={0}
            onDoubleClick={onDoubleClick}
            onValueChange={onValueChange}
          />
          <div className="text-slate-200">
            {id in selectedVector ? `Value = ${offset}` : `Value Not Set`}
          </div>
        </div>
      );
    },
    [selectedVector, isLive, pose, index, heldKeys, clipDepth]
  );

  // Create editable fields for each vector component
  const fields = useMemo(() => {
    // If the V key is held, show voice leadings for each pitch class
    if (heldKeys.v) {
      return ChromaticKey.map((key) => ({
        id: key,
        name: "Pitch Class",
        scaleName: key,
      }));
    }

    // Otherwise, return the default fields for transposition
    return [
      ...scaleTracks.map((track) => ({
        id: track.id,
        name: `Track ${getTrackLabel(track.id, trackMap)}`,
        scaleName: getScaleName(trackScaleMap[track.id]),
        depth: getTrackDepth(track.id, trackMap),
      })),
      { id: "chordal", scaleName: "Intrinsic Scale", name: clipLabel },
      { id: "chromatic", scaleName: "Chromatic Scale", name: clipLabel },
      { id: "octave", scaleName: "Adjust Octave", name: clipLabel },
    ];
  }, [heldKeys.v, scaleTracks, trackMap, trackScaleMap, clipLabel]);

  if (!pose || !isOpen) return null;
  return (
    <div
      style={{ top: POSE_HEIGHT, height: cellHeight - POSE_HEIGHT + 1 }}
      className={`z-20 animate-in fade-in ease-in p-1 rounded flex flex-col bg-slate-800 border-4 border-fuchsia-500 cursor-auto`}
      onClick={cancelEvent}
      draggable
      onDragStart={cancelEvent}
    >
      <div className="flex size-full gap-2">
        {fields.map(renderVectorField)}
      </div>
    </div>
  );
};

// The field for each vector component in the dropdown
interface VectorField {
  id: string;
  name?: string;
  scaleName: string;
  depth?: number;
}
