import { useEffect, useMemo, useState } from "react";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTransport } from "redux/selectors";
import { Transport } from "tone";
import {
  isTransportPaused,
  isTransportStarted,
  isTransportStopped,
} from "types/Transport";
import { NavbarButton, NavbarButtonProps } from "../components";
import {
  BsStop,
  BsPause,
  BsPlay,
  BsArrowRepeat,
  BsRecord,
} from "react-icons/bs";
import {
  stopTransport,
  toggleTransport,
  toggleTransportLoop,
  toggleTransportRecording,
} from "redux/Transport";
import { useTransportTick } from "hooks";

export function NavbarTransport() {
  const dispatch = useProjectDispatch();
  const transport = useProjectSelector(selectTransport);
  const isStarted = isTransportStarted(transport);
  const isPaused = isTransportPaused(transport);
  const isStopped = isTransportStopped(transport);
  const isLooping = !!transport.loop;
  const isRecording = !!transport.recording;

  const tick = useTransportTick();
  const [displayedTime, setDisplayedTime] = useState("0:0:0");

  // Set the displayed time when the tick changes
  useEffect(() => {
    setDisplayedTime(Transport.position.toString());
  }, [tick]);

  // Get the appropriate class for the time input
  const timeClass = useMemo(() => {
    let color = "";
    if (isRecording) color = "text-red-50 border-red-500";
    else if (isStarted) color = "text-gray-50 border-emerald-400";
    else if (isPaused) color = "text-gray-100 border-slate-300";
    else color = "text-gray-300 border-slate-500";
    return `${color} font-light block px-2 py-1.5 w-32 text-md bg-transparent rounded-lg border appearance-none focus:border-fuchsia-500 focus:outline-none focus:ring-0 peer`;
  }, [isStarted, isPaused, isRecording]);

  /**
   * The time is displayed in bars:beats:sixteenths within a disabled form.
   */
  const Timer = () => (
    <div className="relative">
      <input id="timer" className={timeClass} value={displayedTime} disabled />
      <label
        htmlFor="timer"
        className={`absolute text-xs duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1.5`}
      >
        Tick: {tick}
      </label>
    </div>
  );

  /**
   * Each transport button has a gradient background and a label.
   */

  const TransportButton = (props: NavbarButtonProps) => (
    <NavbarButton
      {...props}
      className={`w-10 h-10 border border-slate-500 rounded-full ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </NavbarButton>
  );
  const buttonColor = "bg-slate-800";

  /** The transport controls consists of four buttons:
   * * The stop button sets the transport position to 0:0:0
   * * The play/pause button toggles the transport state
   * * The record button toggles the recording state
   * * The loop button toggles the loop state
   */
  const TransportControls = useMemo(() => {
    const stopColor = !isStopped ? "bg-rose-700" : buttonColor;
    const toggleColor = isStarted ? "bg-emerald-600" : buttonColor;
    const recordColor = isRecording ? "bg-red-700/90" : buttonColor;
    const loopColor = isLooping ? "bg-indigo-700" : buttonColor;

    return () => (
      <div className="flex space-x-1.5 text-xl">
        <TransportButton
          label="Stop"
          className={stopColor}
          onClick={() => dispatch(stopTransport())}
        >
          <BsStop />
        </TransportButton>
        <TransportButton
          label={isStarted ? "Pause" : "Play"}
          className={toggleColor}
          onClick={() => dispatch(toggleTransport())}
        >
          {isStarted ? <BsPause /> : <BsPlay className="pl-[2px]" />}
        </TransportButton>
        <TransportButton
          label="Record"
          className={recordColor}
          onClick={() => dispatch(toggleTransportRecording())}
        >
          <BsRecord />
        </TransportButton>
        <TransportButton
          label="Loop"
          onClick={() => dispatch(toggleTransportLoop())}
          className={loopColor}
        >
          <BsArrowRepeat />
        </TransportButton>
      </div>
    );
  }, [isStarted, isStopped, isRecording, isLooping]);

  return (
    <div className="flex items-center space-x-3">
      <Timer />
      <TransportControls />
    </div>
  );
}
