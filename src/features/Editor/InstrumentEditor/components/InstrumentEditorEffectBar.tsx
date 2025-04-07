import { useCallback } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { useStore, useDispatch } from "types/hooks";
import {
  EffectKey,
  EFFECT_NAMES_BY_KEY,
  EFFECT_KEYS,
} from "types/Instrument/InstrumentEffectTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import {
  addInstrumentEffect,
  removeAllInstrumentEffects,
} from "types/Instrument/InstrumentSlice";
import { InstrumentId } from "types/Instrument/InstrumentTypes";

export function InstrumentEditorEffectBar(props: { id: InstrumentId }) {
  const dispatch = useDispatch();
  const id = props.id;
  const instrument = useStore((_) => selectInstrumentById(_, props.id));
  const effects = instrument?.effects ?? [];

  /** The user can add an effect by key. */
  const AddEffectButton = useCallback(
    (key: EffectKey) => {
      const name = EFFECT_NAMES_BY_KEY[key];
      return (
        <div
          key={key}
          className="capitalize border border-slate-500 hover:bg-slate-500/20 active:bg-slate-800/50 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap cursor-pointer"
          onClick={() =>
            id && dispatch(addInstrumentEffect({ data: { id, key } }))
          }
        >
          {name} <BsPlusCircle className="ml-2" />
        </div>
      );
    },
    [id]
  );

  /** The user can clear all effects. */
  const ClearEffectsButton = () => (
    <div
      className={`capitalize border border-slate-500 flex items-center h-8 px-2 mb-2 ml-1 mr-2 rounded text-xs whitespace-nowrap ${
        effects?.length
          ? "cursor-pointer hover:bg-slate-500/20 active:bg-slate-800/50"
          : "opacity-50 cursor-default"
      }`}
      onClick={() => id && dispatch(removeAllInstrumentEffects(id))}
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
