import { useStore, useDispatch } from "hooks/useStore";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { cancelEvent, DivMouseEvent } from "utils/html";
import {
  removePatternBlock,
  updatePatternBlockDuration,
} from "types/Pattern/PatternSlice";
import classNames from "classnames";
import { clearPattern, randomizePattern } from "types/Pattern/PatternThunks";
import {
  bindNoteWithPrompt,
  bindNoteWithPromptCallback,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  getDurationImage,
  getDurationName,
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  STRAIGHT_DURATION_TYPES,
} from "utils/durations";
import { PatternClipId, PortaledPatternClip } from "types/Clip/ClipTypes";
import { usePatternClipScore } from "./usePatternClipScore";
import { useHeldHotkeys } from "lib/hotkeys";
import { createUndoType } from "utils/redux";
import { nanoid } from "@reduxjs/toolkit";
import { Piano } from "components/Piano";
import { selectTrackScale } from "types/Track/TrackSelectors";
import { useState } from "react";
import {
  promptUserForPattern,
  promptUserForPatternEffect,
} from "types/Clip/PatternClip/PatternClipRegex";
import {
  GiAbacus,
  GiCrystalWand,
  GiPaintBrush,
  GiPencil,
  GiPerspectiveDiceSix,
  GiTrashCan,
} from "react-icons/gi";
import { FaEraser, FaTape } from "react-icons/fa";
import { BsRecord, BsScissors } from "react-icons/bs";
import { selectPatternNoteLabel } from "types/Clip/PatternClip/PatternClipSelectors";
import { useHotkeys } from "react-hotkeys-hook";
import { PatternId } from "types/Pattern/PatternTypes";
import { useToggle } from "hooks/useToggle";

export interface PatternClipDropdownProps {
  clip: PortaledPatternClip;
  id: PatternClipId;
  isOpen: boolean;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const dispatch = useDispatch();
  const { clip, id, isOpen } = props;
  const { patternId, trackId } = clip;

  // Get the pattern and scale for the current clip
  const pattern = useStore((_) => selectPatternById(_, patternId));
  const scale = useStore((_) => selectTrackScale(_, trackId));

  // Allow the user to switch between scale and pedal notes
  const [type, setType] = useState<string>("scale");

  // Get the score of the pattern clip
  const clipScore = usePatternClipScore(clip);
  const { Score, index, playNote, setDuration, duration, input } = clipScore;
  const labels = useStore((_) => selectPatternNoteLabel(_, patternId, index));
  const isEditing = index !== undefined;
  const isEmpty = !pattern.stream.length;
  const isBinding = type === "scale";
  const record = useToggle("record-pattern");

  // Use hotkeys to toggle between each duration
  useHotkeys("x+1", () => setDuration(getDurationTicks("whole")));
  useHotkeys("x+2", () => setDuration(getDurationTicks("half")));
  useHotkeys("x+3", () => setDuration(getDurationTicks("quarter")));
  useHotkeys("x+4", () => setDuration(getDurationTicks("eighth")));
  useHotkeys("x+5", () => setDuration(getDurationTicks("16th")));
  useHotkeys("x+6", () => setDuration(getDurationTicks("32nd")));
  useHotkeys("x+7", () => setDuration(getDurationTicks("64th")));

