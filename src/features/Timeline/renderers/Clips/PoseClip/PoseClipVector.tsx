import classNames from "classnames";
import { Slider } from "components/Slider";
import { clamp, omit } from "lodash";
import { updatePose, updatePoseBlock } from "types/Pose/PoseSlice";
import { PoseVectorId, PoseBlock } from "types/Pose/PoseTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useEffect, useMemo, useState } from "react";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { ChromaticKey } from "assets/keys";
import { getTrackLabel, getTrackDepth } from "types/Track/TrackFunctions";
import {
  selectTrackMap,
  selectTrackMidiScaleMap,
  selectTrackChain,
  selectTrackDepthById,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { getScaleName } from "utils/scale";
import { PoseClip } from "types/Clip/ClipTypes";
import { PoseClipBaseEffect } from "./PoseClipStore";
import {
  PoseClipDropdownContainer,
  PoseClipDropdownItem,
} from "./PoseClipDropdown";
import { sanitize } from "utils/math";
import { CiUndo } from "react-icons/ci";
import { BsTrash } from "react-icons/bs";
import { blurOnEnter } from "utils/html";
import { PoseClipEffects } from "./PoseClipEffects";
import { PoseClipComponentProps } from "./usePoseClipRenderer";

export type PoseClipVectorView = "scales" | "notes" | "effects";

interface PoseClipVectorProps extends PoseClipComponentProps {
  block: PoseBlock | undefined;
  index: number;
  clip: PoseClip;
  isActive: boolean;
  depths: number[];
}

export const PoseClipVector = (props: PoseClipVectorProps) => {
  const dispatch = useProjectDispatch();

  const trackId = props.clip.trackId;
  const trackMap = useDeep(selectTrackMap);
  const trackScaleMap = useDeep(selectTrackMidiScaleMap);

  const clipLabel = use((_) => selectTrackLabelById(_, trackId));
  const clipDepth = use((_) => selectTrackDepthById(_, trackId));
  const clipTracks = useDeep((_) => selectTrackChain(_, trackId));

  const [view, setView] = useState<PoseClipVectorView>("scales");

  // Create editable fields for each vector component
  const fields = useMemo(() => {
    // If the L key is held, show voice leadings for each pitch class
    if (view === "notes") {
      return ChromaticKey.map((key) => ({
        fieldId: key,
        name: "Pitch Class",
        scaleName: key,
      }));
    }

    // Otherwise, return the default fields for transposition
    const defaultName = `Track ${clipLabel}`;
    return [
      ...clipTracks.map((track) => ({
        fieldId: track.id,
        name: `Track ${getTrackLabel(track.id, trackMap)}`,
        scaleName: getScaleName(trackScaleMap[track.id]),
        depth: getTrackDepth(track.id, trackMap),
      })),
      { fieldId: "chordal", scaleName: "Intrinsic Scale", name: defaultName },
      { fieldId: "chromatic", scaleName: "Chromatic Scale", name: defaultName },
      { fieldId: "octave", scaleName: "Adjust Octave", name: defaultName },
    ].filter((f) => !(("depth" in f ? f.depth || 0 : 0) >= clipDepth));
  }, [view, clipTracks, trackMap, trackScaleMap, clipLabel]);

  return (
    <div className="flex gap-2">
      <PoseClipBaseEffect border="border-fuchsia-400">
        <PoseClipDropdownContainer>
          <PoseClipDropdownItem
            active={view === "scales"}
            onClick={() => setView("scales")}
          >
            Transpositions
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            active={view === "notes"}
            onClick={() => setView("notes")}
          >
            Voice Leadings
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            active={view === "effects"}
            onClick={() => setView("effects")}
          >
            MIDI Effects
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            className="active:opacity-75"
            onClick={() =>
              props.block
                ? dispatch(
                    updatePoseBlock({
                      id: props.clip.poseId,
                      index: props.index,
                      depths: props.depths,
                      block: omit(props.block, "vector", "operations"),
                    })
                  )
                : dispatch(updatePose({ id: props.clip.poseId, vector: {} }))
            }
          >
            Clear Vector
          </PoseClipDropdownItem>
        </PoseClipDropdownContainer>
      </PoseClipBaseEffect>
      <div
        className={classNames(
          view === "notes" ? "h-full min-w-[896px] flex-col flex-wrap" : "",
          "max-w-4xl w-full overflow-scroll flex pr-2 gap-1"
        )}
      >
        {view === "effects" ? (
          <PoseClipEffects {...props} />
        ) : (
          fields.map((field) => (
            <PoseClipVectorField
              {...props}
              {...field}
              key={`${field.fieldId}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

// The field for each vector component in the dropdown
interface PoseClipVectorFieldProps extends PoseClipVectorProps {
  fieldId: string;
  name?: string;
  scaleName: string;
  depth?: number;
}

export const PoseClipVectorField = (props: PoseClipVectorFieldProps) => {
  const { vector, block, index, isActive } = props;
  const { clip, fieldId, name, scaleName, depth, depths } = props;
  const dispatch = useProjectDispatch();
  const offset = useMemo(() => {
    if (block) {
      return block.vector?.[fieldId as PoseVectorId];
    } else {
      return vector?.[fieldId as PoseVectorId];
    }
  }, [block, vector, fieldId]);
  const [displayedValue, setDisplayedValue] = useState(String(offset));
  useEffect(() => {
    if (displayedValue === "" && offset === 0) return;
    setDisplayedValue(String(offset));
  }, [offset]);

  // Create a vector for the block if none exists
  useEffect(() => {
    if (block && !("vector" in block)) {
      dispatch(
        updatePoseBlock({
          id: clip.poseId,
          index,
          block: { ...block, vector: {} },
          depths,
        })
      );
    }
  }, [block, index, clip, depths]);

  // Get the specific hotkey for the vector field
  const key = useMemo(() => {
    if (depth === 1) return "q";
    if (depth === 2) return "w";
    if (depth === 3) return "e";
    if (fieldId === "chordal") return "r";
    if (fieldId === "chromatic") return "t";
    if (fieldId === "octave") return "y";
    return "";
  }, [depth, fieldId]);

  const holdingKey = useHeldHotkeys(key)[key];

  // Omit the value from the vector on double click
  const onDoubleClick = () => {
    const newVector = omit(block?.vector ?? vector, fieldId);
    const newBlock = { ...block, vector: newVector };
    if (block) {
      dispatch(
        updatePoseBlock({ id: clip.poseId, index, depths, block: newBlock })
      );
    } else {
      dispatch(updatePose({ id: clip.poseId, vector: newVector }));
    }
  };

  // Update the value in the vector on value change
  const onValueChange = (_value: number) => {
    const value = sanitize(_value);
    const newVector = { ...(block?.vector ?? vector), [fieldId]: value };
    if (block) {
      const newBlock = { ...block, newVector };
      dispatch(
        updatePoseBlock({ id: clip.poseId, index, depths, block: newBlock })
      );
    } else {
      dispatch(updatePose({ id: clip.poseId, vector: newVector }));
    }
  };

  const isPitchClass = name === "Pitch Class";

  // Render the vector field
  return (
    <PoseClipBaseEffect
      className={`total-center ${isPitchClass ? "py-0" : ""}`}
    >
      {!isPitchClass && (
        <div
          className={classNames(
            "px-1",
            isScaleTrackId(fieldId) ? "text-sky-300" : "text-emerald-300"
          )}
        >
          {name}:{" "}
          <span className="text-slate-300 font-bold whitespace-nowrap">
            {scaleName}
          </span>
        </div>
      )}
      {isActive && (
        <div
          className={classNames(
            "text-fuchsia-300 text-[11px]",
            holdingKey ? "font-bold" : "font-light"
          )}
        >
          {depth === 1
            ? "Hold Q + Press Number"
            : depth === 2
            ? "Hold W + Press Number"
            : depth === 3
            ? "Hold E + Press Number"
            : fieldId === "chordal"
            ? "Hold R + Press Number"
            : fieldId === "chromatic"
            ? "Hold T + Press Number"
            : fieldId === "octave"
            ? "Hold Y + Press Number"
            : ""}
        </div>
      )}
      {!isPitchClass && (
        <Slider
          hideValue
          horizontal
          className="h-7 pt-2"
          width={"w-full"}
          disabled={clip.poseId.startsWith("preset")}
          value={offset ?? 0}
          min={-12}
          max={12}
          step={1}
          defaultValue={0}
          onDoubleClick={onDoubleClick}
          onValueChange={onValueChange}
        />
      )}
      <div
        className={classNames(
          isPitchClass
            ? "py-1 total-center"
            : "-mt-1.5 mb-1 px-2 items-center flex",
          "size-full gap-2"
        )}
      >
        {isPitchClass ? `${fieldId} Notes` : "Steps"}:{" "}
        <div className="flex border border-slate-500 rounded overflow-hidden">
          <input
            className="w-12 h-5 p-0 text-center bg-transparent border-0 rounded-l text-slate-200 focus:bg-white/5"
            type="number"
            value={displayedValue}
            min={-24}
            max={24}
            onChange={(e) => {
              setDisplayedValue(e.target.value);
              if (e.target.value === "") return onValueChange(0);
              if (isNaN(parseInt(e.target.value))) return;
              onValueChange(clamp(sanitize(e.target.valueAsNumber), -12, 12));
            }}
            placeholder="0"
            onKeyDown={(e) => {
              if (e.key === "Backspace" && offset === 0) onDoubleClick();
              blurOnEnter(e);
            }}
          />
          <button
            className="p-1 bg-slate-50/10 border-x border-slate-500"
            onClick={() => onValueChange(0)}
          >
            <CiUndo />
          </button>
          <button className="p-1 bg-slate-300/10" onClick={onDoubleClick}>
            <BsTrash />
          </button>
        </div>
      </div>
    </PoseClipBaseEffect>
  );
};
