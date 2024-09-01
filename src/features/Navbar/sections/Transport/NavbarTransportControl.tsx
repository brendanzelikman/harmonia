import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  BsStop,
  BsPause,
  BsPlay,
  BsRecord,
  BsArrowRepeat,
} from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { getTransportState } from "types/Transport/TransportFunctions";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  stopTransport,
  toggleTransport,
  toggleTransportRecording,
  toggleTransportLoop,
} from "types/Transport/TransportThunks";

export function NavbarTransportControl() {
  const dispatch = useProjectDispatch();

  // Analyze the transport
  const transport = useProjectSelector(selectTransport);
  const transportState = getTransportState(transport);
  const { isStarted, isStopped, isRecording, isLooping } = transportState;
  const buttonColor = "bg-slate-800";
  const borderClass = "border border-slate-500";

  // The stop button stops the transport
  const StopButton = (
    <NavbarTooltipButton
      label="Stop the Timeline"
      className={classNames(
        "p-1.5 transition-all",
        !isStopped ? "bg-rose-700" : buttonColor,
        isStopped ? "opacity-50 select-none" : "",
        borderClass
      )}
      disabled={isStopped}
      onClick={() => dispatch(stopTransport())}
    >
      <BsStop className="p-[1px]" />
    </NavbarTooltipButton>
  );

  // The toggle button plays or pauses the transport
  const ToggleButton = (
    <NavbarTooltipButton
      label={
        isStarted
          ? "Pause the Timeline"
          : !isStopped
          ? "Resume the Timeline"
          : "Start the Timeline"
      }
      className={classNames(
        "p-1.5 transition-all",
        isStarted ? "bg-emerald-600" : buttonColor,
        borderClass
      )}
      onClick={() => dispatch(toggleTransport())}
    >
      {isStarted ? <BsPause /> : <BsPlay className="pl-[3px] p-[1px]" />}
    </NavbarTooltipButton>
  );

  // The record button starts or stops recording the transport
  const RecordButton = (
    <NavbarTooltipButton
      label={isRecording ? "Stop Recording to WAV" : "Record to WAV"}
      className={classNames(
        "p-1.5 transition-all",
        isRecording ? "bg-red-700/90" : buttonColor,
        borderClass
      )}
      onClick={() => dispatch(toggleTransportRecording())}
    >
      <BsRecord className="p-[1px]" />
    </NavbarTooltipButton>
  );

  // The loop button toggles the loop state of the transport
  const LoopButton = (
    <NavbarTooltipButton
      label={isLooping ? "Stop Looping the Timeline" : "Loop the Timeline"}
      className={classNames(
        "p-1.5 transition-all",
        isLooping ? "bg-indigo-700 text-slate-20" : buttonColor,
        borderClass
      )}
      onClick={() => dispatch(toggleTransportLoop())}
    >
      <BsArrowRepeat className="p-[2px]" />
    </NavbarTooltipButton>
  );

  return (
    <div className="flex space-x-1.5 text-xl">
      {StopButton}
      {ToggleButton}
      {RecordButton}
      {LoopButton}
    </div>
  );
}
