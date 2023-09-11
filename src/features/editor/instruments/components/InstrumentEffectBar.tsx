import { EFFECT_NAMES, EFFECT_TYPES, EffectType } from "types";
import { InstrumentEditorProps } from "..";
import { BsPlusCircle } from "react-icons/bs";

interface InstrumentEffectBarProps extends InstrumentEditorProps {}

export function InstrumentEffectBar(props: InstrumentEffectBarProps) {
  const { mixer } = props;
  if (!mixer) return null;

  const AddEffectButton = (type: EffectType) => {
    const name = EFFECT_NAMES[type];
    return (
      <div
        key={type}
        className="capitalize border border-slate-500 hover:bg-slate-500/20 active:bg-slate-800/50 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap cursor-pointer"
        onClick={() => props.addMixerEffect(mixer.id, type)}
      >
        {name} <BsPlusCircle className="ml-2" />
      </div>
    );
  };

  const ClearEffectsButton = () => (
    <div
      className={`capitalize border border-slate-500 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap ${
        mixer.effects.length
          ? "cursor-pointer hover:bg-slate-500/20 active:bg-slate-800/50"
          : "opacity-50 cursor-default"
      }`}
      onClick={() =>
        mixer.effects.length ? props.removeAllMixerEffects(mixer.id) : null
      }
    >
      Clear All Effects
    </div>
  );

  return (
    <div className="flex flex-wrap items-center">
      {EFFECT_TYPES.map((effect) => AddEffectButton(effect))}
      <ClearEffectsButton />
    </div>
  );
}
