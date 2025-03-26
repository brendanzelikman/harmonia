import classNames from "classnames";
import { clamp, omit } from "lodash";
import { updatePose } from "types/Pose/PoseSlice";
import { PoseVectorId, PoseBlock, isVoiceLeading } from "types/Pose/PoseTypes";
import { useEffect, useMemo, useState } from "react";
import { useDeep, useProjectDispatch } from "types/hooks";
import { ChromaticKey } from "assets/keys";
import { getTrackLabel, getTrackDepth } from "types/Track/TrackFunctions";
import {
  selectTrackMap,
  selectTrackMidiScaleMap,
  selectScaleTrackChain,
  selectTrackDepthById,
  selectTrackLabelById,
  selectTrackMidiScale,
  selectTrackById,
} from "types/Track/TrackSelectors";
import { getScaleName } from "utils/scale";
import { PoseClip } from "types/Clip/ClipTypes";
import { PoseClipBaseEffect } from "./PoseClipStore";
import {
  PoseClipDropdownContainer,
  PoseClipDropdownItem,
} from "./PoseClipDropdown";
import { sanitize } from "utils/math";
import { BsTrash } from "react-icons/bs";
import { blurEvent, blurOnEnter, promptUserForString } from "utils/html";
import { PoseClipEffects } from "./PoseClipEffects";
import { PoseClipComponentProps } from "./usePoseClipRenderer";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { readMidiScaleFromString } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { promptLineBreak } from "components/PromptModal";
import { CHORDAL_KEY, CHROMATIC_KEY, OCTAVE_KEY } from "utils/vector";

export type PoseClipVectorView = "scales" | "notes" | "effects" | "scale";

interface PoseClipVectorProps extends PoseClipComponentProps {
  block: PoseBlock | undefined;
  clip: PoseClip;
}

