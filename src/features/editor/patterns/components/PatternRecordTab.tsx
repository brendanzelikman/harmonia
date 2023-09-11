import { BsFillRecordCircleFill, BsSoundwave } from "react-icons/bs";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebMidi, Input, NoteMessageEvent } from "webmidi";
import { MIDI } from "types/midi";
import { durationToTicks, ticksToToneSubdivision } from "utils";
import { Note, Tick } from "types/units";
import { Time } from "tone";
import { convertSecondsToTicks } from "redux/slices/transport";
import { Transition } from "@headlessui/react";
import useRecorder from "hooks/useRecorder";

interface PatternRecordTabProps extends PatternEditorCursorProps {
  input: Input | undefined;
  setInput: (input: Input) => void;
}

export function PatternRecordTab(props: PatternRecordTabProps) {
  // Recording information
  const [events, setEvents] = useState<NoteMessageEvent[]>([]);
  const canRecord = props.input !== undefined && props.isCustom;
  const quantization = durationToTicks(props.recordingQuantization);

  const recordingCallback = (startTime: Tick) => {
    // Map each event to a properly timed note
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
    const pulses = Math.floor(props.recordingDuration / quantization);
    const stream = new Array(pulses).fill(0).map((_, i) => {
      const notes = tickMap[i * quantization] ?? [MIDI.Rest];
      return notes.map((note) => ({
        duration: quantization,
        MIDI: note,
        velocity: MIDI.DefaultVelocity,
      }));
    });

    // Add notes to pattern
    setEvents([]);
    if (props.pattern) props.updatePattern({ ...props.pattern, stream });
  };

  // Use recorder hook
  const { recording, startRecording, stopRecording, ticks, isAfterPickup } =
    useRecorder({
      transport: props.transport,
      duration: props.recordingDuration,
      quantization: props.recordingQuantization,
      callback: recordingCallback,
    });

  // Add input listener
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

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
      setEvents([]);
    } else {
      startRecording();
      props.clear();
    }
  };

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

  const RecordingDurationField = () => {
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
    const defaultValue = MIDI.WholeNoteTicks;
    const value = props.recordingDuration ?? defaultValue;

    return (
      <div className="flex text-xs items-center">
        <label className="px-1">Duration:</label>
        <Editor.CustomListbox
          value={value}
          setValue={props.setRecordingDuration}
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

  const RecordingQuantizationField = () => {
    const defaultValue = "eighth";
    const value = props.recordingQuantization ?? defaultValue;
    return (
      <div className="flex text-xs items-center">
        <label className="px-1">Quantize:</label>
        <Editor.DurationListbox
          value={value}
          setValue={props.setRecordingQuantization}
          className="px-1"
          borderColor={"border-emerald-500/80"}
        />
      </div>
    );
  };

  const RecordButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips && canRecord}
      content={`${recording ? "Stop Recording" : "Start Recording"}`}
    >
      <Editor.MenuButton
        className={`p-1 ${
          recording
            ? isAfterPickup
              ? "text-red-500"
              : "text-red-300"
            : canRecord
            ? "hover:bg-red-500"
            : ""
        }`}
        disabled={!canRecord}
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
        <RecordingDurationField />
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
