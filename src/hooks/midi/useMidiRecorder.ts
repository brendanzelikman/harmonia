import { useEffect, useState } from "react";
import {
  DurationType,
  QuarterNoteTicks,
  WholeNoteTicks,
  getDurationTicks,
  ticksToSeconds,
} from "utils/durations";
import { useAnimationFrame } from "../window/useAnimationFrame";
import { useMetronome } from "./useMetronome";
import { WebMidi } from "webmidi";
import { defaultTransport } from "types/Transport";
import { Tick } from "types/units";

interface RecorderProps {
  bpm?: number;
  duration?: Tick;
  pickup?: Tick;
  quantization?: DurationType;
  muteMetronome?: boolean;
  callback?: (startTime: Tick) => void;
}

const defaultProps = {
  bpm: defaultTransport.bpm,
  duration: WholeNoteTicks,
  pickup: WholeNoteTicks,
  quantization: "eighth" as DurationType,
  muteMetronome: false,
};

export function useMidiRecorder(props: RecorderProps = defaultProps) {
  const bpm = props.bpm ?? defaultProps.bpm;
  const duration = props.duration ?? defaultProps.duration;
  const pickup = props.pickup ?? defaultProps.pickup;
  const quantization = props.quantization ?? defaultProps.quantization;

  const [recording, setRecording] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [ticks, setTicks] = useState(0);

  const pulse = Math.min(getDurationTicks(quantization), QuarterNoteTicks);
  const pulseTime = ticksToSeconds(pulse, bpm);
  const pulseInterval = pulseTime * 1000;

  const pickupTime = ticksToSeconds(pickup, bpm);
  const pickupInterval = pickupTime * 1000;

  const startRecording = () => {
    setRecording(true);
    setStartTime(WebMidi.time + pickupInterval);
  };
  const stopRecording = () => {
    setRecording(false);
    setTicks(0);
  };

  useAnimationFrame(
    () => setTicks((prev) => prev + pulse),
    pulseInterval,
    recording
  );

  useMetronome({
    active: props.muteMetronome ? false : recording,
    time: ticks,
    pulse,
    pickup,
  });

  const isAfterPickup = recording && ticks >= pickup;
  const isFinished = recording && ticks >= duration + pickup;

  // Execute the callback when the recording is finished
  useEffect(() => {
    if (isFinished) {
      props.callback?.(startTime);
      stopRecording();
    }
  }, [isFinished, startTime]);

  return {
    recording,
    startRecording,
    stopRecording,
    ticks,
    startTime,
    isAfterPickup,
  };
}
