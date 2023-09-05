import { Menu } from "@headlessui/react";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import { PatternTab, patternTabs } from "../PatternEditor";

interface PatternControlTabProps extends PatternEditorCursorProps {
  activeTab: PatternTab;
  setActiveTab: (tab: PatternTab) => void;
  setInstrument: (instrument: string) => void;
}

export function PatternControlTab(props: PatternControlTabProps) {
  const { pattern } = props;

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

  const CopyButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`New Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-teal-600"
        onClick={() => props.copyPattern(pattern)}
      >
        Copy
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ExportButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Export Pattern`}>
      <Editor.MenuButton>
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
        onClick={() => props.playPattern(pattern.id)}
      >
        Play
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const Tabs = () => (
    <div className="flex items-center font-light px-1 border-r border-r-slate-500 text-xs">
      {patternTabs.map((tab) => (
        <div
          key={tab}
          className={`capitalize cursor-pointer mx-2 select-none ${
            props.activeTab === tab ? "text-green-400" : "text-slate-500"
          }`}
          onClick={() => props.setActiveTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Editor.MenuGroup border={true}>
        <ExportButton />
        <NewButton />
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
        <Editor.InstrumentListbox setInstrument={props.setInstrument} />
      </Editor.MenuGroup>
    </>
  );
}
