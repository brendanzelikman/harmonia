import { useEffect, useState } from "react";
import { convertTicksToSeconds } from "redux/slices/transport";
import { Duration, MIDI, Tick, Transport, defaultTransport } from "types";
import { durationToTicks } from "utils";
import useAnimationFrame from "./useAnimationFrame";
import useMetronome from "./useMetronome";
import { WebMidi } from "webmidi";

interface RecorderProps {
  transport: Transport;
  duration?: Tick;
  pickup?: Tick;
  quantization?: Duration;
  muteMetronome?: boolean;
  callback?: (startTime: Tick) => void;
}

const defaultProps = {
  transport: defaultTransport,
  duration: MIDI.WholeNoteTicks,
  pickup: MIDI.WholeNoteTicks,
  quantization: "eighth",
  muteMetronome: false,
};

export default function useRecorder(props: RecorderProps = defaultProps) {
  const duration = props.duration ?? defaultProps.duration;
  const pickup = props.pickup ?? defaultProps.pickup;
  const quantization = props.quantization ?? defaultProps.quantization;

  const [recording, setRecording] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [ticks, setTicks] = useState(0);

  const pulse = Math.min(durationToTicks(quantization), MIDI.QuarterNoteTicks);
  const pulseTime = convertTicksToSeconds(props.transport, pulse);
  const pulseInterval = pulseTime * 1000;

  const pickupTime = convertTicksToSeconds(props.transport, pickup);
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
