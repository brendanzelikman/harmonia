import { Piano } from "components/Piano";
import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { useCallback, useRef } from "react";

interface InstrumentEditorPianoProps {
  id: InstrumentId;
  startPlaying: () => void;
  stopPlaying: () => void;
}

export const InstrumentEditorPiano = (props: InstrumentEditorPianoProps) => {
  const instance = LIVE_AUDIO_INSTANCES[props.id];

  // A timer is used so that the piano stops playing after a delay
  const stopTimer = useRef<NodeJS.Timeout | null>(null);
  const clearTimer = () => {
    if (!stopTimer.current) return;
    clearTimeout(stopTimer.current);
    stopTimer.current = null;
  };

  /** Attack the note with the instrument */
  const playNote = useCallback((sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerAttack(pitch);

    // Start playing after a delay
    setTimeout(() => {
      clearTimer();
      props.startPlaying();
    }, 100);
  }, []);

  /** Release the note with the instrument */
  const stopNote = useCallback((sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerRelease(pitch);

    // Try to stop playing after a delay
    clearTimer();
    setTimeout(() => {
      stopTimer.current = setTimeout(() => {
        props.stopPlaying();
        clearTimer();
      }, 200);
    });
  }, []);

  return (
    <Piano
      {...props}
      show
      className="h-48"
      sampler={instance?.sampler}
      playNote={playNote}
      stopNote={stopNote}
    />
  );
};
