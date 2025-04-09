import { useStore } from "hooks/useStore";
import {
  selectIsEditingTracks,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { useCallback, useState } from "react";
import {
  getInstrumentName,
  getInstrumentCategory,
} from "types/Instrument/InstrumentFunctions";
import {
  EditorContainer,
  EditorBody,
  EditorContent,
  EditorTitle,
  EditorTitleUnderline,
  EditorSubtitle,
} from "./EditorContent";
import { InstrumentEditorAnalyser } from "./EditorAnalyser";
import { InstrumentEditorEffectBar } from "./EditorEffectBar";
import { InstrumentEditorEffects } from "./EditorEffects";
import { InstrumentEditorPiano } from "./EditorPiano";
import { InstrumentEditorSidebar } from "./EditorSidebar";

export function Editor() {
  const track = useStore(selectSelectedTrack);
  const isEditing = useStore(selectIsEditingTracks);
  const id = track?.instrumentId;
  const instrument = useStore((_) => selectInstrumentById(_, id));
  const key = instrument?.key;

  /** Play state is controlled by piano and used for animation */
  const [isPlaying, setIsPlaying] = useState(false);
  const startPlaying = useCallback(() => setIsPlaying(true), []);
  const stopPlaying = useCallback(() => setIsPlaying(false), []);
  if (!isEditing || !track || !id) return null;

  return (
    <EditorContainer>
      <EditorBody>
        <InstrumentEditorSidebar id={id} />
        <EditorContent>
          <EditorTitle>{getInstrumentName(key)}</EditorTitle>
          <EditorTitleUnderline className="bg-gradient-to-tr from-orange-400 to-orange-500" />
          <EditorSubtitle>{getInstrumentCategory(key)}</EditorSubtitle>
          <div className="mt-4">
            <InstrumentEditorEffectBar id={id} />
            <InstrumentEditorAnalyser
              id={id}
              type="fft"
              isPlaying={isPlaying}
            />
            <InstrumentEditorAnalyser
              id={id}
              type="waveform"
              isPlaying={isPlaying}
            />
            <InstrumentEditorEffects id={id} />
          </div>
        </EditorContent>
      </EditorBody>
      <InstrumentEditorPiano
        id={id}
        startPlaying={startPlaying}
        stopPlaying={stopPlaying}
      />
    </EditorContainer>
  );
}
