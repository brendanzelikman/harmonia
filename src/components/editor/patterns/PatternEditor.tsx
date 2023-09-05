import { useEffect, useMemo, useState } from "react";
import { MIDI } from "types/midi";
import Patterns from "types/patterns";
import * as Editor from "../Editor";
import { durationToTicks } from "appUtil";
import { PatternsPiano } from "./Piano";
import useOSMD from "lib/opensheetmusicdisplay";
import PatternList from "./PatternList";
import { Menu, Transition } from "@headlessui/react";
import { getGlobalInstrumentName, getGlobalSampler } from "types/instrument";
import usePatternShortcuts from "./usePatternShortcuts";
import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { PatternEditorProps } from ".";
import ComposeTab from "./ComposeTab";
import TransformTab from "./TransformTab";
import RecordTab from "./RecordTab";
import { Duration, Timing } from "types/units";
import { Input } from "webmidi";

export function PatternEditor(props: PatternEditorProps) {
  // Editor state
  const { adding, inserting, pattern, scale } = props;
  const duration = props.noteDuration;
  const tabs = ["compose", "record", "transform"];
  const [commandTab, setCommandTab] = useState("compose");

  // Score information
  const xml = useMemo(() => {
    return Patterns.exportToXML(pattern, scale);
  }, [pattern, scale]);

  const { score, cursor } = useOSMD({
    id: `${pattern?.id ?? "pattern"}-score`,
    xml,
    className: "w-full h-full p-2",
    noteCount: pattern?.stream.length || 0,
    options: {
      drawTimeSignatures: false,
    },
  });

  // Input information
  const [input, setInput] = useState<Input>();

  // Clear editor state if inserting when cursor is hidden
  useEffect(() => {
    if (cursor.hidden && inserting) props.clear();
  }, [cursor.hidden, inserting]);

  // Clear editor state for non-custom patterns
  useEffect(() => {
    if (!props.isCustom) props.clear();
  }, [props.isCustom]);

  // Sampler information
  const [globalSampler, setGlobalSampler] = useState(getGlobalSampler());
  const [instrumentName, setInstrumentName] = useState(
    getGlobalInstrumentName() || ""
  );
  // Switch sampler with delay (to update state properly)
  useEffect(() => {
    setTimeout(() => {
      const sampler = getGlobalSampler();
      setGlobalSampler(sampler);
    }, 100);
  }, [instrumentName]);

  function onRestClick() {
    if (!pattern) return;
    const note = {
      MIDI: MIDI.Rest,
      duration: durationToTicks(props.noteDuration, {
        dotted: props.noteTiming === "dotted",
        triplet: props.noteTiming === "triplet",
      }),
    };

    if (adding) {
      if (cursor.hidden) {
        props.addPatternNote(pattern.id, note);
      } else {
        props.updatePatternNote(pattern.id, cursor.index, note);
      }
    } else if (inserting) {
      if (cursor.hidden) {
        props.addPatternNote(pattern.id, note);
      } else {
        props.insertPatternNote(pattern.id, note, cursor.index);
      }
    }
  }

  function onEraseClick() {
    if (!pattern) return;
    if (props.isEmpty || cursor.hidden) return;
    const onLast = cursor.index === pattern.stream.length - 1;
    props.removePatternNote(pattern.id, cursor.index);
    if (onLast) cursor.prev();
  }

  function onDurationClick(duration: Duration) {
    if (!pattern) return;
    props.setNoteDuration(duration);
    if (!cursor.hidden) {
      const index = cursor.index;
      const chord = pattern.stream[index];
      props.updatePatternChord(
        pattern,
        index,
        chord.map((c) => ({
          ...c,
          duration: durationToTicks(duration, {
            dotted: props.noteTiming === "dotted",
            triplet: props.noteTiming === "triplet",
          }),
        }))
      );
    }
  }

  function onTimingClick(timing: Timing) {
    if (!pattern) return;
    props.setNoteTiming(timing);
    if (!cursor.hidden) {
      const index = cursor.index;
      const chord = pattern.stream[index];
      props.updatePatternChord(
        pattern,
        index,
        chord.map((c) => ({
          ...c,
          duration: durationToTicks(props.noteDuration, {
            dotted: timing === "dotted",
            triplet: timing === "triplet",
          }),
        }))
      );
    }
  }

  // Shortcut hook
  const { holdingShift, holdingAlt } = usePatternShortcuts({
    ...props,
    cursor,
    onRestClick,
    onDurationClick,
  });

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
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Undo Change ${holdingAlt ? "(Cmd + Z)" : ""}`}
    >
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
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Redo Change ${holdingAlt ? "(Cmd + Shift + Z)" : ""}`}
    >
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
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Play Pattern ${holdingAlt ? "(Space)" : ""}`}
    >
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

  const CommandTabs = () => (
    <div className="flex items-center font-light px-1 border-r border-r-slate-500 text-xs">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`capitalize cursor-pointer mx-2 select-none ${
            commandTab === tab ? "text-green-400" : "text-slate-500"
          }`}
          onClick={() => setCommandTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );

  const Undo = {
    label: "Undo Last Action",
    onClick: props.undoPatterns,
    disabled: !props.canUndoPatterns,
  };
  const Redo = {
    label: "Redo Last Action",
    onClick: props.redoPatterns,
    disabled: !props.canRedoPatterns,
    divideEnd: true,
  };
  const Add = {
    label: `${adding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => {
      if (adding) {
        props.clear();
      } else {
        props.setState("adding");
      }
    },
    disabled: !props.isCustom,
  };
  const Insert = {
    label: `${inserting ? "Stop" : "Start"} Inserting Notes`,
    onClick: () => {
      if (inserting) {
        props.clear();
      } else {
        props.setState("inserting");
      }
    },
    disabled: !props.isCustom || cursor.hidden,
  };
  const Cursor = {
    label: `${cursor.hidden ? "Show" : "Hide"} Cursor`,
    onClick: () => {
      if (cursor.hidden) {
        cursor.show();
      } else {
        cursor.hide();
      }
    },
    disabled: props.isEmpty || !props.isCustom,
  };
  const Rest = {
    label: `${adding ? "Add" : inserting ? "Insert" : "Add"} Rest Note`,
    onClick: onRestClick,
    disabled: !props.isCustom || (!adding && !inserting),
  };
  const Delete = {
    label: "Delete Note",
    onClick: onEraseClick,
    disabled: !props.isCustom || props.isEmpty || cursor.hidden,
  };
  const Clear = {
    label: "Clear All Notes",
    onClick: () => (props.pattern ? props.clearPattern(props.pattern) : null),
    disabled: !props.pattern || props.isEmpty || !props.isCustom,
    divideEnd: true,
  };
  const NewPattern = {
    label: "Create New Pattern",
    onClick: async () => {
      const patternId = await props.createPattern();
      props.setPatternId(patternId);
    },
  };
  const DuplicatePattern = {
    label: "Duplicate Pattern",
    onClick: () => props.copyPattern(pattern),
  };
  const ExportMIDI = {
    label: "Export Pattern to MIDI",
    onClick: () => props.exportPatternToMIDI(pattern),
  };
  const ExportXML = {
    label: "Export Pattern to XML",
    onClick: () => props.exportPatternToXML(pattern),
  };

  const menuOptions = [
    Undo,
    Redo,
    props.isCustom ? Add : null,
    props.isCustom ? Insert : null,
    props.isCustom ? Cursor : null,
    props.isCustom ? Rest : null,
    props.isCustom ? Delete : null,
    props.isCustom ? Clear : null,
    NewPattern,
    DuplicatePattern,
    ExportMIDI,
    ExportXML,
  ];
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];

  return (
    <Editor.Container
      className={`text-white h-full absolute top-0 w-full`}
      id="pattern-editor"
    >
      <ContextMenu
        targetId="pattern-editor"
        options={options}
        className={`-ml-[300px] -mt-4`}
      />
      <Editor.Body>
        <Transition
          show={props.showingPresets}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Editor.Sidebar className={`ease-in-out duration-300`}>
            <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2">
              Preset Patterns
            </Editor.SidebarHeader>
            <PatternList {...props} />
          </Editor.Sidebar>
        </Transition>

        <Editor.Content>
          <Editor.Title
            editable={props.isCustom}
            title={pattern.name ?? "Pattern"}
            setTitle={(name) => props.setPatternName(pattern, name)}
            subtitle={props.patternCategory ?? "Category"}
            color={"bg-gradient-to-tr from-emerald-500 to-emerald-600"}
          />

          <Editor.MenuRow show={true} border={true}>
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
            {props.isCustom ? <CommandTabs /> : null}
            <Editor.MenuGroup border={false}>
              <Editor.InstrumentListbox setInstrumentName={setInstrumentName} />
            </Editor.MenuGroup>
          </Editor.MenuRow>

          <Editor.MenuRow show={props.isCustom} border={true}>
            {commandTab === "compose" && (
              <ComposeTab
                {...props}
                cursor={cursor}
                onRestClick={onRestClick}
                onEraseClick={onEraseClick}
                onDurationClick={onDurationClick}
                onTimingClick={onTimingClick}
              />
            )}
            {commandTab === "record" && (
              <RecordTab
                {...props}
                cursor={cursor}
                input={input}
                setInput={setInput}
              />
            )}
            {commandTab === "transform" && (
              <TransformTab {...props} cursor={cursor} />
            )}
          </Editor.MenuRow>

          <Editor.ScoreContainer className={`bg-white/90 mt-2 rounded-lg`}>
            {score}
          </Editor.ScoreContainer>
        </Editor.Content>
      </Editor.Body>
      <PatternsPiano
        {...props}
        sampler={globalSampler}
        cursor={cursor}
        duration={duration}
        timing={props.noteTiming}
        holdingShift={holdingShift}
      />
    </Editor.Container>
  );
}
