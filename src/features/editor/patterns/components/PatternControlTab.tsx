import { Menu } from "@headlessui/react";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import { PatternTab, patternTabs } from "./PatternEditor";
import { capitalize } from "lodash";
import { MIDI, Pattern, Scale, transposeScale } from "types";
import { useState, useEffect } from "react";
import { PresetScaleList } from "types/presets/scales";

interface PatternControlTabProps extends PatternEditorCursorProps {
  activeTab: PatternTab;
  setActiveTab: (tab: PatternTab) => void;
  setInstrument: (instrument: string) => void;
  scale: Scale;
  setScale: React.Dispatch<React.SetStateAction<Scale>>;
  transformedPattern: Pattern;
}

export function PatternControlTab(props: PatternControlTabProps) {
  const { pattern, scale, setScale } = props;

  const tonic = scale.notes[0];
  const tonicKey = MIDI.toPitchClass(tonic);
  const [key, setKey] = useState(MIDI.toPitchClass(scale.notes?.[0]));
  useEffect(() => {
    if (tonicKey !== key) {
      setScale((prev) => {
        const diff = MIDI.ChromaticNumber(key) - MIDI.ChromaticNumber(tonic);
        return transposeScale(prev, diff);
      });
    }
  }, [key]);

  if (!pattern) return null;
  const NewButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`New Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={async () => {
          const patternId = await props.createPattern();
          props.setPatternId(patternId);
        }}
      >
        New
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const InputButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Input Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const value = prompt("Enter a pattern by keyword:");
          if (!value || !props.isCustom) return;
          if (value) props.updatePatternByRegex(pattern, value);
        }}
        disabled={!props.isCustom}
        disabledClass="px-1"
      >
        Input
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CopyButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Copy Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-teal-600"
        onClick={() => props.copyPattern(pattern)}
        disabled={props.isEmpty}
        disabledClass="px-1"
      >
        Copy
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ExportButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Export Pattern`}>
      <Editor.MenuButton disabled={props.isEmpty}>
        <Menu>
          <div className="relative z-50">
            <Menu.Button className="py-1 px-1 rounded active:bg-slate-600">
              Export
            </Menu.Button>
            <Menu.Items className="absolute w-auto mt-2 left-1 py-1.5 px-1 rounded-lg border-0.5 border-slate-200/80 whitespace-nowrap bg-slate-800">
              <Menu.Item>
                <div
                  className="hover:bg-slate-600/80 px-4 rounded"
                  onClick={() => props.exportPatternToMIDI(pattern)}
                >
                  Export MIDI
                </div>
              </Menu.Item>
              <Menu.Item>
                <div
                  className="hover:bg-slate-600/80 px-4 rounded"
                  onClick={() => props.exportPatternToXML(pattern)}
                >
                  Export XML
                </div>
              </Menu.Item>
            </Menu.Items>
          </div>
        </Menu>
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const UndoButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Undo Change`}>
      <Editor.MenuButton
        className="active:bg-slate-500 p-1"
        disabledClass="p-1"
        onClick={props.undoPatterns}
        disabled={!props.isCustom || !props.canUndoPatterns}
      >
        Undo
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RedoButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Redo Change`}>
      <Editor.MenuButton
        className="active:bg-slate-500 p-1"
        disabledClass="p-1"
        onClick={props.redoPatterns}
        disabled={!props.isCustom || !props.canRedoPatterns}
      >
        Redo
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PlayButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Play Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        disabled={props.isEmpty}
        disabledClass="px-1"
        onClick={() => props.playPattern(props.transformedPattern)}
      >
        Play
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const Tabs = () => (
    <div className="flex items-center font-light px-1 border-r border-r-slate-500 text-xs">
      {patternTabs.map((tab) => (
        <Editor.Tooltip
          key={tab}
          show={props.showingTooltips}
          content={`Select ${capitalize(tab)} Tab`}
        >
          <div
            className={`capitalize cursor-pointer mx-2 select-none ${
              props.activeTab === tab ? "text-green-400" : "text-slate-500"
            }`}
            onClick={() => props.setActiveTab(tab)}
          >
            {tab}
          </div>
        </Editor.Tooltip>
      ))}
    </div>
  );

  return (
    <>
      <Editor.MenuGroup border={true}>
        <ExportButton />
        <NewButton />
        <InputButton />
        <CopyButton />
        <PlayButton />
      </Editor.MenuGroup>

      {props.isCustom ? (
        <Editor.MenuGroup border={true}>
          <UndoButton />
          <RedoButton />
        </Editor.MenuGroup>
      ) : null}
      {props.isCustom ? <Tabs /> : null}
      <Editor.MenuGroup border={false}>
        <Editor.Tooltip
          show={props.showingTooltips}
          content={`Select Instrument`}
        >
          <Editor.InstrumentListbox setInstrument={props.setInstrument} />
        </Editor.Tooltip>
        <Editor.Tooltip show={props.showingTooltips} content={`Select Tonic`}>
          <Editor.CustomListbox
            value={key}
            setValue={(value) => setKey(value)}
            options={MIDI.ChromaticNotes}
            className="mx-1"
          />
        </Editor.Tooltip>
        <Editor.Tooltip show={props.showingTooltips} content={`Select Scale`}>
          <Editor.CustomListbox
            value={scale}
            setValue={(scale) => {
              const tonic = scale.notes[0];
              const diff =
                MIDI.ChromaticNumber(key) - MIDI.ChromaticNumber(tonic);
              setScale(transposeScale(scale, diff));
            }}
            options={PresetScaleList}
            getOptionKey={(option) => option.id}
            getOptionValue={(option) => option.id}
            getOptionName={(option) => option.name}
          />
        </Editor.Tooltip>
      </Editor.MenuGroup>
    </>
  );
}
