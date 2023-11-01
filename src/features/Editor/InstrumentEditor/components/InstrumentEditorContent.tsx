import { FC } from "react";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { Editor } from "features/Editor/components";
import { InstrumentEditorEffectBar } from "./InstrumentEditorEffectBar";
import { InstrumentEditorAnalyser } from "./InstrumentEditorAnalyser";
import { InstrumentEditorEffects } from "./InstrumentEditorEffects";
import { getInstrumentCategory, getInstrumentName } from "types/Instrument";

export const InstrumentEditorContent: FC<InstrumentEditorProps> = (props) => {
  const { instrument } = props;
  const name = getInstrumentName(instrument?.key);
  const category = getInstrumentCategory(instrument?.key);

  /** The instrument editor displays the name of the instrument as its title. */
  const InstrumentEditorTitle = () => {
    return (
      <Editor.Header
        className="capitalize"
        title={name}
        subtitle={category}
        color="bg-gradient-to-tr from-orange-400 to-orange-500"
      />
    );
  };

  return (
    <Editor.Content>
      <InstrumentEditorTitle />
      <div className="flex flex-col overflow-scroll">
        <InstrumentEditorEffectBar {...props} />
        <InstrumentEditorAnalyser {...props} type="waveform" />
        <InstrumentEditorAnalyser {...props} type="fft" />
        <InstrumentEditorEffects {...props} />
      </div>
    </Editor.Content>
  );
};
