import { useEffect, useMemo, useState } from "react";
import {
  BsBrushFill,
  BsCursor,
  BsEraser,
  BsPencilFill,
  BsTrash,
} from "react-icons/bs";
import { BiAnchor } from "react-icons/bi";

import wholeNote from "assets/noteheads/whole.svg";
import halfNote from "assets/noteheads/half.png";
import quarterNote from "assets/noteheads/quarter.png";
import eighthNote from "assets/noteheads/8th.png";
import sixteenthNote from "assets/noteheads/16th.png";
import thirtysecondNote from "assets/noteheads/32nd.png";
import sixtyfourthNote from "assets/noteheads/64th.png";
import restNote from "assets/noteheads/rest.png";

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

export function PatternEditor(props: PatternEditorProps) {
  // Editor state
  const { adding, inserting, pattern, scale } = props;
  const duration = props.selectedDuration;
  const timing = props.selectedTiming;
  const isCustom = props.isPatternCustom;
  const isEmpty = props.isPatternEmpty;
  const tabs = ["compose", "transform"];
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

  // Clear editor state if inserting when cursor is hidden
  useEffect(() => {
    if (cursor.hidden && inserting) props.clear();
  }, [cursor.hidden, inserting]);

  // Clear editor state for non-custom patterns
  useEffect(() => {
    if (!isCustom) props.clear();
  }, [isCustom]);

  // Sampler information
  const [globalSampler, setGlobalSampler] = useState(getGlobalSampler());
  const [instrumentName, setInstrumentName] = useState(
    getGlobalInstrumentName() || ""
  );
  // Switch sampler with delay
  useEffect(() => {
    setTimeout(() => {
      const sampler = getGlobalSampler();
      setGlobalSampler(sampler);
    }, 100);
  }, [instrumentName]);

  const { holdingShift, holdingAlt } = usePatternShortcuts({
    ...props,
    cursor,
    onRestClick,
  });

  if (!pattern) return null;

  function onEraseClick() {
    if (!pattern) return;
    if (isEmpty || cursor.hidden) return;
    const onLast = cursor.index === pattern.stream.length - 1;
    props.removePatternNote(pattern.id, cursor.index);
    if (onLast) cursor.prev();
  }

  function onRestClick() {
    if (!pattern) return;
    const note = {
      MIDI: MIDI.Rest,
      duration: durationToTicks(duration, {
        dotted: timing === "dotted",
        triplet: timing === "triplet",
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
        disabled={!isCustom || !props.canUndoPatterns}
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
        disabled={!isCustom || !props.canRedoPatterns}
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
        disabled={isEmpty}
        disabledClass="px-1"
        onClick={() => props.playPattern(pattern.id)}
      >
        Play
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CommandTabs = () => (
    <div className="flex items-center font-light px-1 border-r border-r-slate-500 text-[14px]">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`capitalize cursor-pointer mx-2 select-none ${
            commandTab === tab ? "text-green-500" : "text-slate-500"
          }`}
          onClick={() => setCommandTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );

  const RestButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${
        adding
          ? cursor.hidden
            ? "Add Rest"
            : "Set Rest"
          : inserting
          ? cursor.hidden
            ? "Append Rest"
            : "Insert Rest"
          : "Add Rest"
      }${holdingAlt ? " (0)" : ""}`}
    >
      <Editor.MenuButton
        className="w-6 active:bg-slate-500 active:ring-2 active:ring-slate-500"
        onClick={onRestClick}
        disabled={!isCustom || (!adding && !inserting)}
        disabledClass="w-6"
      >
        <img className="h-5 object-contain invert" src={restNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const Duration64th = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Sixty-Fourth Note${holdingAlt ? " (1)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "64th" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("64th")}
      >
        <img className="h-5 object-contain" src={sixtyfourthNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const Duration32nd = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Thirty-Second Note${holdingAlt ? " (2)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "32nd" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("32nd")}
      >
        <img className="h-5 object-contain" src={thirtysecondNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const Duration16th = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Sixteenth Note${holdingAlt ? " (1)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "16th" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("16th")}
      >
        <img className="h-5 object-contain" src={sixteenthNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DurationEighth = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Eighth Note${holdingAlt ? " (2)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "eighth" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("eighth")}
      >
        <img className="h-5 ml-0.5 object-contain" src={eighthNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DurationQuarter = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Quarter Note${holdingAlt ? " (3)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "quarter" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("quarter")}
      >
        <img className="h-5 mt-1 object-contain" src={quarterNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DurationHalf = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Half Note${holdingAlt ? " (4)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "half" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("half")}
      >
        <img className="h-5 mt-0.5" src={halfNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DurationWhole = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Whole Note ${holdingAlt ? "(5)" : ""}`}
    >
      <Editor.MenuButton
        className={`w-6 invert ${
          duration === "whole" && isCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => props.setNoteDuration("whole")}
      >
        <img className="w-5 p-1 mt-3.5 object-contain" src={wholeNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const AddButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${
        adding
          ? cursor.hidden
            ? "Stop Adding"
            : "Stop Editing"
          : cursor.hidden
          ? "Add Notes"
          : "Edit Note"
      }${holdingAlt ? " (+)" : ""}`}
    >
      <Editor.MenuButton
        className={`px-1 py-2 relative ${
          adding || inserting ? "text-emerald-500/80" : ""
        }`}
        onClick={() =>
          adding || inserting ? props.clear() : props.setState("adding")
        }
      >
        {inserting ? (
          <BsBrushFill className="text-lg text-teal-500/80" />
        ) : !cursor.hidden ? (
          <BsPencilFill className="text-lg" />
        ) : (
          <BsBrushFill className="text-lg" />
        )}
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const StraightButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Straight Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          timing === "straight" && isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600/80"
            : "cursor-default"
        }`}
        onClick={() => {
          props.setNoteTiming("straight");
        }}
      >
        Straight
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DottedButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Dotted Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          timing === "dotted" && isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600/80"
            : "cursor-default"
        }`}
        onClick={() => {
          props.setNoteTiming(timing !== "dotted" ? "dotted" : "straight");
        }}
      >
        Dotted
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const TripletButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Triplet Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          timing === "triplet" && isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600/80"
            : "cursor-default"
        }`}
        onClick={() => {
          props.setNoteTiming(timing !== "triplet" ? "triplet" : "straight");
        }}
      >
        Triplet
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CursorButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${cursor.hidden ? "Show" : "Hide"} Cursor ${
        holdingAlt ? "(`)" : ""
      }`}
    >
      <Editor.MenuButton
        onClick={cursor.hidden ? cursor.show : cursor.hide}
        className={`px-1 ${cursor.hidden ? "" : "bg-emerald-500/70"}`}
        disabled={isEmpty}
        disabledClass={"px-1"}
      >
        <BsCursor className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const InsertButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${inserting ? "Stop Inserting" : "Insert Note"}${
        holdingAlt ? " (I)" : ""
      }`}
    >
      <Editor.MenuButton
        className={`px-1 ${inserting ? "bg-teal-500/80" : ""}`}
        disabled={!isCustom || cursor.hidden}
        disabledClass="px-1"
        onClick={() =>
          inserting ? props.setState("adding") : props.setState("inserting")
        }
      >
        <BiAnchor className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const EraseButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Erase Note${holdingAlt ? " (-)" : ""}`}
    >
      <Editor.MenuButton
        className="px-1 active:bg-red-500"
        onClick={onEraseClick}
        disabled={!isCustom || isEmpty || cursor.hidden}
        disabledClass="px-1"
      >
        <BsEraser className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ClearButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Clear Pattern${holdingAlt ? " (Shift + Delete)" : ""}`}
    >
      <Editor.MenuButton
        className="px-1 active:bg-gray-500"
        onClick={() => props.clearPattern(pattern)}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        <BsTrash className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ScalarTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Scalar Transpose`}>
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.transposePattern(pattern, sanitizedInput);
          }
        }}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Transpose
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ChordalTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Chordal Transpose`}>
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.rotatePattern(pattern, sanitizedInput);
          }
        }}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Invert
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RepeatButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Repeat Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Repeat this pattern N times:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.repeatPattern(pattern, sanitizedInput);
          }
        }}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Repeat
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ContinueButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Continue Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Continue this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.lengthenPattern(pattern, sanitizedInput);
          }
        }}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Continue
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PhaseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Phase Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Phase this pattern by N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.phasePattern(pattern.id, sanitizedInput);
          }
        }}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Phase
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DiminishButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Diminish Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.diminishPattern(pattern)}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Diminish
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const AugmentButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Augment Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.augmentPattern(pattern)}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Augment
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ReverseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Reverse Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.reversePattern(pattern)}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Reverse
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ShuffleButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Shuffle Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.shufflePattern(pattern)}
        disabled={!isCustom || isEmpty}
        disabledClass="px-1"
      >
        Shuffle
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RandomizeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Randomize Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Randomize this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.randomizePattern(pattern, sanitizedInput);
          }
        }}
        disabled={!isCustom}
        disabledClass="px-1"
      >
        Randomize
      </Editor.MenuButton>
    </Editor.Tooltip>
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
    disabled: !isCustom,
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
    disabled: !isCustom || cursor.hidden,
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
    disabled: isEmpty || !isCustom,
  };
  const Rest = {
    label: `${adding ? "Add" : inserting ? "Insert" : "Add"} Rest Note`,
    onClick: onRestClick,
    disabled: !isCustom || (!adding && !inserting),
  };
  const Delete = {
    label: "Delete Note",
    onClick: onEraseClick,
    disabled: !isCustom || isEmpty || cursor.hidden,
  };
  const Clear = {
    label: "Clear All Notes",
    onClick: () => (props.pattern ? props.clearPattern(props.pattern) : null),
    disabled: !props.pattern || isEmpty || !isCustom,
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
    isCustom ? Add : null,
    isCustom ? Insert : null,
    isCustom ? Cursor : null,
    isCustom ? Rest : null,
    isCustom ? Delete : null,
    isCustom ? Clear : null,
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
            <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2 font-nunito">
              Preset Patterns
            </Editor.SidebarHeader>
            <PatternList {...props} />
          </Editor.Sidebar>
        </Transition>

        <Editor.Content>
          <Editor.Title
            editable={isCustom}
            title={pattern.name ?? "Pattern"}
            setTitle={(name) => props.setPatternName(pattern, name)}
            subtitle={props.patternCategory ?? "Category"}
            color={"bg-emerald-500/80"}
          />

          <Editor.MenuRow show={true} border={true}>
            <Editor.MenuGroup border={true}>
              <ExportButton />
              <NewButton />
              <CopyButton />
              <PlayButton />
            </Editor.MenuGroup>
            {isCustom ? (
              <Editor.MenuGroup border={true}>
                <UndoButton />
                <RedoButton />
              </Editor.MenuGroup>
            ) : null}
            {isCustom ? <CommandTabs /> : null}
            <Editor.InstrumentListbox
              instrumentName={instrumentName}
              setInstrumentName={setInstrumentName}
            />
          </Editor.MenuRow>

          <Editor.MenuRow show={isCustom} border={true}>
            {commandTab === "compose" && (
              <div className="flex">
                <Editor.MenuGroup border={true}>
                  <AddButton />
                  <CursorButton />
                  <InsertButton />
                  <EraseButton />
                  <ClearButton />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={true}>
                  <StraightButton />
                  <DottedButton />
                  <TripletButton />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={true}>
                  <RestButton />
                  <Duration64th />
                  <Duration32nd />
                  <Duration16th />
                  <DurationEighth />
                  <DurationQuarter />
                  <DurationHalf />
                  <DurationWhole />
                </Editor.MenuGroup>
              </div>
            )}
            {commandTab === "transform" && (
              <div className="flex">
                <Editor.MenuGroup border={true}>
                  <ScalarTransposeButton />
                  <ChordalTransposeButton />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={true}>
                  <RepeatButton />
                  <ContinueButton />
                  <PhaseButton />
                  <RandomizeButton />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={true}>
                  <DiminishButton />
                  <AugmentButton />
                  <ReverseButton />
                  <ShuffleButton />
                </Editor.MenuGroup>
              </div>
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
        timing={timing}
        holdingShift={holdingShift}
      />
    </Editor.Container>
  );
}
