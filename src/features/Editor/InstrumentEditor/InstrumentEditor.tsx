import { useCallback, useState } from "react";
import { EditorContainer } from "../components/EditorContainer";
import { EditorBody } from "../components/EditorBody";
import { useDeep } from "types/hooks";
import { selectSelectedPatternTrack } from "types/Timeline/TimelineSelectors";
import { InstrumentEditorPiano } from "./components/InstrumentEditorPiano";
import { InstrumentEditorContent } from "./components/InstrumentEditorContent";
import { InstrumentEditorSidebar } from "./components/InstrumentEditorSidebar";

export function InstrumentEditor() {
  const track = useDeep(selectSelectedPatternTrack);

  /** Play state is controlled by piano and used for animation */
  const [isPlaying, setIsPlaying] = useState(false);
  const startPlaying = useCallback(() => setIsPlaying(true), []);
  const stopPlaying = useCallback(() => setIsPlaying(false), []);

  if (!track) return null;
  const id = track?.instrumentId;
  return (
    <EditorContainer>
      <EditorBody>
        <InstrumentEditorSidebar id={id} />
        <InstrumentEditorContent id={id} isPlaying={isPlaying} />
      </EditorBody>
      <InstrumentEditorPiano
        id={id}
        startPlaying={startPlaying}
        stopPlaying={stopPlaying}
      />
    </EditorContainer>
  );
}
