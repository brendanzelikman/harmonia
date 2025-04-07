import { useState, useCallback } from "react";
import { useStore } from "types/hooks";
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
} from "../components/EditorContent";
import { InstrumentEditorAnalyser } from "./components/InstrumentEditorAnalyser";
import { InstrumentEditorEffectBar } from "./components/InstrumentEditorEffectBar";
import { InstrumentEditorEffects } from "./components/InstrumentEditorEffects";
import { InstrumentEditorPiano } from "./components/InstrumentEditorPiano";
import { InstrumentEditorSidebar } from "./components/InstrumentEditorSidebar";
import { Track } from "types/Track/TrackTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";

export const InstrumentEditor = (props: { track: Track }) => {
  const { track } = props;
  const id = track.instrumentId;
  const instrument = useStore((_) => selectInstrumentById(_, id));
  const key = instrument?.key;

  /** Play state is controlled by piano and used for animation */
  const [isPlaying, setIsPlaying] = useState(false);
  const startPlaying = useCallback(() => setIsPlaying(true), []);
  const stopPlaying = useCallback(() => setIsPlaying(false), []);

  if (!id) return null;
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
};
