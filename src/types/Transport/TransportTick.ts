import { useEvent } from "hooks/useEvent";
import { useState } from "react";

import { Tick } from "types/units";
import { getBarsBeatsSixteenths } from "utils/duration";
import { dispatchCustomEvent } from "utils/event";
import * as Tone from "tone";
import { Thunk } from "types/Project/ProjectTypes";
import { Payload } from "types/redux";
import { selectSubdivisionTicks } from "types/Timeline/TimelineSelectors";
import { startTransport } from "./TransportState";

// --------------------------------------------------------------
// Events
// --------------------------------------------------------------

const UPDATE_TICK_NUMBER = "updateTickNumber";
const UPDATE_TICK_STRING = "updateTickString";
const UPDATE_OFFLINE_TICK = "updateOfflineTick";

/** Dispatch a tick as a number and as a string. */
export const dispatchTick = (tick: Tick) => {
  dispatchCustomEvent(UPDATE_TICK_NUMBER, tick);
  dispatchCustomEvent(UPDATE_TICK_STRING, getBarsBeatsSixteenths(tick).string);
  window.localStorage.setItem("tick", tick.toString());
};

/** Try to read the tick from local storage. */
export const readTick = () => {
  const tick = window.localStorage.getItem("tick");
  return tick ? Number(tick) : Tone.getTransport().ticks;
};

// --------------------------------------------------------------
// Hooks
// --------------------------------------------------------------

/** Get the current tick using a custom event listener */
export function useTick() {
  const [tick, setTick] = useState(0);
  useEvent(UPDATE_TICK_NUMBER, (e) => setTick(Math.round(e.detail)));
  return tick;
}

/** Get the current tick string using a custom event listener */
export function useTickString() {
  const [string, setString] = useState("0:0:0");
  useEvent(UPDATE_TICK_STRING, (e) => setString(e.detail));
  return string;
}

/** Get the current offline tick using a custom event listener */
export function useOfflineTick() {
  const [tick, setTick] = useState(0);
  useEvent(UPDATE_OFFLINE_TICK, (e) => setTick(e.detail));
  return tick;
}

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

/** Seek the transport to the given tick. */
export const seekTransport =
  ({ data }: Payload<Tick>): Thunk =>
  (dispatch) => {
    const tick = Math.round(data);
    if (tick < 0) return;
    const started = Tone.getTransport().state === "started";
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    Tone.getTransport().ticks = tick;
    dispatchTick(tick);
    if (started) dispatch(startTransport());
  };

/** Move the playhead of the transport one tick left. */
export const seekTransportLeft =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    const value = amount ?? ticks;
    dispatch(seekTransport({ data: Tone.getTransport().ticks - value }));
  };

/** Move the playhead of the transport one tick right. */
export const seekTransportRight =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    const value = amount ?? ticks;
    dispatch(seekTransport({ data: Tone.getTransport().ticks + value }));
  };

/** Dispatch an event to update the download tick. */
export const dispatchDownloadTickEvent = (tick: Tick) => {
  dispatchCustomEvent(UPDATE_OFFLINE_TICK, tick);
};
