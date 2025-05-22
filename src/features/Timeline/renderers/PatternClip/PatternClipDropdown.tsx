import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { cancelEvent } from "utils/event";
import {
  removePatternBlock,
  updatePatternBlockDuration,
} from "types/Pattern/PatternSlice";
import classNames from "classnames";
import { clearPattern, randomizePattern } from "types/Pattern/PatternThunks";
import {
  getDurationImage,
  getDurationName,
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  STRAIGHT_DURATION_TYPES,
} from "utils/duration";
import { PatternClipId, PortaledPatternClip } from "types/Clip/ClipTypes";
import { usePatternClipScore } from "./usePatternClipScore";
import { createUndoType } from "types/redux";
import { nanoid } from "@reduxjs/toolkit";
import { Piano } from "components/Piano";
import {
  selectTrackChainLabels,
  selectTrackScale,
  selectTrackScaleChain,
} from "types/Track/TrackSelectors";
import { MouseEvent, useCallback, useState } from "react";
import {
  GiAbacus,
  GiAnchor,
  GiArrowCursor,
  GiCrystalWand,
  GiDialPadlock,
  GiDiceSixFacesFive,
  GiDominoMask,
  GiIceCube,
  GiKeyboard,
  GiPencil,
  GiPianoKeys,
  GiTrashCan,
} from "react-icons/gi";
import { FaEraser, FaPlusCircle } from "react-icons/fa";
import { BsArrowClockwise, BsRecord, BsScissors } from "react-icons/bs";
import { selectPatternNoteLabel } from "types/Clip/PatternClip/PatternClipSelectors";
import { isPatternMidiBlock, PatternId } from "types/Pattern/PatternTypes";
import { useToggle } from "hooks/useToggle";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
import {
  promptUserForPattern,
  bindNoteWithPrompt,
  bindNoteWithPromptCallback,
  promptUserForPatternEffect,
} from "lib/prompts/patternClip";
import { useHotkeys } from "hooks/useHotkeys";
import { ScaleId } from "types/Scale/ScaleTypes";
import { SyncedNumericalForm } from "components/SyncedForm";
import { selectClipDuration } from "types/Clip/ClipSelectors";
import { isFinite } from "lodash";

export interface PatternClipDropdownProps {
  clip: PortaledPatternClip;
  id: PatternClipId;
  isOpen: boolean;
}

