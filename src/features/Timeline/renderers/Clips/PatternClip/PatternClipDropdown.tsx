import { use, useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import {
  blurOnEnter,
  cancelEvent,
  DivMouseEvent,
  isHoldingShift,
} from "utils/html";
import {
  addPatternBlock,
  removePatternBlock,
  updatePattern,
  updatePatternBlock,
} from "types/Pattern/PatternSlice";
import { BsCursor, BsPencil } from "react-icons/bs";
import { GiCrystalWand, GiHand, GiSprout } from "react-icons/gi";
import classNames from "classnames";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { useCallback, useEffect, useState } from "react";
import { DropdownOption } from "features/Editor/PatternEditor/tabs/PatternEditorTransformTab";
import {
  inputPatternStream,
  migrateClip,
  preparePatternClip,
} from "types/Clip/ClipThunks";
import { PatternClipPiano } from "./PatternClipPiano";
import { BiEraser, BiTrash } from "react-icons/bi";
import { clearPattern } from "types/Pattern/PatternThunks";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import {
  selectPatternClipMidiStream,
  selectPatternClipXML,
} from "types/Arrangement/ArrangementSelectors";
import { Menu } from "@headlessui/react";
import {
  getDurationImage,
  getDurationTicks,
  getTickDuration,
  STRAIGHT_DURATION_TYPES,
} from "utils/durations";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { SiBuddy } from "react-icons/si";
import {
  selectIsClipLive,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import { PatternClip, PortaledPatternClip } from "types/Clip/ClipTypes";

export interface PatternClipDropdownProps extends PatternClipRendererProps {
  clip: PatternClip;
  portaledClip: PortaledPatternClip;
  isPosed: boolean;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const { clip, id, pcId, portaledClip, isPosed } = props;
  const dispatch = useProjectDispatch();
  const stream = useDeep((_) => selectPatternClipMidiStream(_, id));

  const isSelected = use((_) => selectIsClipSelected(_, id));
  const isLive = use((_) => selectIsClipLive(_, id));
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const isEmpty = !pattern.stream.length;

  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  useEffect(() => {
    if (isEmpty) setIsRemoving(false);
  }, [isEmpty]);

  // Create the score
  const xml = use((_) => selectPatternClipXML(_, portaledClip));
  const streamLength = stream.length;

  const onNoteClick = useCallback<NoteCallback>(
    (cursor, index) => {
      if (isRemoving) {
        dispatch(removePatternBlock({ id: pattern.id, index }));
        if (streamLength < 2) setIsRemoving(false);
      } else {
        if (cursor.hidden) cursor.show();
        cursor.setIndex(index);
      }
    },
    [isRemoving, streamLength]
  );

  const { score, cursor } = useOSMD({
    id: `${pcId}_score`,
    xml,
    className: "size-full max-w-lg",
    stream,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
    onNoteClick,
  });

  const holding = useHeldHotkeys("shift");
  const [duration, setDuration] = useState(getDurationTicks("16th"));

  // Render the score dropdown
  return (
    <div
      className={classNames(
        "cursor-default z-20 font-thin backdrop-blur whitespace-nowrap",
        "w-full bg-gradient-to-t from-sky-950/95 to-sky-900 border-2 animate-in fade-in slide-in-from-left-8 slide-in-from-top-8 duration-150 p-4 gap-6 flex-col h-max rounded-b-lg",
        isSelected ? "border-slate-100" : "border-teal-500",
        clip.isOpen ? "flex" : "hidden"
      )}
      onClick={cancelEvent}
    >
      <div className="flex shrink gap-16 text-xs text-white">
        <div className="relative flex flex-col gap-2">
          <div>Pattern Name:</div>
          <input
            className="bg-teal-700/25 px-2 placeholder:text-slate-400 border border-teal-300 focus:border-sky-300 focus:ring-sky-300 rounded-lg p-0 text-base text-center"
            value={pattern?.name ?? ""}
            placeholder={"Pattern Name"}
            onChange={(e) => {
              const data = { id: pattern?.id, name: e.target.value };
              dispatch(updatePattern({ data }));
            }}
            onClick={cancelEvent}
            onDoubleClick={cancelEvent}
            onKeyDown={blurOnEnter}
          />
        </div>
        <div className="flex gap-4 px-3">
          <div className={"flex gap-4"}>
            <ScoreButton
              label={
                isAdding
                  ? `Play to ${
                      cursor.hidden ? (holding.shift ? "Stack" : `Add`) : `Edit`
                    }`
                  : "Write"
              }
              backgroundColor={
                isAdding ? "bg-emerald-600/80" : "bg-emerald-500/20"
              }
              borderColor={isAdding ? "border-emerald-200/80" : undefined}
              onClick={(e) =>
                isHoldingShift(e)
                  ? dispatch(inputPatternStream(pattern.id))
                  : setIsAdding((prev) => !prev)
              }
              icon={<BsPencil />}
            />
            {isAdding && (
              <>
                <ScoreButton
                  label={
                    holding.shift
                      ? "Clear"
                      : isRemoving
                      ? "Click to Erase"
                      : "Erase"
                  }
                  disabled={isEmpty}
                  backgroundColor={
                    holding.shift || isRemoving
                      ? "bg-red-500/80"
                      : "bg-red-500/50"
                  }
                  borderColor={"border-red-200/50"}
                  onClick={(e) =>
                    !isEmpty &&
                    (isHoldingShift(e)
                      ? dispatch(clearPattern(pattern.id))
                      : setIsRemoving((prev) => !prev))
                  }
                  icon={holding.shift ? <BiTrash /> : <BiEraser />}
                />

                <ScoreButton
                  label={cursor.hidden ? `Cursor` : `Block ${cursor.index + 1}`}
                  disabled={isEmpty}
                  backgroundColor={
                    !cursor.hidden ? "bg-emerald-400/50" : undefined
                  }
                  onClick={() => !isEmpty && cursor.toggle()}
                  icon={<BsCursor />}
                />
                <ScoreButton
                  label={cursor.hidden ? `Rest` : `Set to Rest`}
                  backgroundColor={
                    !cursor.hidden ? "bg-emerald-400/50" : undefined
                  }
                  onClick={() => {
                    if (cursor.hidden) {
                      dispatch(
                        addPatternBlock({
                          id: pattern.id,
                          block: { duration },
                        })
                      );
                    } else {
                      dispatch(
                        updatePatternBlock({
                          id: pattern.id,
                          index: cursor.index,
                          block: getPatternBlockWithNewNotes(
                            pattern.stream[cursor.index],
                            undefined,
                            () => ({ duration })
                          ),
                        })
                      );
                    }
                  }}
                  icon={<SiBuddy />}
                />
                <ScoreButton
                  backgroundColor="bg-gradient-radial from-zinc-900/5 to-zinc-900/80"
                  borderColor="border-slate-400"
                  label={isAdding ? "Duration" : ""}
                  icon={
                    <Menu>
                      <Menu.Button
                        as="div"
                        className="invert size-fulltotal-center"
                      >
                        <img
                          className="object-contain size-5"
                          src={getDurationImage(getTickDuration(duration))}
                        />
                      </Menu.Button>
                      <Menu.Items
                        as="div"
                        className="absolute last:border-b-0 outline-none min-h-max top-16 z-[90] bg-zinc-900/80 backdrop-blur rounded overflow-hidden border border-slate-400"
                      >
                        {STRAIGHT_DURATION_TYPES.map((d) => (
                          <Menu.Item key={d}>
                            <div
                              className={classNames(
                                "px-2 py-1 capitalize text-sm cursor-pointer bg-sky-950/50 border-b border-b-slate-300/50 hover:opacity-75"
                              )}
                              onClick={() => {
                                setDuration(getDurationTicks(d));
                                if (!cursor.hidden) {
                                  dispatch(
                                    updatePatternBlock({
                                      id: pattern.id,
                                      index: cursor.index,
                                      block: getPatternBlockWithNewNotes(
                                        pattern.stream[cursor.index],
                                        (notes) =>
                                          notes.map((n) => ({
                                            ...n,
                                            duration: getDurationTicks(d),
                                          })),
                                        () => ({
                                          duration: getDurationTicks(d),
                                        })
                                      ),
                                    })
                                  );
                                }
                              }}
                            >
                              {d}
                            </div>
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Menu>
                  }
                />
              </>
            )}
            {!isAdding && (
              <ScoreButton
                label="Copy"
                backgroundColor={"bg-teal-800/80 active:bg-teal-400/80"}
                onClick={() => dispatch(migrateClip({ data: clip }))}
                icon={<GiSprout />}
              />
            )}
            {!isAdding && (
              <ScoreButton
                label={isLive && isPosed ? "Live" : isLive ? "Stage" : "Play"}
                backgroundColor={
                  isLive && isPosed
                    ? "bg-fuchsia-400/80"
                    : isLive
                    ? "bg-fuchsia-400/40"
                    : "bg-fuchsia-400/30"
                }
                borderColor={isLive ? "border-fuchsia-200/80" : undefined}
                onClick={() =>
                  dispatch(preparePatternClip({ data: portaledClip }))
                }
                icon={isPosed ? <GiCrystalWand /> : <GiHand />}
              />
            )}
          </div>
        </div>
      </div>
      <div className="bg-white overflow-scroll min-h-[200px] max-h-[200px] shrink rounded-lg border-2 border-teal-200">
        {score}
      </div>
      {isAdding && (
        <PatternClipPiano
          {...props}
          cursor={cursor}
          duration={duration}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}

const noteClasses = ["cursor-pointer"];

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
}) => {
  return (
    <div className="flex flex-col gap-2 w-16 total-center relative">
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
              : "cursor-pointer active:opacity-75",
            "total-center border text-sm rounded-lg text-white"
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

const DropdownButton = (props: {
  options: DropdownOption[];
  icon?: React.ReactNode;
  label: string;
  show?: boolean;
  toggle?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const shouldShow = props.show === undefined ? open : props.show;
  const toggle =
    props.toggle === undefined ? () => setOpen((prev) => !prev) : props.toggle;
  return (
    <ScoreButton
      label={props.label}
      labelClass="w-full rounded"
      icon={props.icon ?? <BsPencil />}
      onClick={toggle}
      show={shouldShow}
      dropdown={
        <div className="flex flex-col p-2 min-w-20 total-center gap-1">
          {props.options.map((props) => (
            <ScoreButton
              {...props}
              key={props.id}
              labelClass="hover:opacity-50 w-full"
            />
          ))}
        </div>
      }
    />
  );
};
