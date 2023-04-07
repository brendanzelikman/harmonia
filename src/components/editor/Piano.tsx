// @ts-ignore
import { Piano, MidiNumbers } from "react-piano";
import { useEffect, useState } from "react";
import "react-piano/dist/styles.css";
import { WebMidi } from "webmidi";
import { Sampler } from "tone";
import { MIDI } from "types/midi";
import { Track } from "types/tracks";
import { getGlobalSampler, getSampler } from "types/instrument";

const getTrackSampler = (trackId?: string) => {
  const globalSampler = getGlobalSampler();
  if (!trackId) return globalSampler;

  const trackSampler = getSampler(trackId);
  return trackSampler || globalSampler;
};

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
  track?: Track;
  className?: string;
  playNote?: (sampler: Sampler, midiNumber: number) => void;
  stopNote?: (sampler: Sampler, midiNumber: number) => void;
}

export default function EditorPiano(props: PianoProps) {
  const [sampler, setSampler] = useState<Sampler>(getGlobalSampler());
  const track = props.track;

  useEffect(() => {
    if (!track) return;
    setTimeout(() => {
      const sampler = getTrackSampler(track.id);
      setSampler(sampler);
    }, 100);
  }, [track]);

  const playNote = props.playNote ?? playSamplerNote;
  const stopNote = props.stopNote ?? releaseSamplerNote;

  // Synchronize with MIDI controller via WebMidi
  useEffect(() => {
    const onEnabled = () => {
      WebMidi.inputs.forEach((input) => {
        input.addListener("noteon", (e) => {
          playNote(sampler, e.note.number);
        });
      });
    };

    WebMidi.enable().then(onEnabled);
    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener();
      });
    };
  }, [sampler, attackSamplerNote, playNote, releaseSamplerNote]);

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