type NoteType = "scale" | "pedal";
type InputMode = "piano" | "scales";

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<InputMode>("piano");

  // Unpack the clip
  const { clip, id, isOpen } = props;
  const { patternId, trackId } = clip;
  const clipDuration = useAppValue((_) => selectClipDuration(_, id));
  const pattern = useAppValue((_) => selectPatternById(_, patternId));
  const scale = useAppValue((_) => selectTrackScale(_, trackId));
  const chain = useAppValue((_) => selectTrackScaleChain(_, trackId));
  const chainLabels = useAppValue((_) => selectTrackChainLabels(_, trackId));
  const [chainOffsets, setChainOffsets] = useState<Record<ScaleId, number>>({});
  const setChainOffset = (id: ScaleId, offset: number) => {
    setChainOffsets((prev) => ({ ...prev, [id]: offset }));
  };

  // Get the score of the pattern clip
  const {
    Score,
    index,
    playNote,
    playRest,
    setDuration,
    duration,
    input,
    toggle,
    toggleInsert,
    isInserting,
  } = usePatternClipScore(clip);

  const labels = useAppValue((_) =>
    selectPatternNoteLabel(_, patternId, index)
  );
  const isEditing = index !== undefined;
  const isEmpty = !pattern.stream.length;
  const isMidi = pattern.stream.every(isPatternMidiBlock);
  const [type, setType] = useState<NoteType>(
    isEmpty ? "scale" : isMidi ? "pedal" : "scale"
  );
  const isBinding = type === "scale";
  const record = useToggle("record-pattern");

  const deleteNote = useCallback(() => {
    const data = { id: pattern.id, index: index ?? -1 };
    if (!isEmpty) dispatch(removePatternBlock({ data }));
  }, [pattern, index]);

  const clearNotes = useCallback(() => {
    if (!isEmpty) dispatch(clearPattern(pattern.id));
  }, [pattern]);
  useHotkeys({ ",": playRest }, "keydown");

  const GeneratePattern = (
    <DropdownButton
      width="size-8"
      dropdown="Generate Pattern"
      theme="teal"
      onClick={() => {
        const data = {
          id: patternId,
          trackId,
          duration,
          clipDuration:
            !!clipDuration && isFinite(clipDuration) ? clipDuration : undefined,
        };
        dispatch(randomizePattern({ data }));
      }}
      icon={<GiDiceSixFacesFive className="text-xl" />}
    />
  );

  const InputPattern = record.isOpen ? (
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
      theme="sky"
      onClick={() => dispatch(promptUserForPattern(id, index))}
      icon={<GiKeyboard className="text-3xl pt-1" />}
    />
  );

  const ToggleInsert = (
    <DropdownButton
      width="size-8"
      dropdown={
        isInserting
          ? isEditing
            ? "Inserting (Before Cursor)"
            : "Inserting (To Start)"
          : isEditing
          ? "Editing (At Cursor)"
          : "Adding (To End)"
      }
      theme="teal"
      onClick={toggleInsert}
      icon={
        isInserting ? (
          <GiAnchor className={`text-xl`} />
        ) : (
          <FaPlusCircle className={`text-lg`} />
        )
      }
    />
  );

  const ToggleCursor = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty}
      dropdown={isEditing ? "Hide Cursor" : "Select Note"}
      theme="teal"
      onClick={!isEmpty ? toggle : undefined}
      icon={
        <GiArrowCursor
          className={`text-xl ${isEditing ? "text-red-100" : ""}`}
        />
      }
    />
  );

  const BindNote = (
    <DropdownButton
      width="size-8"
      theme="sky"
      disabled={!isEditing || isEmpty}
      dropdown="Bind Note"
      onClick={() => {
        if (!isEditing) return;
        const data = { id: pattern.id, trackId, index };
        dispatch(bindNoteWithPrompt({ data }));
      }}
      icon={<GiPencil className="text-2xl" />}
    />
  );

  const EraseNote = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty || !isEditing}
      theme="red"
      dropdown={"Erase Note"}
      onClick={deleteNote}
      icon={<FaEraser className="text-xl" />}
    />
  );

  const ClearPattern = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty}
      theme="slate"
      dropdown="Clear Notes"
      onClick={clearNotes}
      icon={<GiTrashCan className="text-2xl" />}
    />
  );

  const ToggleLock = (
    <DropdownButton
      width="size-8"
      theme="sky"
      dropdown={isBinding ? "Binding (Scale Notes)" : "Freezing (Pedal Notes)"}
      icon={
        isBinding ? (
          <GiDominoMask className="text-xl" />
        ) : (
          <GiIceCube className="text-xl" />
        )
      }
      onClick={() => setType(type === "scale" ? "pedal" : "scale")}
    />
  );

  const BindNotes = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty || isBinding}
      theme="sky"
      dropdown={"Bind Pattern (to Scale)"}
      onClick={() => {
        const string = "auto";
        const undoType = createUndoType("bindNote", nanoid());
        pattern.stream.forEach((_, index) => {
          const data = {
            string,
            id: pattern.id,
            trackId,
            index,
            allNotes: true,
          };
          dispatch(bindNoteWithPromptCallback({ data, undoType }));
        });
        setType("scale");
      }}
      icon={<GiAbacus className="text-2xl" />}
    />
  );

  const LockNotes = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty || !isBinding}
      theme="red"
      dropdown={"Lock Pattern (To Pedal Notes)"}
      onClick={() => {
        const string = "pedal";
        const undoType = createUndoType("bindNote", nanoid());
        pattern.stream.forEach((_, index) => {
          const data = {
            string,
            id: pattern.id,
            trackId,
            index,
            allNotes: true,
          };
          dispatch(bindNoteWithPromptCallback({ data, undoType }));
        });
        setType("pedal");
      }}
      icon={<GiDialPadlock className="text-xl" />}
    />
  );

  const TransformPattern = (
    <DropdownButton
      width="size-8"
      disabled={isEmpty}
      theme="fuchsia"
      dropdown="Transform Pattern"
      icon={<GiCrystalWand className="text-xl" />}
      onClick={() => dispatch(promptUserForPatternEffect(id))}
    />
  );

  const TogglePiano = (
    <DropdownButton
      width="size-8"
      theme="slate"
      dropdown={mode === "piano" ? "Equipped Piano" : "Equipped Buttons"}
      icon={<GiPianoKeys className="text-xl" />}
      onClick={() => setMode(mode === "piano" ? "scales" : "piano")}
    />
  );

  return (
    <div
      data-open={isOpen}
      className="w-full absolute bg-gradient-to-t from-sky-950/95 to-sky-900/90 top-6 min-w-[600px] [data-open=false]:hidden [data-open=true]:flex bg-transparent animate-in fade-in slide-in-from-top-2 slide-in-from-left-2 flex-col rounded-b-lg cursor-default z-20 font-thin whitespace-nowrap"
      onClick={cancelEvent}
    >
      <div className="relative flex flex-col size-full min-w-min">
        {Score}
        <div className="flex gap-12 p-2 px-4">
          <div
            className={"flex flex-col items-center gap-1 *:last:mt-3 relative"}
          >
            <div className="text-emerald-300 capitalize">Inputting {input}</div>
            <DropdownDurationButtons
              id={patternId}
              index={index}
              duration={duration}
              setDuration={setDuration}
            />
            <DropdownDurationShortcuts />
          </div>
          <div className={"total-center-col gap-1 relative"}>
            <div className="text-emerald-300">
              {isEditing
                ? `Selected: ${labels}`
                : isEmpty
                ? "Add Note to Edit Pattern"
                : "Click Note to Edit Properties"}
            </div>
            <div className="flex w-min gap-2 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
              {ToggleInsert}
              {ToggleLock}
              {ToggleCursor}
              {BindNote}
              {EraseNote}
              {TogglePiano}
            </div>
            <div className="mx-auto capitalize text-emerald-300 max-w-64 overflow-scroll">
              {mode === "piano" ? "Play Piano" : "Click Buttons"} to{" "}
              {isInserting ? "Insert" : isEditing ? "Edit" : "Add"}{" "}
              {isBinding ? "Scale" : "Pedal"} Note
            </div>
            <div className="flex w-min gap-2 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
              {GeneratePattern}
              {InputPattern}
              {TransformPattern}
              {BindNotes}
              {LockNotes}
              {ClearPattern}
            </div>
          </div>
        </div>
        {mode === "piano" ? (
          <Piano
            className="animate-in border-t-8 border-t-emerald-500 fade-in w-min max-w-[600px] overflow-scroll"
            show
            noteRange={noteRange}
            playNote={(_, midi) =>
              playNote({
                MIDI: midi,
                trackId: type === "scale" ? trackId : undefined,
              })
            }
            scale={scale}
            width={896}
            keyWidthToHeight={0.14}
          />
        ) : (
          <div className="w-[600px] min-h-38 border-t-8 border-t-emerald-500 bg-slate-800 flex flex-col p-2 gap-2 text-slate-50 overflow-scroll">
            {chain.map((scale, i) => (
              <div className="flex" key={scale.id}>
                <div className="flex font-bold flex-col gap-1">
                  Scale {chainLabels[i]}:
                  <div className="flex gap-2 font-light overflow-scroll">
                    {scale.notes.map((_, j) => (
                      <div
                        className="size-8 rounded-full border border-slate-400 bg-sky-800 hover:opacity-85 shrink-0 total-center cursor-pointer"
                        key={`${scale.id}-${j}`}
                        onClick={() =>
                          playNote({
                            scaleId: scale.id,
                            degree: j,
                            offset: chainOffsets,
                          })
                        }
                      >
                        {j + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex font-bold flex-col gap-1 ml-auto text-right">
                  Offset {chainLabels[i]}:
                  <div className="flex gap-2 items-center">
                    <SyncedNumericalForm
                      value={chainOffsets[scale.id] ?? 0}
                      setValue={(value) => setChainOffset(scale.id, value)}
                      min={-12}
                      max={12}
                      className="w-12 h-7 font-light rounded-md border bg-sky-800 shrink-0 total-center"
                    />
                    <BsArrowClockwise
                      className="bg-sky-800/50 size-7 p-1.5 rounded-lg cursor-pointer hover:text-slate-300 border border-slate-500"
                      onClick={() => setChainOffset(scale.id, 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
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

const DropdownDurationButtons = (props: {
  id: PatternId;
  index?: number;
  duration: number;
  setDuration: (duration: number) => void;
}) => {
  const { id, index, duration: _duration, setDuration } = props;
  const dispatch = useAppDispatch();
  return (
    <div className="flex gap-1 justify-center bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
      {STRAIGHT_DURATION_TYPES.map((d) => {
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
            dropdown={name}
            icon={<img className="object-contain size-5" src={image} />}
            onClick={() => {
              setDuration(duration);
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
  type: NoteType;
  setType: (s: NoteType) => void;
  mode: InputMode;
  setMode: (s: InputMode) => void;
  canEdit: boolean;
  isEditing: boolean;
  toggleCursor: () => void;
}) => {
  return (
    <div className="flex flex-col gap-2 w-full text-slate-300">
      <div className="flex gap-2">
        <div
          data-active={props.mode === "piano"}
          className="mr-auto capitalize bg-sky-700 cursor-pointer ring-1 ring-slate-400 data-[active=true]:bg-teal-600 text-slate-100 rounded w-28 text-center"
          onClick={() =>
            props.setMode(props.mode === "piano" ? "scales" : "piano")
          }
        >
          {props.mode === "piano" ? "Play Piano" : "Play Scales"}
        </div>
        <div
          data-active={props.isEditing}
          className="ml-auto capitalize bg-emerald-500/50 cursor-pointer data-[active=true]:ring-1 data-[active=true]:ring-slate-400 data-[active=true]:bg-teal-600 data-[active=true]:text-slate-100 rounded w-28 text-center"
          onClick={props.canEdit ? props.toggleCursor : undefined}
        >
          {props.isEditing ? "Hide Cursor" : "Select Note"}
        </div>
      </div>
      <div
        data-disabled={props.mode !== "piano"}
        className="flex gap-2 data-[disabled=true]:opacity-50"
      >
        <div
          data-active={props.type === "scale"}
          className="mr-auto capitalize bg-cyan-500/50 cursor-pointer data-[active=true]:ring-1 data-[active=true]:ring-slate-300 data-[active=true]:bg-cyan-700 data-[active=true]:text-slate-100 rounded w-28 text-center"
          onClick={() => props.setType("scale")}
        >
          Autobind
        </div>
        <div
          data-active={props.type === "pedal"}
          className="ml-auto capitalize bg-cyan-500/50 cursor-pointer data-[active=true]:ring-1 data-[active=true]:ring-slate-300 data-[active=true]:bg-cyan-700 data-[active=true]:text-slate-100 rounded w-28 text-center"
          onClick={() => props.setType("pedal")}
        >
          Freeze
        </div>
      </div>
    </div>
  );
};

const DropdownDurationShortcuts = () => {
  const holding = useHeldKeys(["shift", "rightshift", ",", "/", "."]);
  return (
    <div className="flex flex-col gap-[2px] w-full text-slate-300">
      <div className="flex gap-2">
        <div
          data-active={holding[getKeyCode(",")]}
          className="data-[active=true]:text-slate-100"
        >
          Press Comma for Rest
        </div>
        <div
          data-active={
            holding[getKeyCode("shift")] || holding[getKeyCode("rightshift")]
          }
          className="data-[active=true]:text-slate-100 ml-auto"
        >
          Hold Shift for Chord
        </div>
      </div>
      <div className="flex gap-2">
        <span
          data-active={holding[getKeyCode(".")]}
          className="data-[active=true]:text-slate-100"
        >
          Hold Period for Dotted
        </span>
        <span
          data-active={holding[getKeyCode("/")]}
          className="data-[active=true]:text-slate-100 ml-auto"
        >
          Hold Slash for Triplet
        </span>
      </div>
    </div>
  );
};