  return (
    <div
      data-open={isOpen}
      className="w-full [data-open=false]:hidden [data-open=true]:flex bg-gradient-to-t from-sky-950/95 to-sky-900 animate-in fade-in slide-in-from-top-2 slide-in-from-left-2 flex-col h-max rounded-b-lg cursor-default z-20 font-thin backdrop-blur whitespace-nowrap"
      onClick={cancelEvent}
    >
      {Score}
      <div className="flex justify-between p-2 px-4">
        <div className={"flex flex-col items-center gap-2 relative"}>
          <DropdownDurationButtons
            id={patternId}
            index={index}
            duration={duration}
            setDuration={setDuration}
          />
          <DropdownDurationSelection input={input} />
          <DropdownDurationShortcuts />
        </div>
        <div className={"total-center-col gap-2 relative"}>
          <div className="flex w-min gap-2 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
            {record.isOpen ? (
              <DropdownButton
                width="size-8"
                dropdown="Record Pattern"
                theme="red"
                onClick={record.close}
                icon={<BsRecord className="text-2xl" />}
              />
            ) : (
              <DropdownButton
                width="size-8"
                dropdown="Input Pattern"
                theme="teal"
                onClick={() => dispatch(promptUserForPattern(id, index))}
                icon={<GiPaintBrush className="text-2xl" />}
              />
            )}
            <DropdownButton
              width="size-8"
              dropdown="Randomize Pattern"
              theme="indigo"
              onClick={() => {
                const data = { id: patternId, trackId, duration };
                dispatch(randomizePattern({ data }));
              }}
              icon={<GiPerspectiveDiceSix className="text-2xl" />}
            />
            {isEditing ? (
              <DropdownButton
                width="size-8"
                theme="sky"
                disabled={isEmpty}
                dropdown="Bind Selected Note"
                onClick={() => {
                  const data = { id: pattern.id, trackId, index };
                  dispatch(bindNoteWithPrompt({ data }));
                }}
                icon={<GiPencil className="text-2xl" />}
              />
            ) : (
              <DropdownButton
                width="size-8"
                disabled={isEmpty}
                theme="sky"
                dropdown={isBinding ? "Autobind Pattern" : "Freeze Pattern"}
                onClick={() => {
                  const string = isBinding ? "auto" : "pedal";
                  const undoType = createUndoType("bindNote", nanoid());
                  pattern.stream.forEach((_, index) => {
                    const data = { string, id: pattern.id, trackId, index };
                    dispatch(bindNoteWithPromptCallback({ data, undoType }));
                  });
                }}
                icon={
                  isBinding ? (
                    <GiAbacus className="text-2xl" />
                  ) : (
                    <FaTape className="text-xl" />
                  )
                }
              />
            )}
            <DropdownButton
              width="size-8"
              disabled={isEmpty}
              theme="fuchsia"
              dropdown="Transform Pattern"
              icon={<GiCrystalWand className="text-xl" />}
              onClick={() => dispatch(promptUserForPatternEffect(id))}
            />
            <DropdownButton
              width="size-8"
              disabled={isEmpty}
              theme="red"
              dropdown={isEditing ? "Erase Selected Note" : "Erase Last Note"}
              onClick={() => {
                const data = { id: pattern.id, index: index ?? -1 };
                if (!isEmpty) dispatch(removePatternBlock({ data }));
              }}
              icon={
                isEditing ? (
                  <BsScissors className="text-2xl" />
                ) : (
                  <FaEraser className="text-xl" />
                )
              }
            />
            <DropdownButton
              width="size-8"
              disabled={isEmpty}
              theme="slate"
              dropdown="Clear Pattern"
              onClick={() => !isEmpty && dispatch(clearPattern(pattern.id))}
              icon={<GiTrashCan className="text-2xl" />}
            />
          </div>
          <div
            className="mx-auto capitalize text-emerald-300 max-w-48 overflow-scroll"
            onClick={() => setType(type === "scale" ? "pedal" : "scale")}
          >
            {isEditing
              ? `Selected: ${labels}`
              : `Inputting ${type} ${type === "scale" ? "Degrees" : "Notes"}`}
          </div>
          <DropdownNoteButtons type={type} setType={setType} />
        </div>
      </div>
      <Piano
        className="animate-in border-t-8 border-t-emerald-500 fade-in w-min max-w-[600px] overflow-scroll"
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

const themes = {
  note: {
    background: "bg-slate-50",
    border: "border-2 border-slate-700",
    dropdownColor: "bg-teal-700",
  },
  "note-active": {
    background: "bg-slate-50",
    border: "border-2 border-teal-500",
    dropdownColor: "bg-teal-700",
  },
  teal: {
    background: "bg-teal-500/60",
    border: "border-teal-200/80",
    dropdownColor: "bg-teal-700",
  },
  indigo: {
    background: "bg-indigo-500/60",
    border: "border-indigo-200/80",
    dropdownColor: "bg-indigo-700",
  },
  sky: {
    background: "bg-sky-400/50",
    border: "border-sky-300/50",
    dropdownColor: "bg-sky-700",
  },
  fuchsia: {
    background: "bg-fuchsia-500/50",
    border: "border-fuchsia-200/50",
    dropdownColor: "bg-fuchsia-700",
  },
  red: {
    background: "bg-red-500/50",
    border: "border-red-200/50",
    dropdownColor: "bg-red-800/90",
  },
  slate: {
    background: "bg-slate-500/50",
    border: "border-slate-300/50",
    dropdownColor: "bg-slate-600",
  },
  default: {
    background: "bg-teal-800/80",
    border: "border-teal-300",
    dropdownColor: "bg-teal-700",
  },
};

const DropdownButton = (props: {
  onClick?: (e: DivMouseEvent) => void;
  borderColor?: string;
  backgroundColor?: string;
  dropdown?: React.ReactNode;
  theme?: keyof typeof themes;
  icon?: React.ReactNode;
  disabled?: boolean;
  width?: string;
}) => {
  const theme = themes[props.theme ?? "default"];
  return (
    <div className="size-8 total-center-col relative">
      {props.icon ? (
        <div
          className={classNames(
            theme.background,
            theme.border,
            props.disabled
              ? "opacity-50"
              : "cursor-pointer hover:opacity-80 active:opacity-50",
            "total-center size-8 text-xs peer border rounded-lg text-white"
          )}
          onClick={props.onClick}
        >
          {props.icon}
        </div>
      ) : null}
      {!props.disabled && props.dropdown ? (
        <div
          className={classNames(
            theme.dropdownColor,
            "absolute px-2 peer-hover:flex hidden animate-in fade-in top-10 z-10 backdrop-blur border overflow-hidden text-slate-50 rounded-lg gap-2"
          )}
        >
          {props.dropdown}
        </div>
      ) : null}
    </div>
  );
};

const DropdownDurationSelection = (props: { input: string }) => (
  <div className="flex text-emerald-300">
    <span className="mx-auto capitalize">Inputting {props.input}</span>
  </div>
);

const DropdownDurationButtons = (props: {
  id: PatternId;
  index?: number;
  duration: number;
  setDuration: (duration: number) => void;
}) => {
  const { id, index, duration: _duration, setDuration } = props;
  const dispatch = useDispatch();
  return (
    <div className="flex gap-1 justify-center bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
      {STRAIGHT_DURATION_TYPES.map((d, i) => {
        const duration = getDurationTicks(d);
        const name = getDurationName(d);
        const image = getDurationImage(d);
        const isEqual =
          getStraightDuration(getTickDuration(_duration)) ===
          getStraightDuration(d);
        return (
          <DropdownButton
            key={d}
            theme={isEqual ? "note-active" : "note"}
            width="size-8"
            dropdown={`${name} (${i + 1})`}
            icon={<img className="object-contain size-5" src={image} />}
            onClick={() => {
              setDuration(getDurationTicks(d));
              if (index !== undefined) {
                dispatch(updatePatternBlockDuration({ id, index, duration }));
              }
            }}
          />
        );
      })}
    </div>
  );
};

const DropdownNoteButtons = (props: {
  type: string;
  setType: (s: string) => void;
}) => {
  const { type, setType } = props;
  return (
    <div className="flex flex-col gap-0.5 w-full text-slate-300">
      <div className="flex gap-2">
        <div
          data-active={type === "scale"}
          className="mr-auto capitalize bg-emerald-500/50 cursor-pointer data-[active=true]:ring-1 data-[active=true]:ring-slate-400 data-[active=true]:bg-teal-600 data-[active=true]:text-slate-100 rounded w-28 text-center"
          onClick={() => setType("scale")}
        >
          Autobind
        </div>
        <div
          data-active={type === "pedal"}
          className="ml-auto capitalize bg-emerald-500/50 cursor-pointer data-[active=true]:ring-1 data-[active=true]:ring-slate-400 data-[active=true]:bg-teal-600 data-[active=true]:text-slate-100 rounded w-28 text-center"
          onClick={() => setType("pedal")}
        >
          Freeze
        </div>
      </div>

      <div className="flex">
        <span className="data-[active=true]:text-slate-100">
          Play Piano to Input
        </span>
        <span className="data-[active=true]:text-slate-100 ml-auto max-w-32 overflow-scroll">
          Click Note to Edit
        </span>
      </div>
    </div>
  );
};

const DropdownDurationShortcuts = () => {
  const holding = useHeldHotkeys(["shift", ",", "/", ".", "x"]);
  return (
    <div className="flex flex-col gap-0.5 w-full text-slate-300">
      <div className="flex gap-2">
        <div
          data-active={holding[","]}
          className="data-[active=true]:text-slate-100"
        >
          Hold Comma for Rest
        </div>
        <div
          data-active={holding["shift"]}
          className="data-[active=true]:text-slate-100 ml-auto"
        >
          Hold Shift for Chord
        </div>
      </div>
      <div className="flex gap-2">
        <span
          data-active={holding["."]}
          className="data-[active=true]:text-slate-100"
        >
          Hold Period for Dotted
        </span>
        <span
          data-active={holding["/"]}
          className="data-[active=true]:text-slate-100 ml-auto"
        >
          Hold Slash for Triplet
        </span>
      </div>
    </div>
  );
};
