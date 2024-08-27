import { FC } from "react";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { InstrumentEditorEffectBar } from "./InstrumentEditorEffectBar";
import { InstrumentEditorAnalyser } from "./InstrumentEditorAnalyser";
import { InstrumentEditorEffects } from "./InstrumentEditorEffects";
import { EditorHeader } from "features/Editor/components/EditorHeader";
import { EditorContent } from "features/Editor/components/EditorContent";
import {
  getInstrumentName,
  getInstrumentCategory,
} from "types/Instrument/InstrumentFunctions";

export const InstrumentEditorContent: FC<InstrumentEditorProps> = (props) => {
  const { instrument } = props;
  const name = getInstrumentName(instrument?.key);
  const category = getInstrumentCategory(instrument?.key);

  /** The instrument editor displays the name of the instrument as its title. */
  const InstrumentEditorTitle = () => {
    return (
      <EditorHeader
        className="capitalize"
        title={name}
        subtitle={category}
        color="bg-gradient-to-tr from-orange-400 to-orange-500"
      />
    );
  };

  return (
    <EditorContent>
      <InstrumentEditorTitle />
      <div className="flex flex-col overflow-scroll">
        <InstrumentEditorEffectBar {...props} />
        <InstrumentEditorAnalyser {...props} type="waveform" />
        <InstrumentEditorAnalyser {...props} type="fft" />
        <InstrumentEditorEffects {...props} />
      </div>
    </EditorContent>
  );
};
