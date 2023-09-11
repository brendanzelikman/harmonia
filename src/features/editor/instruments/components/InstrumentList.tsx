import {
  INSTRUMENT_CATEGORIES,
  getCategoryInstruments,
} from "types/instrument";
import { InstrumentEditorProps } from "..";
import * as Editor from "features/editor";
import { Disclosure } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useCallback } from "react";

export function InstrumentList(props: InstrumentEditorProps) {
  const renderInstrument = useCallback(
    (instrument: any) => (
      <Editor.ListItem
        key={instrument.key}
        className={`select-none ${
          props.track?.instrument === instrument.key
            ? "font-semibold text-orange-500 border-l border-l-orange-500"
            : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
        }`}
        onClick={() =>
          !!props.track
            ? props.setTrackInstrument(props.track.id, instrument.key)
            : null
        }
      >
        {instrument.name}
      </Editor.ListItem>
    ),
    [props.track]
  );

  return (
    <Editor.List className="p-2">
      {INSTRUMENT_CATEGORIES.map((category) => (
        <Disclosure key={category}>
          {({ open }) => (
            <>
              <Disclosure.Button className="outline-none">
                <div className="flex items-center justify-center text-slate-50">
                  <label
                    className={`capitalize py-2.5 px-2 ${
                      open ? "font-extrabold" : "font-medium"
                    } select-none`}
                  >
                    {category}
                  </label>
                  <span className="ml-auto mr-2">
                    {open ? <BsChevronDown /> : <BsChevronUp />}
                  </span>
                </div>
              </Disclosure.Button>
              <Disclosure.Panel>
                {getCategoryInstruments(category).map(renderInstrument)}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </Editor.List>
  );
}
