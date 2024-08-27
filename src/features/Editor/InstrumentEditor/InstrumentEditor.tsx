import { InstrumentEditor } from "./components";
import useInstrumentEditorHotkeys from "./hooks/useInstrumentEditorHotkeys";
import { EditorProps } from "../Editor";
import { useState } from "react";
import { EditorContainer } from "../components/EditorContainer";
import { EditorBody } from "../components/EditorBody";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";

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
    <EditorContainer>
      <EditorBody className="relative">
        <InstrumentEditor.Sidebar {...instrumentEditorProps} />
        <InstrumentEditor.Content {...instrumentEditorProps} />
      </EditorBody>
      <InstrumentEditor.Piano {...instrumentEditorProps} />
    </EditorContainer>
  );
}

export { InstrumentEditorComponent as InstrumentEditor };
