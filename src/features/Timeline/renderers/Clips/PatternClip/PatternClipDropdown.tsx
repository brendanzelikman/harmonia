import { use, useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import {
  cancelEvent,
  DivMouseEvent,
  GenericEvent,
  isHoldingShift,
} from "utils/html";
import {
  addPatternBlock,
  removePatternBlock,
  updatePatternBlock,
} from "types/Pattern/PatternSlice";
import { BsPencil } from "react-icons/bs";
import { GiCrystalWand, GiHand } from "react-icons/gi";
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
import { clearPattern } from "types/Pattern/PatternThunks";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import {
  selectPatternClipMidiStream,
  selectPatternClipXML,
} from "types/Arrangement/ArrangementSelectors";
import {
  getDurationImage,
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  STRAIGHT_DURATION_TICKS,
  STRAIGHT_DURATION_TYPES,
} from "utils/durations";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import {
  selectIsClipLive,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import { PatternClip, PortaledPatternClip } from "types/Clip/ClipTypes";
import { showEditor } from "types/Editor/EditorThunks";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectTransport } from "types/Transport/TransportSelectors";
import { format } from "utils/math";
import { inRange } from "lodash";

export interface PatternClipDropdownProps extends PatternClipRendererProps {
  clip: PatternClip;
  portaledClip: PortaledPatternClip;
  isPosed: boolean;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const { clip, id, pcId, portaledClip, isPosed } = props;
  const dispatch = useProjectDispatch();
  const transport = use(selectTransport);
  const stream = useDeep((_) => selectPatternClipMidiStream(_, id));

  const isSelected = use((_) => selectIsClipSelected(_, id));
  const isLive = use((_) => selectIsClipLive(_, id));
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const isEmpty = !pattern.stream.length;

  const [isAdding, setIsAdding] = useState(true);
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
    className: "size-full",
    stream,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
    onNoteClick,
  });

  const holding = useHeldHotkeys(["shift", "t", "."]);
  const [duration, setDuration] = useState(getDurationTicks("16th"));
  const onRestClick = () => {
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
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (isNaN(key)) return;
      if (key === 0) {
        return onRestClick();
      }
      if (!inRange(key - 1, 0, STRAIGHT_DURATION_TYPES.length)) return;
      setDuration(Object.values(STRAIGHT_DURATION_TICKS)[key - 1]);
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
  const ticks = format(
    holding.t
      ? (duration * 2) / 3
      : holding["."]
      ? (duration * 3) / 2
      : duration
  );
  const durationType = getTickDuration(ticks);

  // Render the score dropdown
  return (
    <div
      className={classNames(
        "cursor-default z-20 font-thin backdrop-blur whitespace-nowrap",
        "w-full bg-gradient-to-t from-sky-950/95 to-sky-900 border-2 animate-in fade-in slide-in-from-left-8 slide-in-from-top-8 duration-150 p-4 gap-2 flex-col h-max rounded-b-lg",
        isSelected ? "border-slate-100" : "border-teal-500",
        clip.isOpen ? "flex" : "hidden"
      )}
      onClick={cancelEvent}
    >
      <div
        className="bg-white overflow-scroll min-h-[200px] max-h-[200px] shrink rounded-lg border-2 border-teal-200 cursor-pointer"
        onClick={() => {
          dispatch(showEditor({ data: { view: "pattern", clipId: clip.id } }));
        }}
      >
        {score}
      </div>
      <div className="flex shrink gap-16 mb-6 text-xs text-white">
        <div className="flex gap-4 px-3">
          <div className={"flex gap-4 relative"}>
            <div className="w-full flex absolute top-12 text-slate-300">
              <span>
                Hold Shift for Chord - Hold T for Triplet - Hold Dot for Dotted
              </span>
              <span className="ml-auto pr-2 capitalize">
                Duration:{" "}
                {holding.t ? "Triplet" : holding["."] ? "Dotted" : "Straight"}{" "}
                {getStraightDuration(durationType)} (
                {format(convertTicksToSeconds(transport, ticks), 4)}
                s)
              </span>
            </div>
            <ScoreButton
              width="w-36"
              padding="w-36 py-2 px-3"
              backgroundColor={
                isAdding ? "bg-emerald-600/80" : "bg-emerald-500/50"
              }
              borderColor={isAdding ? "border-emerald-200/80" : undefined}
              onClick={(e) =>
                isHoldingShift(e)
                  ? dispatch(inputPatternStream(pattern.id))
                  : // : setIsAdding((prev) => !prev)
                    setIsAdding(true)
              }
              icon={
                <div className="capitalize">
                  {`Play to Add ${holding.shift ? "Chord" : "Note"}`}
                </div>
              }
            />

            {isAdding && (
              <>
                <ScoreButton
                  width="w-36"
                  padding="w-36 py-2"
                  backgroundColor={"bg-emerald-400/40"}
                  onClick={onRestClick}
                  icon={<div className="capitalize">{`Click to Add Rest`}</div>}
                />
                <ScoreButton
                  width="w-16"
                  padding="w-16 py-2"
                  disabled={isEmpty}
                  backgroundColor={
                    isRemoving ? "bg-red-500/80" : "bg-red-500/50"
                  }
                  borderColor={"border-red-200/50"}
                  onClick={() => !isEmpty && dispatch(clearPattern(pattern.id))}
                  icon={<div>Clear</div>}
                />
                <div className="flex gap-1 bg-slate-500/25 border border-emerald-500/50 p-1 rounded-lg">
                  {STRAIGHT_DURATION_TYPES.map((d) => {
                    return (
                      <ScoreButton
                        key={d}
                        backgroundColor="bg-slate-50 border-2 rounded-full"
                        borderColor={
                          duration === getDurationTicks(d)
                            ? "border-teal-500"
                            : "border-slate-800"
                        }
                        width="w-8"
                        padding="w-8 p-1"
                        icon={
                          <img
                            className="object-contain size-5"
                            src={getDurationImage(d)}
                          />
                        }
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
                      />
                    );
                  })}
                </div>
              </>
            )}
            {/* <ScoreButton
              width="w-36"
              padding="w-36 py-2"
              backgroundColor={!cursor.hidden ? "bg-emerald-400/50" : undefined}
              onClick={() => {
                dispatch(updateMediaDraft);
                dispatch(
                  showEditor({ data: { view: "pattern", clipId: clip.id } })
                );
              }}
              icon={<div>Open Editor</div>}
            /> */}
            {!isAdding && (
              <ScoreButton
                width="w-36"
                padding="w-36 py-2"
                backgroundColor={"bg-teal-600/40 active:bg-teal-400/80"}
                onClick={() => dispatch(migrateClip({ data: clip }))}
                icon={<div>Copy Pattern</div>}
              />
            )}
            {!isAdding && (
              <ScoreButton
                width="w-36"
                padding="w-36 py-2"
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
                icon={
                  <div className="flex gap-2 items-center">
                    {isLive && isPosed
                      ? "Live"
                      : isLive
                      ? "Create Pose"
                      : "Play"}
                    {isPosed ? <GiCrystalWand /> : <GiHand />}
                  </div>
                }
              />
            )}
          </div>
        </div>
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
