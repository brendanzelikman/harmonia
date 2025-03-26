import { nanoid } from "@reduxjs/toolkit";
import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useTransportState } from "hooks/useTransportState";
import { createUndoType } from "lib/redux";
import {
  BsStop,
  BsPause,
  BsPlay,
  BsRecord,
  BsArrowRepeat,
} from "react-icons/bs";
import { useDeep, useProjectDispatch } from "types/hooks";
import {
  selectTransportLoop,
  selectTransportRecording,
} from "types/Transport/TransportSelectors";
import {
  stopTransport,
  toggleTransport,
  toggleTransportRecording,
  toggleTransportLoop,
  setTransportLoopStart,
  setTransportLoopEnd,
  convertStringToTicks,
} from "types/Transport/TransportThunks";
import { promptUserForString } from "utils/html";
import { sanitize } from "utils/math";

export function NavbarTransportControl() {
  const dispatch = useProjectDispatch();
  const state = useTransportState();
  const isRecording = useDeep(selectTransportRecording);
  const isLooping = useDeep(selectTransportLoop);
  const isStarted = state === "started";
  const isStopped = state === "stopped";
  const action = isStarted ? "Pause" : isStopped ? "Start" : "Resume";

  return (
    <div className="flex space-x-1.5 text-xl">
      <NavbarTooltipButton
        label="Stop the Timeline"
        className={classNames(
          !isStopped ? "bg-rose-700" : buttonColor,
          borderClass
        )}
        onClick={() => stopTransport()}
      >
        <BsStop className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={`${action} the Timeline`}
        className={classNames(
          isStarted ? "bg-emerald-600" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(toggleTransport())}
      >
        {isStarted ? <BsPause /> : <BsPlay className="pl-[3px] p-[1px]" />}
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={isRecording ? "Stop Recording to WAV" : "Record to WAV"}
        className={classNames(
          isRecording ? "bg-red-700/90" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(toggleTransportRecording())}
      >
        <BsRecord className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={isLooping ? "Stop Looping the Timeline" : "Loop the Timeline"}
        className={classNames(
          isLooping ? "bg-indigo-700 text-slate-20" : buttonColor,
          borderClass
        )}
        onClick={(e) => {
          if (!e.shiftKey) {
            dispatch(toggleTransportLoop());
          } else {
            promptUserForString({
              title: "Set the Loop Start and End",
              description: "Please enter the Start,End",
              callback: (value) => {
                const [_start, _end] = value.split(",");
                const startTicks = dispatch(convertStringToTicks(_start));
                const endTicks = dispatch(convertStringToTicks(_end));
                if (startTicks === undefined || endTicks === undefined) return;
                const start = sanitize(startTicks);
                const end = sanitize(endTicks);
                const undoType = createUndoType("loop", nanoid());
                dispatch(setTransportLoopStart({ data: start, undoType }));
                dispatch(setTransportLoopEnd({ data: end, undoType }));
              },
            })();
          }
        }}
      >
        <BsArrowRepeat className="p-[2px]" />
      </NavbarTooltipButton>
    </div>
  );
}

const buttonColor = "bg-slate-800";
const borderClass = "p-1.5 transition-all border border-slate-500";
