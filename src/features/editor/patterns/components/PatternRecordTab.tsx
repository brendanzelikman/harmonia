import { BsFillRecordCircleFill, BsSoundwave } from "react-icons/bs";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebMidi, Input, NoteMessageEvent } from "webmidi";
import { MIDI } from "types/midi";
import { durationToTicks, ticksToToneSubdivision } from "utils";
import { Note } from "types/units";
import { Sampler, Time } from "tone";
import {
  convertSecondsToTicks,
  convertTicksToSeconds,
} from "redux/slices/transport";
import { Transition } from "@headlessui/react";

interface PatternRecordTabProps extends PatternEditorCursorProps {
  input: Input | undefined;
  setInput: (input: Input) => void;
}

export function PatternRecordTab(props: PatternRecordTabProps) {
  // Recording information
  const [recording, setRecording] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [events, setEvents] = useState<NoteMessageEvent[]>([]);
  const [ticks, setTicks] = useState(0);
  const metronome = useRef<Sampler>();
  const animation = useRef<number>();
  const previousTime = useRef<number>();
  const canRecord = props.input !== undefined && props.isCustom;

  const cancelRecording = () => {
    setRecording(false);
    setTicks(0);
    setEvents([]);
    if (animation.current !== undefined) {
      cancelAnimationFrame(animation.current);
    }
    animation.current = undefined;
    previousTime.current = undefined;
  };

  const toggleRecording = () =>
    recording ? cancelRecording() : setRecording(true);

  useEffect(() => {
    const sampler = new Sampler({
      urls: { C4: "c4.wav" },
      baseUrl: `${window.location.origin}/harmonia/samples/percussion/conga/`,
    });
    sampler.toDestination();
    metronome.current = sampler;
    return () => {
      if (sampler) sampler.dispose();
    };
  }, []);

  useEffect(() => {
    const inputNote = (e: NoteMessageEvent) => {
      setEvents((prev) => [...prev, e]);
    };
    if (recording) props.input?.addListener("noteon", inputNote);
    return () => {
      if (props.input?.hasListener("noteon", inputNote)) {
        props.input.removeListener("noteon", inputNote);
      }
    };
  }, [props.input, recording]);

  const quantization = durationToTicks(props.recordingQuantization);
  const tickIncrement = Math.min(quantization, MIDI.QuarterNoteTicks);
  const tickTime = convertTicksToSeconds(props.transport, tickIncrement);

  const bufferTicks = MIDI.WholeNoteTicks;
  const bufferTime = convertTicksToSeconds(props.transport, bufferTicks);
  const pastBuffer = recording && ticks >= bufferTicks;

  const pulses = props.recordingLength / quantization;
  const interval = tickTime * 1000;

  function animateRecording(time: DOMHighResTimeStamp) {
    // If there is a current time
    if (previousTime.current !== undefined) {
      // Go to the next frame if the change in time is less than the interval
      const deltaTime = time - previousTime.current;

      // Update animation callback
      if (deltaTime < interval) {
        animation.current = requestAnimationFrame(animateRecording);
        return;
      } else {
        setTicks((prev) => prev + tickIncrement);
      }
    }
    // Otherwise, increment the ticks
    previousTime.current = time;

    // Request next frame
    if (recording) {
      animation.current = requestAnimationFrame(animateRecording);
    }
  }

  // Start and stop timer
  useEffect(() => {
    if (recording) {
      setStartTime(WebMidi.time + bufferTime * 1000);
      previousTime.current = undefined;
      animation.current = requestAnimationFrame(animateRecording);
    } else {
      cancelRecording();
    }
    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
    };
  }, [recording]);

  // Play metronome
  useEffect(() => {
    if (!recording || metronome.current === undefined) return;

    if (ticks <= bufferTicks) {
      if (ticks % MIDI.QuarterNoteTicks === 0) {
        metronome.current.triggerAttack("C5");
      }
    } else {
      if (ticks % Math.max(MIDI.QuarterNoteTicks, tickIncrement) === 0) {
        metronome.current.triggerAttack("C6");
      } else if (ticks % Math.max(MIDI.EighthNoteTicks, tickIncrement) === 0) {
        metronome.current.triggerAttack("C7");
      }
    }
  }, [recording, ticks, bufferTicks]);

  // Stop recording when ticks are over limit
  useEffect(() => {
    if (recording && ticks >= bufferTicks + props.recordingLength) {
      // Parse inputted notes

      const timedEvents = events.map((event) => {
        const latency = 50;
        const diff = event.timestamp - startTime - latency;

        const subdivision = ticksToToneSubdivision(quantization);
        const duration = Math.max(0, diff) / 1000;
        const time = Time(duration).quantize(subdivision);
        const ticks = convertSecondsToTicks(props.transport, time);
        return {
          ...event,
          time,
          ticks,
        };
      });

      // Add notes to tick map
      const tickMap: Record<number, Note[]> = {};
      timedEvents.forEach((event) => {
        const key = event.ticks;
        if (!tickMap[key]) tickMap[key] = [];
        tickMap[key].push(event.note.number);
      });

      // Add notes to pulse array
      const stream = new Array(pulses).fill(0).map((_, i) => {
        const notes = tickMap[i * quantization] ?? [MIDI.Rest];
        return notes.map((note) => ({
          duration: quantization,
          MIDI: note,
          velocity: MIDI.DefaultVelocity,
        }));
      });

      // Add notes to pattern
      cancelRecording();
      if (props.pattern) props.updatePattern({ ...props.pattern, stream });
    }
  }, [ticks, events, startTime, props.recordingLength, props.transport.bpm]);

  const RecordingInputField = useCallback(
    () => (
      <div className="flex text-xs justify-center items-center">
        <label className="px-1">Input:</label>
        <div className="relative flex w-full h-full">
          <Transition
            show={canRecord}
            enter="transition-all duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            as="div"
            className="w-full h-full absolute py-[3px] px-0.5"
          >
            <div className="w-full h-full relative overflow-hidden rounded">
              <div
                className="absolute w-[20rem] h-[20rem] left-[-5rem] top-[-5rem] animate-[s_5s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(#fd004c, #fe9000, #fff020, #3edf4b, #3363ff, #b102b7, #fd004c)",
                }}
              ></div>
            </div>
          </Transition>
          <Editor.CustomListbox
            value={props.input}
            setValue={props.setInput}
            getOptionKey={(i) => i.id}
            getOptionName={(i) => i.name}
            getOptionValue={(i) => i}
            icon={<BsSoundwave className="mr-2" />}
            options={WebMidi.inputs}
            placeholder="Change MIDI Input"
            className="px-1"
            borderColor={canRecord ? "border-black/0" : "border-slate-500/50"}
            backgroundColor="bg-slate-800"
          />
        </div>
      </div>
    ),
    [canRecord, props.input, props.setInput]
  );

  const RecordingLengthField = () => {
    const options = [
      MIDI.WholeNoteTicks,
      2 * MIDI.WholeNoteTicks,
      4 * MIDI.WholeNoteTicks,
      8 * MIDI.WholeNoteTicks,
    ];
    const optionNames = {
      [MIDI.WholeNoteTicks]: "One Measure",
      [2 * MIDI.WholeNoteTicks]: "Two Measures",
      [4 * MIDI.WholeNoteTicks]: "Four Measures",
      [8 * MIDI.WholeNoteTicks]: "Eight Measures",
    };

    return (
      <div className="flex text-xs items-center">
        <label className="px-1">Duration:</label>
        <Editor.CustomListbox
          value={props.recordingLength}
          setValue={props.setRecordingLength}
          options={options}
          getOptionKey={(i) => i}
          getOptionName={(i) => optionNames[i]}
          getOptionValue={(i) => i}
          icon={<BsSoundwave className="mr-2" />}
          placeholder="Change Length"
          className="px-1"
          borderColor={"border-emerald-500/80"}
        />
      </div>
    );
  };

  const RecordingQuantizationField = () => (
    <div className="flex text-xs items-center">
      <label className="px-1">Quantize:</label>
      <Editor.DurationListbox
        value={props.recordingQuantization}
        setValue={props.setRecordingQuantization}
        className="px-1"
        borderColor={"border-emerald-500/80"}
      />
    </div>
  );

  const RecordButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Record Pattern">
      <Editor.MenuButton
        className={`p-1 ${
          recording
            ? pastBuffer
              ? "text-red-500"
              : "text-red-300"
            : canRecord
            ? "hover:bg-red-500"
            : ""
        }`}
        disabled={props.input === undefined || !props.isCustom}
        disabledClass="px-1"
        onClick={() => toggleRecording()}
      >
        <BsFillRecordCircleFill className="text-lg p-0.5" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const seconds = MIDI.ticksToSeconds(ticks, props.transport.bpm);
  const bar = MIDI.ticksToSeconds(MIDI.WholeNoteTicks, props.transport.bpm);
  const quart = MIDI.ticksToSeconds(MIDI.QuarterNoteTicks, props.transport.bpm);
  const beats = (seconds % bar) / quart;

  const BeatCount = () => {
    const isFirstBeat = beats >= 0;
    const isSecondBeat = beats >= 1;
    const isThirdBeat = beats >= 2;
    const isFourthBeat = beats >= 3;
    return ticks > 0 ? (
      <div className="px-1 h-full flex items-center justify-center text-slate-200 text-lg">
        {isFirstBeat ? "•" : ""}
        {isSecondBeat ? "•" : ""}
        {isThirdBeat ? "•" : ""}
        {isFourthBeat ? "•" : ""}
      </div>
    ) : null;
  };

  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <RecordingLengthField />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <RecordingQuantizationField />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <RecordingInputField />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false}>
        <RecordButton />
        <BeatCount />
      </Editor.MenuGroup>
    </div>
  );
}
