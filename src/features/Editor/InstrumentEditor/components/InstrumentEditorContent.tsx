import { InstrumentEditorEffectBar } from "./InstrumentEditorEffectBar";
import { InstrumentEditorAnalyser } from "./InstrumentEditorAnalyser";
import { InstrumentEditorEffects } from "./InstrumentEditorEffects";
import { EditorHeader } from "features/Editor/components/EditorHeader";
import { EditorContent } from "features/Editor/components/EditorContent";
import {
  INSTRUMENT_CATEGORIES_BY_KEY,
  INSTRUMENT_NAMES_BY_KEY,
  InstrumentId,
} from "types/Instrument/InstrumentTypes";
import { useDeep } from "types/hooks";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";

interface InstrumentEditorContentProps {
  id: InstrumentId;
  isPlaying: boolean;
}

export const InstrumentEditorContent = (
  props: InstrumentEditorContentProps
) => {
  const instrument = useDeep((_) => selectInstrumentById(_, props.id));
  const key = instrument?.key;
  if (!key) return null;
  return (
    <EditorContent>
      <EditorHeader
        className="capitalize"
        title={INSTRUMENT_NAMES_BY_KEY[key]}
        subtitle={INSTRUMENT_CATEGORIES_BY_KEY[key]}
        color="bg-gradient-to-tr from-orange-400 to-orange-500"
      />
      <div className="flex flex-col overflow-scroll">
        <InstrumentEditorEffectBar {...props} />
        {/* <InstrumentEditorAnalyser {...props} type="waveform" /> */}
        <InstrumentEditorAnalyser {...props} type="fft" />
        <InstrumentEditorEffects {...props} />
      </div>
    </EditorContent>
  );
};
