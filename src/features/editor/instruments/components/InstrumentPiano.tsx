import { EditorPiano } from "features/editor/components";
import { InstrumentEditorProps } from "..";
import { Sampler } from "tone";

interface InstrumentPianoProps extends InstrumentEditorProps {
  sampler: Sampler | null;
}

export const InstrumentPiano = (props: InstrumentPianoProps) => {
  return <EditorPiano {...props} />;
};
