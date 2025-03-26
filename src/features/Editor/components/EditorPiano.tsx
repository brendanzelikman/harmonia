// @ts-ignore
import { Piano, MidiNumbers } from "react-piano";
import { useEffect, useMemo } from "react";
import "react-piano/dist/styles.css";
import "lib/react-piano.css";
import { WebMidi } from "webmidi";
import { getMidiPitch, MidiScale } from "utils/midi";
import classNames from "classnames";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { Sampler } from "tone";
import { cancelEvent } from "utils/html";
import { ScaleObject } from "types/Scale/ScaleTypes";

interface PianoProps {
  sampler?: Sampler;
  className?: string;
  playNote?: (sampler: Sampler, midiNumber: number) => void;
  stopNote?: (sampler: Sampler, midiNumber: number) => void;
  show: boolean;
  noteRange?: readonly [string, string];
  midiScale?: MidiScale;
  scale?: ScaleObject;
  width?: number;
  keyWidthToHeight?: number;
}

export const EditorPiano: React.FC<PianoProps> = (props) => {
  const sampler = props.sampler ?? LIVE_AUDIO_INSTANCES.global?.sampler;
  const hasPlay = props.playNote !== undefined;
  const hasStop = props.stopNote !== undefined;

  const attackSamplerNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerAttack(pitch);
  };

  const releaseSamplerNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerRelease(pitch);
  };

  const playSamplerNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerAttackRelease(pitch, "4n");
  };

  const playNote = useMemo(() => {
    if (hasStop) return props.playNote ?? attackSamplerNote;
    return props.playNote ?? playSamplerNote;
  }, [props.playNote, hasStop]);

  const stopNote = useMemo(() => {
    if (hasPlay) return props.stopNote ?? releaseSamplerNote;
    return () => null;
  }, [props.stopNote, hasStop]);

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

  if (!props.show) return null;
  return (
    <div className={props.className} draggable onDragStart={cancelEvent}>
      <div className="w-full shrink-0 h-full bg-zinc-900">
        <Piano
          width={props.width}
          keyWidthToHeight={props.keyWidthToHeight}
          noteRange={{
            first: MidiNumbers.fromNote(props.noteRange?.[0] ?? "A0"),
            last: MidiNumbers.fromNote(props.noteRange?.[1] ?? "C8"),
          }}
          renderNoteLabel={({ midiNumber }: any) => {
            const className = classNames(
              "flex flex-col text-xs size-full justify-end items-center text-black"
            );
            return midiNumber % 12 === 0 ? (
              <div className={className}>
                <span>{MidiNumbers.getAttributes(midiNumber).note}</span>
              </div>
            ) : undefined;
          }}
          playNote={(midi: number) => playNote(sampler, midi)}
          stopNote={(midi: number) => stopNote(sampler, midi)}
        />
      </div>
    </div>
  );
};
