import { useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { cancelEvent, DivMouseEvent } from "utils/html";
import {
  removePatternBlock,
  updatePatternBlockDuration,
} from "types/Pattern/PatternSlice";
import classNames from "classnames";
import { clearPattern, randomizePattern } from "types/Pattern/PatternThunks";
import { bindNoteWithPrompt } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  getDurationImage,
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  STRAIGHT_DURATION_TYPES,
} from "utils/durations";
import { PatternClipId, PortaledPatternClip } from "types/Clip/ClipTypes";
import { usePatternClipHotkeys } from "./usePatternClipHotkeys";
import { usePatternClipScore } from "./usePatternClipScore";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { createUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";
import { promptRomanNumerals } from "features/Timeline/hooks/useTimelineHotkeys";
import { Piano } from "components/Piano";
import { selectTrackScale } from "types/Track/TrackSelectors";
import { useState } from "react";

export interface PatternClipDropdownProps {
  clip: PortaledPatternClip;
  id: PatternClipId;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const { clip } = props;
  const dispatch = useProjectDispatch();
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const scale = useDeep((_) => selectTrackScale(_, props.clip.trackId));
  const holding = useHeldHotkeys(["shift", "t", ".", "x"]);

  const clipScore = usePatternClipScore(clip);
  const { Score, index, playNote, setDuration, duration, input } = clipScore;
  const [type, setType] = useState<"scale" | "pedal">("scale");

  const isOpen = !!clip.isOpen;
  const isEmpty = !pattern.stream.length;
  const isEditing = index !== undefined;

  usePatternClipHotkeys({ playNote, setDuration });

  return (
    <div
      data-open={isOpen}
      className="w-full [data-open=false]:hidden [data-open=true]:flex bg-gradient-to-t from-sky-950/95 to-sky-900 animate-in fade-in gap-2 flex-col h-max rounded-b-lg cursor-default z-20 font-thin backdrop-blur whitespace-nowrap"
      onClick={cancelEvent}
    >
      {Score}
      <div className="flex justify-between px-3 py-2">
        <div className={"total-center-col gap-2 relative"}>
          <div className="flex gap-1 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
            {STRAIGHT_DURATION_TYPES.map((d) => {
              const ticks = getDurationTicks(d);
              const image = getDurationImage(d);
              const isEqual =
                getStraightDuration(getTickDuration(duration)) ===
                getStraightDuration(d);
              const id = clip.patternId;
              return (
                <ScoreButton
                  key={d}
                  backgroundColor="bg-slate-50 border-2 rounded-full"
                  borderColor={isEqual ? "border-teal-500" : "border-slate-800"}
                  width="w-8"
                  padding="w-8 p-1"
                  icon={<img className="object-contain size-5" src={image} />}
                  onClick={() => {
                    setDuration(getDurationTicks(d));
                    if (index === undefined) return;
                    dispatch(
                      updatePatternBlockDuration({ id, index, duration: ticks })
                    );
                  }}
                />
              );
            })}
          </div>
          <div className="px-2 w-full text-slate-300">
            <div className="flex text-emerald-300">
              <span className="mx-auto capitalize">Inputting {input}</span>
            </div>
            <div className="flex">
              <span
                data-active={holding["t"]}
                className="data-[active=true]:text-slate-100"
              >
                Hold T for Triplet
              </span>
              <span
                data-active={holding["."]}
                className="data-[active=true]:text-slate-100 ml-auto"
              >
                Hold . for Dotted
              </span>
            </div>
            <div className="flex">
              <span
                data-active={holding["x"]}
                className="data-[active=true]:text-slate-100"
              >
                Hold X for Rest
              </span>
              <span
                data-active={holding["shift"]}
                className="data-[active=true]:text-slate-100 ml-auto"
              >
                Hold Shift for Chord
              </span>
            </div>
          </div>
        </div>
        <div className={"total-center-col gap-2 relative"}>
          <div className="flex w-min gap-2 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
            <ScoreButton
              width="w-12"
              padding="w-12 py-2"
              backgroundColor={"bg-emerald-500/60"}
              borderColor="border-emerald-200/80"
              onClick={() =>
                dispatch(
                  randomizePattern({ data: { id: clip.patternId, duration } })
                )
              }
              icon="New"
            />
            <ScoreButton
              width="w-12"
              padding="w-12 py-2"
              disabled={isEmpty}
              backgroundColor={"bg-red-500/50"}
              borderColor={"border-red-200/50"}
              onClick={() =>
                !isEmpty &&
                dispatch(
                  removePatternBlock({
                    data: { id: pattern.id, index: index ?? -1 },
                    undoType: createUndoType("removeNote", nanoid()),
                  })
                )
              }
              icon={!isEditing ? "Pop" : "Cut"}
            />
            {isEditing ? (
              <ScoreButton
                width="w-12"
                padding="w-12 py-2"
                disabled={isEmpty}
                backgroundColor={"bg-slate-400/50"}
                borderColor={"border-slate-300/50"}
                onClick={() =>
                  index !== undefined &&
                  dispatch(bindNoteWithPrompt(pattern.id, index))
                }
                icon="Bind"
              />
            ) : (
              <ScoreButton
                width="w-12"
                padding="w-12 py-2"
                disabled={isEmpty}
                backgroundColor={"bg-slate-400/50"}
                borderColor={"border-slate-300/50"}
                onClick={() => !isEmpty && dispatch(clearPattern(pattern.id))}
                icon="Clear"
              />
            )}
            <ScoreButton
              width="w-12"
              padding="w-12 py-2"
              disabled={isEmpty}
              backgroundColor={"bg-fuchsia-400/60"}
              borderColor={"border-slate-300/50"}
              onClick={() => {
                if (isEmpty) return;
                dispatch(promptRomanNumerals({ data: clip }));
              }}
              icon="Pose"
            />
          </div>
          <div className="px-2 w-full text-slate-300">
            <div className="flex">
              <span
                className="mx-auto capitalize text-emerald-300"
                onClick={() => setType(type === "scale" ? "pedal" : "scale")}
              >
                Creating {type} Notes
              </span>
              <span
                data-type={type}
                className="border border-emerald-300 active:bg-slate-900/50 px-2 rounded cursor-pointer capitalize ml-auto text-emerald-300"
                onClick={() => setType(type === "scale" ? "pedal" : "scale")}
              >
                Toggle
              </span>
            </div>
            <div className="flex gap-4">
              <span className="data-[active=true]:text-slate-100">
                Play Piano to Input
              </span>
              <span className="data-[active=true]:text-slate-100 ml-auto">
                Click Note to Edit
              </span>
            </div>
            <div className="flex gap-4">
              <span className="data-[active=true]:text-slate-100">
                A + 1-9 = Degree
              </span>
              <span className="data-[active=true]:text-slate-100 ml-auto">
                D + 1-7 = Duration
              </span>
            </div>
          </div>
        </div>
      </div>

      <Piano
        className="animate-in border-t-8 border-t-emerald-500 fade-in w-full max-w-xl overflow-scroll"
        show
        noteRange={noteRange}
        playNote={(_, midi) => playNote(midi, type === "scale")}
        scale={scale}
        width={896}
        keyWidthToHeight={0.14}
      />
    </div>
  );
}

const noteRange = ["A1", "C8"] as const;

const ScoreButton = (props: {
  label?: React.ReactNode;
  labelClass?: string;
  onClick?: (e: DivMouseEvent) => void;
  buttonClass?: string;
  padding?: string;
  borderColor?: string;
  backgroundColor?: string;
  dropdown?: React.ReactNode;
  icon?: React.ReactNode;
  show?: boolean;
  disabled?: boolean;
  width?: string;
}) => {
  return (
    <div
      className={`flex flex-col gap-2 ${
        props.width ?? "w-16"
      } total-center relative`}
    >
      {props.show && props.dropdown ? (
        <div className="absolute animate-in fade-in top-14 z-10 bg-teal-900/90 backdrop-blur border border-teal-500 rounded-lg gap-2">
          {props.dropdown}
        </div>
      ) : null}
      {props.label ? (
        <div
          className={props.labelClass}
          onClick={!props.icon ? props.onClick : cancelEvent}
        >
          {props.label}
        </div>
      ) : null}
      {props.icon ? (
        <div
          className={classNames(
            props.buttonClass,
            props.borderColor ?? "border-teal-300",
            props.backgroundColor ?? "bg-teal-800/80",
            props.padding ?? "h-8 w-12 text-xl",
            props.disabled
              ? "cursor-default opacity-50"
              : "cursor-pointer active:opacity-85",
            "total-center border text-xs rounded-lg text-white"
          )}
          onClick={(e) => {
            cancelEvent(e);
            props.onClick?.(e);
          }}
        >
          {props.icon}
        </div>
      ) : null}
    </div>
  );
};