export const PoseClipVector = (props: PoseClipVectorProps) => {
  const trackId = props.clip.trackId;
  const isPT = isPatternTrackId(trackId);
  const trackMap = useDeep(selectTrackMap);
  const trackScaleMap = useDeep(selectTrackMidiScaleMap);

  const clipLabel = useDeep((_) => selectTrackLabelById(_, trackId));
  const clipDepth = useDeep((_) => selectTrackDepthById(_, trackId));
  const clipTracks = useDeep((_) => selectScaleTrackChain(_, trackId));

  const [view, setView] = useState<PoseClipVectorView>(
    isVoiceLeading(props.vector) ? "notes" : "scales"
  );

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
    const defaultName = `${isPT ? "Sampler" : "Scale"} ${clipLabel}`;
    return [
      ...clipTracks.map((track) => ({
        fieldId: track.id,
        scaleName: `${getScaleName(trackScaleMap[track.id])} (${getTrackLabel(
          track.id,
          trackMap
        )})`,
        depth: getTrackDepth(track.id, trackMap),
      })),
      {
        fieldId: "chordal",
        scaleName: `Intrinsic Scale (${CHORDAL_KEY})`,
        name: defaultName,
      },
      {
        fieldId: "chromatic",
        scaleName: `Chromatic Scale (${CHROMATIC_KEY})`,
        name: defaultName,
      },
      {
        fieldId: "octave",
        scaleName: `Octave Scale (${OCTAVE_KEY})`,
        name: defaultName,
      },
    ].filter((f) => !(("depth" in f ? f.depth || 0 : 0) >= clipDepth));
  }, [view, clipTracks, trackMap, trackScaleMap, clipLabel]);

  return (
    <div className="flex gap-2">
      <PoseClipBaseEffect
        className="flex-col"
        border="border border-fuchsia-400"
      >
        <PoseClipDropdownContainer>
          <PoseClipDropdownItem
            active={view === "scale"}
            onClick={() => setView("scale")}
          >
            Modulations
          </PoseClipDropdownItem>
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
            Pattern Effects
          </PoseClipDropdownItem>
        </PoseClipDropdownContainer>
      </PoseClipBaseEffect>
      <div
        className={classNames(
          view === "notes" ? "h-min gap-0" : "gap-2",
          "max-w-4xl w-full overflow-scroll flex pr-2"
        )}
      >
        {view === "effects" ? (
          <PoseClipEffects {...props} />
        ) : view === "scale" ? (
          <PoseClipScale {...props} />
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

const PoseClipScale = (props: PoseClipVectorProps) => {
  const dispatch = useProjectDispatch();
  const scale = props.scale;
  const track = useDeep((_) => selectTrackById(_, props.clip.trackId));
  const trackScale = useDeep((_) => selectTrackMidiScale(_, track?.id));
  const parentScale = useDeep((_) => selectTrackMidiScale(_, track?.parentId));
  const hasScale = scale !== undefined;
  const name = getScaleName(scale ?? trackScale);
  return (
    <PoseClipBaseEffect
      className="flex-col w-auto px-4 pt-1.5 border"
      border={hasScale ? "border-sky-400" : "border-sky-400/50"}
    >
      <div className="flex flex-col">
        <div>{hasScale ? "Modulating to" : "Currently on"}</div>
        <div className="text-sky-400">{name}</div>
      </div>
      <div className="flex gap-2 mt-auto items-center mb-1">
        <button
          onFocus={blurEvent}
          onClick={promptUserForString({
            title: "Input Scale",
            description: [
              promptLineBreak,
              <span>
                Rule #1: <span className="text-sky-400">Scales</span> can be
                specified by name or symbol
              </span>,
              <span>Example: "C" or "Db lydian" or "Fmin7" or "G7#9"</span>,
              promptLineBreak,
              <span>
                Rule #2: <span className="text-sky-400">Scales</span> can be
                specified by pitch class
              </span>,
              <span>Example: "acoustic scale" or "C, D, E, F#, G, A, Bb"</span>,
              promptLineBreak,
              <span>
                Rule #3: <span className="text-sky-400">Scales</span> can be
                specified by scale degree
              </span>,
              <span>Example: "C major" or "0, 2, 4, 5, 7, 9, 11"</span>,
              promptLineBreak,
              <span className="underline">Please input your scale:</span>,
            ],
            callback: (string) => {
              const scale = readMidiScaleFromString(string, parentScale);
              if (scale) {
                dispatch(updatePose({ id: props.clip.poseId, scale }));
              }
            },
            autoselect: true,
          })}
          className="cursor-pointer bg-sky-800 border border-slate-400/50 hover:border-slate-300/50 p-0.5 px-2 rounded text-xs"
        >
          Modulate
        </button>
        <button
          disabled={!hasScale}
          onFocus={blurEvent}
          className="bg-slate-700 border border-slate-400/50 hover:border-slate-300/50 total-center p-1 rounded disabled:cursor-default"
          onClick={() =>
            dispatch(updatePose({ id: props.clip.poseId, scale: undefined }))
          }
        >
          <BsTrash />
        </button>
      </div>
    </PoseClipBaseEffect>
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
  const { vector, block } = props;
  const { clip, fieldId, name, scaleName } = props;
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

  // Omit the value from the vector on double click
  const onDoubleClick = () => {
    const newVector = omit(block?.vector ?? vector, fieldId);
    dispatch(updatePose({ id: clip.poseId, vector: newVector }));
  };

  // Update the value in the vector on value change
  const onValueChange = (_value: number) => {
    const value = sanitize(_value);
    const newVector = { ...(block?.vector ?? vector), [fieldId]: value };
    dispatch(updatePose({ id: clip.poseId, vector: newVector }));
  };

  const isPitchClass = name === "Pitch Class";

  // Render the vector field
  return (
    <PoseClipBaseEffect
      border={
        isPitchClass
          ? "border-none"
          : !!offset
          ? "border border-sky-400"
          : "border border-sky-400/50"
      }
      minWidth={isPitchClass ? "w-12" : "w-auto px-2"}
      className={isPitchClass ? "*:border" : "transition-all"}
    >
      <div
        data-empty={!offset}
        className="total-center-col transition-all data-[empty=false]:border-fuchsia-400 data-[empty=true]:border-fuchsia-400/50 mx-auto rounded overflow-hidden"
      >
        {isPitchClass ? (
          <div className="bg-fuchsia-500/50 rounded-t-sm text-base size-full">
            {fieldId}
          </div>
        ) : (
          <div className="p-2 pt-0 text-xs total-center-col size-full">
            <div>Transpose along</div>
            <div className="text-sky-400 whitespace-nowrap">{scaleName}</div>
          </div>
        )}{" "}
        <div
          data-pc={isPitchClass}
          className="data-[pc=false]:flex data-[pc=false]:items-center size-full"
        >
          <div
            data-pc={isPitchClass}
            className="flex size-full grow shrink-0 data-[pc=false]:w-24 data-[pc=true]:flex-col data-[pc=false]:border data-[pc=false]:border-slate-500 rounded min-h-min"
          >
            <input
              data-empty={offset === undefined}
              data-pc={isPitchClass}
              className="h-6 px-0 data-[empty=false]:bg-slate-600/20 text-sm p-data-[pc=true]:h-6 data-[pc=false]:w-full text-center bg-transparent data-[pc=false]:rounded border-0 focus:ring-0 text-slate-200 focus:bg-white/5"
              type="number"
              value={displayedValue}
              min={-100}
              max={100}
              onChange={(e) => {
                setDisplayedValue(e.target.value);
                if (e.target.value === "") {
                  setDisplayedValue("");
                  return onDoubleClick();
                }
                if (isNaN(parseInt(e.target.value))) return;
                const value = clamp(
                  sanitize(e.target.valueAsNumber),
                  -100,
                  100
                );
                onValueChange(value);
              }}
              placeholder="#"
              onKeyDown={(e) => {
                if (e.key === "Backspace" && offset === 0) onDoubleClick();
                blurOnEnter(e);
              }}
            />

            {!isPitchClass && (
              <>
                <button
                  className="p-1 bg-slate-50/10 border-r border-r-slate-500"
                  onClick={() => onValueChange((offset ?? 0) + 1)}
                >
                  <BiUpArrow />
                </button>
                <button
                  className="p-1 bg-slate-50/10"
                  onClick={() => onValueChange((offset ?? 0) - 1)}
                >
                  <BiDownArrow />
                </button>
              </>
            )}
          </div>
          <button
            disabled={offset === undefined}
            data-pc={isPitchClass}
            className="disabled:bg-slate-700/50 data-[pc=false]:ml-2 p-1 bg-slate-700 data-[pc=true]:w-full data-[pc=false]:border data-[pc=true]:border-t border-slate-400/50 hover:border-slate-300/50 total-center data-[pc=false]:size-6 data-[pc=false]:rounded disabled:cursor-default enabled:cursor-pointer"
            onClick={onDoubleClick}
            onFocus={blurEvent}
          >
            <BsTrash className="mx-auto select-none pointer-events-none" />
          </button>
          <div />
        </div>
      </div>
    </PoseClipBaseEffect>
  );
};
