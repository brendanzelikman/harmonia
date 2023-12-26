import { BsFillRecordCircleFill, BsSoundwave } from "react-icons/bs";
import { PatternEditorProps } from "../PatternEditor";
import * as Listbox from "features/Editor/components/EditorListbox";
import { useCallback, useEffect, useState } from "react";
import { WebMidi, NoteMessageEvent } from "webmidi";
import {
  DurationType,
  QuarterNoteTicks,
  WholeNoteTicks,
  getDurationSubdivision,
  getDurationTicks,
  ticksToSeconds,
} from "utils/durations";
import { MIDI, Tick } from "types/units";
import { Time } from "tone";
import { Transition } from "@headlessui/react";
import { useMidiRecorder } from "hooks";
import { secondsToTicks } from "utils/durations";
import { DEFAULT_VELOCITY } from "utils/constants";
import { useProjectSelector } from "redux/hooks";
import { selectTransportBPM } from "redux/Transport";
import { updatePattern } from "redux/Pattern";
import { PatternStream } from "types/Pattern";
import { Editor } from "features/Editor/components";
import {
  setEditorRecordingLength,
  setEditorRecordingQuantization,
} from "redux/Editor";

export function PatternEditorRecordTab(props: PatternEditorProps) {
  const { dispatch, pattern, midiInput, setMidiInput, Tooltip } = props;
  const recordingSettings = props.settings.recording;
  const { quantization } = recordingSettings;
  const quantTicks = getDurationTicks(quantization);

  // Recording information
  const bpm = useProjectSelector(selectTransportBPM);
  const [events, setEvents] = useState<NoteMessageEvent[]>([]);
  const canRecord = props.isCustom;

  const recordingCallback = (startTime: Tick) => {
    // Map each event to a properly timed note
    const timedEvents = events.map((event) => {
      const latency = 50;
      const diff = event.timestamp - startTime - latency;
      const subdivision = getDurationSubdivision(quantization);
      const duration = Math.max(0, diff) / 1000;
      const time = Time(duration).quantize(subdivision);
      const ticks = secondsToTicks(time, bpm);
      return {
        ...event,
        time,
        ticks,
      };
    });

    // Add notes to tick map
    const tickMap: Record<number, MIDI[]> = {};
    timedEvents.forEach((event) => {
      const key = event.ticks;
      if (!tickMap[key]) tickMap[key] = [];
      tickMap[key].push(event.note.number);
    });

    // Add notes to pulse array
    const pulses = Math.floor(ticks / quantTicks);
    const stream: PatternStream = new Array(pulses).fill(0).map((_, i) => {
      const notes = tickMap[i * quantTicks];
      return notes.map((note) => ({
        duration: quantTicks,
        MIDI: note,
        velocity: DEFAULT_VELOCITY,
      }));
    });

    // Add notes to pattern
    setEvents([]);
    if (props.pattern && stream) {
      dispatch(updatePattern({ ...props.pattern, stream }));
    }
  };

  // Use recorder hook
  const { recording, startRecording, stopRecording, ticks, isAfterPickup } =
    useMidiRecorder({
      bpm,
      duration: props.settings.recording.ticks,
      quantization: props.settings.recording.quantization,
      callback: recordingCallback,
    });

  // Add input listener
  useEffect(() => {
    const inputNote = (e: NoteMessageEvent) => {
      setEvents((prev) => [...prev, e]);
    };
    if (recording) midiInput?.addListener("noteon", inputNote);
    return () => {
      if (midiInput?.hasListener("noteon", inputNote)) {
        midiInput.removeListener("noteon", inputNote);
      }
    };
  }, [midiInput, recording]);

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
      setEvents([]);
    } else {
      startRecording();
      if (!pattern) return;
      dispatch(updatePattern({ ...pattern, stream: [] as PatternStream }));
    }
  };

  const RecordingInputField = useCallback(
    () => (
      <div className="flex text-xs justify-center items-center">
        <label className="px-1">Input:</label>
        <div className="relative flex w-full h-full">
          <Transition
            show={canRecord && midiInput !== undefined}
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
                className="absolute w-[20rem] h-[20rem] left-[-5rem] top-[-5rem] animate-[rotate_5s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(#fd004c, #fe9000, #fff020, #3edf4b, #3363ff, #b102b7, #fd004c)",
                }}
              ></div>
            </div>
          </Transition>
          <Editor.CustomListbox
            value={midiInput}
            setValue={setMidiInput}
            getOptionKey={(i) => i.id}
            getOptionName={(i) => i.name}
            icon={<BsSoundwave className="mr-2" />}
            options={WebMidi.inputs}
            placeholder="Change MIDI Input"
            className="px-1"
            borderColor={
              canRecord && midiInput !== undefined
                ? "border-black/0"
                : "border-slate-500/50"
            }
          />
        </div>
      </div>
    ),
    [canRecord, midiInput, setMidiInput]
  );

  const RecordingDurationField = () => {
    const options = [
      WholeNoteTicks,
      2 * WholeNoteTicks,
      4 * WholeNoteTicks,
      8 * WholeNoteTicks,
    ];
    const optionNames = {
      [WholeNoteTicks]: "One Measure",
      [2 * WholeNoteTicks]: "Two Measures",
      [4 * WholeNoteTicks]: "Four Measures",
      [8 * WholeNoteTicks]: "Eight Measures",
    };
    const defaultValue = WholeNoteTicks;
    const value = recordingSettings.ticks ?? defaultValue;

    return (
      <div className="flex text-xs items-center">
        <label className="px-1">Duration:</label>
        <Editor.CustomListbox
          value={value}
          setValue={(value: Tick) => dispatch(setEditorRecordingLength(value))}
          options={options}
          getOptionName={(i) => optionNames[i]}
          icon={<BsSoundwave className="mr-2" />}
          placeholder="Change Length"
          className="px-1"
        />
      </div>
    );
  };

  const RecordingQuantizationField = () => {
    const defaultValue = "eighth";
    const value = recordingSettings.quantization ?? defaultValue;
    return (
      <div className="flex text-xs items-center">
        <label className="px-1">Quantize:</label>
        <Listbox.DurationListbox
          value={value}
          setValue={(value: DurationType) =>
            dispatch(setEditorRecordingQuantization(value))
          }
          className="px-1"
        />
      </div>
    );
  };

  const RecordButton = () => (
    <Tooltip content={`${recording ? "Stop Recording" : "Start Recording"}`}>
      <Editor.Button
        className={`p-1 ${
          recording ? (isAfterPickup ? "text-red-400" : "text-red-200") : ""
        }`}
        onClick={() => toggleRecording()}
      >
        Record <BsFillRecordCircleFill className="text-lg ml-2 p-0.5" />
      </Editor.Button>
    </Tooltip>
  );

  const seconds = ticksToSeconds(ticks, bpm);
  const bar = ticksToSeconds(WholeNoteTicks, bpm);
  const quart = ticksToSeconds(QuarterNoteTicks, bpm);
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
    <Editor.Tab show={props.isCustom}>
      <Editor.TabGroup border={true}>
        <RecordingDurationField />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <RecordingQuantizationField />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <RecordingInputField />
      </Editor.TabGroup>
      <Editor.TabGroup border={false}>
        <RecordButton />
        <BeatCount />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
