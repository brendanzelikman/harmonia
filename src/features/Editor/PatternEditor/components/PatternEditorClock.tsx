import {
  isPatternChord,
  PatternBlock,
  PatternStream,
} from "types/Pattern/PatternTypes";
import classNames from "classnames";
import { useProjectDispatch } from "types/hooks";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import {
  createNoteFactory,
  createRestFactory,
  getDurationTicks,
} from "utils/durations";
import { updatePattern } from "types/Pattern/PatternSlice";
import { getPatternChordNotes } from "types/Pattern/PatternUtils";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useEffect, useState } from "react";
import { isHoldingShift } from "utils/html";
import { PatternEditorProps } from "../PatternEditor";

export const PatternEditorClock = (props: PatternEditorProps) => {
  const dispatch = useProjectDispatch();
  const { pattern, settings, index, cursor } = props;
  const clockLength = settings.clock.clockLength;
  const tickDuration = settings.clock.tickDuration;
  const durationTicks = getDurationTicks(tickDuration);

  const unfoldedNotes = (pattern?.stream ?? []).flatMap((block) => {
    const duration = getPatternBlockDuration(block) / durationTicks;
    const base = Array.from(
      { length: Math.ceil(duration) },
      () => null as PatternBlock[] | null
    );
    if (!isPatternChord(block)) return base.flat();
    const quantizedBlock = getPatternChordNotes(block).map((note) => ({
      ...note,
      duration: durationTicks,
    }));
    return base.fill([quantizedBlock], 0, 1).flat();
  });

  const replacement =
    unfoldedNotes.find(isPatternChord) ?? createNoteFactory(tickDuration)();

  const clockSlots = Array.from({ length: clockLength }, (_, i) => i + 1);

  const selectedSlots = Array.from({ length: clockLength }, (_, i) =>
    isPatternChord(unfoldedNotes[i])
  );

  const [currentState, setCurrentState] = useState<PatternStream | undefined>();
  const holding = useHeldHotkeys(["shift"]);
  useEffect(() => {
    if (!pattern) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        dispatch(
          updatePattern({
            data: {
              id: pattern.id,
              stream: Array.from({ length: clockLength }, () => replacement),
            },
          })
        );
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isHoldingShift(e) && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        dispatch(
          updatePattern({
            data: { id: pattern.id, stream: currentState ?? pattern.stream },
          })
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    if (holding.shift) {
      setCurrentState(pattern?.stream);
    } else if (currentState !== undefined) {
      dispatch(
        updatePattern({ data: { id: pattern.id, stream: currentState } })
      );
      setCurrentState(undefined);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [holding.shift]);

  // Find if there is a note in the stream that fires exactly at this tick
  // If there is, replace it with a rest
  // Otherwise, add a replacement equal to the first note of the stream or C4

  if (!pattern) return null;
  return (
    <div className="my-4 w-full bg-slate-500/50 flex flex-wrap border-4 border-zinc-900 rounded-lg">
      {clockSlots.map((slot, i) => {
        const isSelected = !!selectedSlots[i];
        return (
          <div
            key={slot}
            className={classNames(
              isSelected ? `text-green-600` : `text-slate-900`,
              `cursor-pointer w-[6.25%] flex total-center min-h-16 border-r border-b border-slate-900`
            )}
          >
            <span
              className={classNames(
                !cursor.hidden && index === i
                  ? "ring-emerald-300"
                  : isSelected
                  ? "ring-emerald-500"
                  : "ring-slate-500",

                `size-8 text-xs flex cursor-pointer total-center select-none bg-slate-50 border-2 border-slate-800 ring-2 rounded-full`
              )}
              onClick={() => {
                if (!pattern) return;

                const newStream = Array.from({ length: clockLength }, () =>
                  createRestFactory(tickDuration)()
                ).map((rest, j) =>
                  j === i
                    ? !!selectedSlots[i]
                      ? isPatternChord(unfoldedNotes[j])
                        ? {
                            duration: getPatternBlockDuration(unfoldedNotes[j]),
                          }
                        : replacement
                      : replacement
                    : unfoldedNotes[j] ?? rest
                );

                dispatch(
                  updatePattern({
                    data: { id: pattern.id, stream: newStream },
                  })
                );
              }}
            >
              <div
                className={classNames(
                  isSelected ? "bg-emerald-400" : "bg-transparent",
                  "w-4 h-1 mb-2 border border-slate-500 rounded-sm"
                )}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
};
