import { useRef, useEffect } from "react";
import { Sampler } from "tone";
import { Pitch, Tick } from "types/units";
import { EighthNoteTicks, QuarterNoteTicks } from "utils/durations";

interface MetronomeProps {
  active: boolean;
  pulse: Tick;
  time: Tick;
  pickup?: Tick;
}

const defaultMetronomeProps: MetronomeProps = {
  active: false,
  pulse: QuarterNoteTicks,
  time: 0,
  pickup: 0,
};

// Create and use a metronome using a Tone.js sampler
export function useMetronome(props = defaultMetronomeProps) {
  const metronome = useRef<Sampler>();
  const playNote = (pitch: Pitch) => {
    if (metronome.current === undefined) return;
    metronome.current.triggerAttack(pitch);
  };

  // Load the metronome sampler and store it in the ref
  useEffect(() => {
    const sampler = new Sampler({
      urls: { C4: "c4.wav" },
      baseUrl: `${window.location.origin}/harmonia/instruments/percussion/conga/`,
    });
    sampler.toDestination();
    metronome.current = sampler;
    return () => {
      if (sampler) sampler.dispose();
    };
  }, []);

  // Play the metronome based on the ticks
  useEffect(() => {
    const { active, pulse, time } = props;
    const buffer = props.pickup ?? 0;
    if (!active || metronome.current === undefined) return;

    // Play a C5 every quarter note during the pickup
    if (time <= buffer && time % QuarterNoteTicks === 0) {
      playNote("C5");
      return;
    }

    // Play a C6 every quarter note when recording
    const quarterPulse = Math.max(QuarterNoteTicks, pulse);
    if (time % quarterPulse === 0) {
      playNote("C6");
      return;
    }

    // Play a C7 every eighth note when recording
    const eighthPulse = Math.max(EighthNoteTicks, pulse);
    if (time % eighthPulse === 0) {
      playNote("C7");
    }
  }, [props.pickup, props.active, props.pulse, props.time]);
}
