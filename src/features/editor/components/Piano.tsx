// @ts-ignore
import { Piano, MidiNumbers } from "react-piano";
import { useEffect, useMemo } from "react";
import "react-piano/dist/styles.css";
import { WebMidi } from "webmidi";
import { Sampler } from "tone";
import { MIDI } from "types/midi";

import { getGlobalSampler } from "types/instrument";

const attackSamplerNote = (sampler: Sampler, midiNumber: number) => {
  if (!sampler?.loaded || sampler?.disposed) return;
  const pitch = MIDI.toPitch(midiNumber);
  sampler.triggerAttack(pitch);
};

const releaseSamplerNote = (sampler: Sampler, midiNumber: number) => {
  if (!sampler?.loaded || sampler?.disposed) return;
  const pitch = MIDI.toPitch(midiNumber);
  sampler.triggerRelease(pitch);
};

const playSamplerNote = (sampler: Sampler, midiNumber: number) => {
  if (!sampler?.loaded || sampler?.disposed) return;
  const pitch = MIDI.toPitch(midiNumber);
  sampler.triggerAttackRelease(pitch, "4n");
};

interface PianoProps {
  sampler?: Sampler | null;
  className?: string;
  playNote?: (sampler: Sampler, midiNumber: number) => void;
  stopNote?: (sampler: Sampler, midiNumber: number) => void;
}

export function EditorPiano(props: PianoProps) {
  const sampler = props.sampler ?? getGlobalSampler();

  const hasPlay = props.playNote !== undefined;
  const hasStop = props.stopNote !== undefined;

  const playNote = useMemo(() => {
    if (hasStop) return props.playNote ?? attackSamplerNote;
    return props.playNote ?? playSamplerNote;
  }, [props.playNote, props.stopNote]);

  const stopNote = useMemo(() => {
    if (hasPlay) return props.stopNote ?? releaseSamplerNote;
    return () => null;
  }, [props.playNote, props.stopNote]);

  // Synchronize with MIDI controller via WebMidi
  useEffect(() => {
    // Attach a listener to each MIDI input
    const onEnabled = () => {
      WebMidi.inputs.forEach((input) => {
        input.addListener("noteon", (e) => {
          playNote(sampler, e.note.number);
        });
        input.addListener("noteoff", (e) => {
          stopNote(sampler, e.note.number);
        });
      });
    };
    WebMidi.enable().then(onEnabled);
    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener();
      });
    };
  }, [sampler, playNote, stopNote]);

  return (
    <div className={`h-40 flex-shrink-0 ${props.className ?? ""}`}>
      <div className="w-full h-full bg-zinc-900">
        <Piano
          noteRange={{
            first: MidiNumbers.fromNote("C1"),
            last: MidiNumbers.fromNote("C8"),
          }}
          playNote={(midi: number) => playNote(sampler, midi)}
          stopNote={(midi: number) => stopNote(sampler, midi)}
        />
      </div>
    </div>
  );
}
