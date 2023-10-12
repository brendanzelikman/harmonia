import { EFFECT_NAMES_BY_KEY, EFFECT_KEYS, EffectKey } from "types/Instrument";
import { InstrumentEditorProps } from "..";
import { BsPlusCircle } from "react-icons/bs";

interface InstrumentEffectBarProps extends InstrumentEditorProps {}

export function InstrumentEffectBar(props: InstrumentEffectBarProps) {
  const { instrument } = props;
  if (!instrument) return null;

  const AddEffectButton = (key: EffectKey) => {
    const name = EFFECT_NAMES_BY_KEY[key];
    return (
      <div
        key={key}
        className="capitalize border border-slate-500 hover:bg-slate-500/20 active:bg-slate-800/50 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap cursor-pointer"
        onClick={() => props.addInstrumentEffect(instrument.id, key)}
      >
        {name} <BsPlusCircle className="ml-2" />
      </div>
    );
  };

  const ClearEffectsButton = () => (
    <div
      className={`capitalize border border-slate-500 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap ${
        instrument.effects.length
          ? "cursor-pointer hover:bg-slate-500/20 active:bg-slate-800/50"
          : "opacity-50 cursor-default"
      }`}
      onClick={() =>
        instrument.effects.length
          ? props.removeAllInstrumentEffects(instrument.id)
          : null
      }
    >
      Clear All Effects
    </div>
  );

  return (
    <div className="flex flex-wrap items-center">
      {EFFECT_KEYS.map((effect) => AddEffectButton(effect))}
      <ClearEffectsButton />
    </div>
  );
}
