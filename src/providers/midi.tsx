import { createContext, useEffect, useState } from "react";
import { WebMidi, Input, Output } from "webmidi";

interface MIDIContextProps {
  midiInputs: Input[];
  midiOutputs: Output[];
  selectedInput: Input | undefined;
  selectedOutput: Output | undefined;
  setSelectedInput: (input: Input) => void;
  setSelectedOutput: (output: Output) => void;
}
export const MIDIContext = createContext<MIDIContextProps>({
  midiInputs: [],
  midiOutputs: [],
  selectedInput: undefined,
  selectedOutput: undefined,
  setSelectedInput: () => {},
  setSelectedOutput: () => {},
});

export const MIDIProvider = ({ children }: { children: any }) => {
  const [midiInputs, setMidiInputs] = useState<Input[]>([]);
  const [midiOutputs, setMidiOutputs] = useState<Output[]>([]);
  const [selectedInput, setSelectedInput] = useState<Input>();
  const [selectedOutput, setSelectedOutput] = useState<Output>();

  // Synchronize with MIDI controller via WebMidi
  useEffect(() => {
    const onEnabled = () => {
      setMidiInputs(WebMidi.inputs);
      setMidiOutputs(WebMidi.outputs);
    };
    WebMidi.enable().then(onEnabled);

    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener();
      });
      WebMidi.outputs.forEach((output) => {
        output.removeListener();
      });
      WebMidi.disable();
      setMidiInputs([]);
      setMidiOutputs([]);
    };
  }, [WebMidi]);

  return (
    <MIDIContext.Provider
      value={{
        midiInputs,
        midiOutputs,
        selectedInput,
        selectedOutput,
        setSelectedInput,
        setSelectedOutput,
      }}
    >
      {children}
    </MIDIContext.Provider>
  );
};
