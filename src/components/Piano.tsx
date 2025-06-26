// @ts-ignore
import { Piano as ReactPiano, MidiNumbers } from "react-piano";
import { useCallback, useMemo, useState } from "react";
import "react-piano/dist/styles.css";
import "./Piano.css";
import { getMidiPitch, MidiScale } from "utils/midi";
import classNames from "classnames";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { Sampler } from "tone";
import { cancelEvent } from "utils/event";
import { ScaleObject } from "types/Scale/ScaleTypes";
import { useAppValue } from "hooks/useRedux";
import { selectIsEditingTracks } from "types/Timeline/TimelineSelectors";
import { useToggle } from "hooks/useToggle";

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
  overrideHotkeys?: boolean;
}

export const Piano: React.FC<PianoProps> = (props) => {
  const sampler = props.sampler ?? LIVE_AUDIO_INSTANCES.global?.sampler;
  const hasPlay = props.playNote !== undefined;
  const hasStop = props.stopNote !== undefined;
  const onKeyboard = useToggle("keyboard").isOpen;

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

  // Hotkeys for inputting sampler notes
  const onEditor = useAppValue(selectIsEditingTracks);
  const override = !!props.overrideHotkeys;
  const [octave, setOctave] = useState(5);
  const increaseOctave = useCallback(() => {
    setOctave((prev) => Math.min(prev + 1, 8));
  }, []);
  const decreaseOctave = useCallback(() => {
    setOctave((prev) => Math.max(prev - 1, 1));
  }, []);
  const keyboardShortcuts = useMemo(() => {
    if (!onKeyboard || (onEditor && !override)) return [];
    const keys = [
      "a",
      "w",
      "s",
      "e",
      "d",
      "f",
      "t",
      "g",
      "y",
      "h",
      "u",
      "j",
      "k",
      "o",
      "l",
    ];
    return keys.map((key, i) => ({
      key,
      midiNumber: octave * 12 + i,
    }));
  }, [octave, onKeyboard, onEditor, override]);

  if (!props.show) return null;
  return (
    <div className={props.className} draggable onDragStart={cancelEvent}>
      <div className="w-full shrink-0 h-full bg-zinc-900">
        <ReactPiano
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
          keyboardShortcuts={keyboardShortcuts}
        />
      </div>
    </div>
  );
};
