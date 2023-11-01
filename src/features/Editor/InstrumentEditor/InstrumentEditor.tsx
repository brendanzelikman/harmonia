import { Editor } from "features/Editor/components";
import { InstrumentEditor } from "./components";
import useInstrumentEditorHotkeys from "./hooks/useInstrumentEditorHotkeys";
import { PatternTrack } from "types/PatternTrack";
import { EditorProps } from "../Editor";
import { getDestination } from "tone";
import { useState } from "react";

export interface InstrumentEditorProps extends EditorProps {
  patternTrack: PatternTrack;
  isPlaying: boolean;
  startPlaying: () => void;
  stopPlaying: () => void;
}

function InstrumentEditorComponent(props: EditorProps) {
  const { track } = props;
  const patternTrack = track as PatternTrack;
  const [isPlaying, setIsPlaying] = useState(false);
  const startPlaying = () => setIsPlaying(true);
  const stopPlaying = () => setIsPlaying(false);

  // The instrument editor passes props down to all of its components
  const instrumentEditorProps: InstrumentEditorProps = {
    ...props,
    patternTrack,
    isPlaying,
    startPlaying,
    stopPlaying,
  };

  // The instrument editor uses a custom set of hotkeys
  useInstrumentEditorHotkeys(instrumentEditorProps);

  return (
    <Editor.Container>
      <Editor.Body className="relative">
        <InstrumentEditor.Sidebar {...instrumentEditorProps} />
        <InstrumentEditor.Content {...instrumentEditorProps} />
      </Editor.Body>
      <InstrumentEditor.Piano {...instrumentEditorProps} />
    </Editor.Container>
  );
}

export { InstrumentEditorComponent as InstrumentEditor };
