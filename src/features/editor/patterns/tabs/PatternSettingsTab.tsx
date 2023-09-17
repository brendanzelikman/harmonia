import * as Editor from "features/editor";
import { PatternEditorProps } from "..";
import {
  InstrumentKey,
  MIDI,
  Pitch,
  Scale,
  ScaleId,
  defaultPatternOptions,
} from "types";
import { PresetScaleList, PresetScaleMap } from "types/presets/scales";

interface PatternSettingsProps extends PatternEditorProps {
  instrument: InstrumentKey;
  setInstrument: (instrument: InstrumentKey) => void;
}

export function PatternSettingsTab(props: PatternSettingsProps) {
  const { pattern } = props;
  if (!pattern) return null;

  const { instrument, scaleId, tonic, quantizeToScale } = {
    ...defaultPatternOptions,
    ...pattern.options,
  };
  const setTonic = (tonic: Pitch) => {
    props.updatePattern({
      ...pattern,
      options: { ...pattern.options, tonic },
    });
  };
  const setQuantizeToScale = (quantizeToScale: boolean) => {
    props.updatePattern({
      ...pattern,
      options: { ...pattern.options, quantizeToScale },
    });
  };
  const setScaleId = (scaleId: ScaleId) => {
    props.updatePattern({
      ...pattern,
      options: { ...pattern.options, scaleId },
    });
  };

  const InstrumentField = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Select Instrument`}>
      <div className="mr-2 h-5 my-2 flex text-xs items-center">
        <label className="px-1">Instrument:</label>
        <Editor.InstrumentListbox
          value={instrument}
          setValue={props.setInstrument}
        />
      </div>
    </Editor.Tooltip>
  );

  const ScaleField = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Select Key`}>
      <div className="mr-2 h-5 my-2 flex text-xs items-center">
        <label className="px-1">Scale:</label>
        <Editor.CustomListbox
          value={tonic}
          setValue={setTonic}
          options={MIDI.ChromaticKey}
          className="mx-1"
        />
        <Editor.CustomListbox
          value={scaleId}
          setValue={setScaleId}
          options={PresetScaleList.map(({ id }) => id)}
          getOptionName={(id) => PresetScaleMap[id]?.name ?? "Unknown Scale"}
        />
      </div>
    </Editor.Tooltip>
  );

  const QuantizeField = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Select Scale`}>
      <div className="mr-2 h-5 my-2 flex text-xs items-center">
        <label className="px-1">Quantize to Scale?</label>
        <input
          checked={quantizeToScale}
          onChange={(e) => setQuantizeToScale(e.target.checked)}
          type="checkbox"
          className="ml-2 rounded focus:outline-none focus:ring-offset-0 focus:border-0 focus:ring-0"
        />
      </div>
    </Editor.Tooltip>
  );

  return (
    <>
      <Editor.MenuGroup border={true}>
        <InstrumentField />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <ScaleField />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <QuantizeField />
      </Editor.MenuGroup>
    </>
  );
}
