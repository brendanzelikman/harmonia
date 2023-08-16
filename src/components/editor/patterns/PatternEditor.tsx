import { CiRedo, CiUndo } from "react-icons/ci";
import { useEffect, useState } from "react";
import {
  BsArrowLeftRight,
  BsArrowsAngleContract,
  BsArrowsAngleExpand,
  BsBoxArrowRight,
  BsBrush,
  BsChevronExpand,
  BsClock,
  BsCursor,
  BsDownload,
  BsEraser,
  BsFillDatabaseFill,
  BsFillDice5Fill,
  BsFillPlayCircleFill,
  BsInputCursorText,
  BsPlusCircle,
  BsShuffle,
  BsTrash,
  BsWind,
} from "react-icons/bs";
import { FaCopy } from "react-icons/fa";

import wholeNote from "assets/noteheads/whole.svg";
import halfNote from "assets/noteheads/half.png";
import quarterNote from "assets/noteheads/quarter.png";
import eighthNote from "assets/noteheads/eighth.png";
import sixteenthNote from "assets/noteheads/sixteenth.png";

import { MIDI } from "types/midi";
import Patterns from "types/patterns";
import { PatternEditorProps } from ".";
import useEditorState from "../hooks/useEditorState";
import * as Editor from "../Editor";
import { Duration } from "types/units";
import { DEFAULT_DURATION } from "appConstants";
import { durationToBeats } from "appUtil";
import { PatternsPiano } from "./Piano";
import useOSMD from "lib/opensheetmusicdisplay";
import PatternList from "./PatternList";
import { DemoXML } from "assets/demo";
import { Menu, Transition } from "@headlessui/react";

import { getGlobalInstrumentName, getGlobalSampler } from "types/instrument";
import usePatternShortcuts from "./usePatternShortcuts";

type PatternsViewState = "adding" | "inserting";

export function EditorPatterns(props: PatternEditorProps) {
  // Editor state
  const editorState = useEditorState<PatternsViewState>();
  const { setState, onState, clearState } = editorState;
  const adding = onState("adding");
  const inserting = onState("inserting");
  const tabs = ["compose", "transform"];
  const [commandTab, setCommandTab] = useState("compose");

  // Score information
  const { pattern, scale } = props;
  const xml = pattern && scale ? Patterns.exportToXML(pattern, scale) : DemoXML;
  const { score, cursor } = useOSMD({
    id: "pattern-score",
    xml,
    className: "w-full h-full p-2",
    noteCount: pattern?.stream.length || 0,
    options: {
      drawTimeSignatures: false,
    },
  });

  // Clear editor state if inserting when cursor is hidden
  useEffect(() => {
    if (cursor.hidden && inserting) clearState();
  }, [cursor.hidden, inserting]);

  // Clear editor state for non-custom patterns
  useEffect(() => {
    if (!props.isPatternCustom) clearState();
  }, [props.isPatternCustom, clearState]);

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

  // Selected note duration
  const [duration, setDuration] = useState<Duration>(DEFAULT_DURATION);
  const { holdingShift, holdingAlt } = usePatternShortcuts({
    ...props,
    onState,
    setState,
    clearState,
    cursor,
    setDuration,
    onRestClick,
  });

  if (!pattern) return null;

  function onEraseClick() {
    if (!pattern) return;
    if (props.isPatternEmpty || cursor.hidden) return;
    props.removePatternNote(pattern.id, cursor.index);
  }

  function onRestClick() {
    if (!pattern) return;
    const note = {
      MIDI: MIDI.Rest,
      duration: durationToBeats(duration),
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
        onClick={async () => {
          const patternId = await props.createPattern();
          props.setPatternId(patternId);
        }}
      >
        <BsPlusCircle />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CopyButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`New Pattern`}>
      <Editor.MenuButton onClick={() => props.copyPattern(pattern)}>
        <FaCopy />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ExportButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Export Pattern`}>
      <Editor.MenuButton>
        <Menu>
          <div className="relative z-50">
            <Menu.Button>
              <BsDownload />
            </Menu.Button>
            <Menu.Items className="absolute w-auto left-0 p-2 rounded-lg border-0.5 border-slate-200/80 whitespace-nowrap bg-slate-800/80 backdrop-blur-lg">
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
        onClick={props.undoPatterns}
        disabled={!props.isPatternCustom || !props.canUndoPatterns}
      >
        <CiUndo />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RedoButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Redo Change ${holdingAlt ? "(Cmd + Shift + Z)" : ""}`}
    >
      <Editor.MenuButton
        onClick={props.redoPatterns}
        disabled={!props.isPatternCustom || !props.canRedoPatterns}
      >
        <CiRedo />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PlayButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Play Pattern ${holdingAlt ? "(Space)" : ""}`}
    >
      <Editor.MenuButton
        className="active:text-emerald-500"
        disabled={props.isPatternEmpty}
        onClick={() => props.playPattern(pattern.id)}
      >
        <BsFillPlayCircleFill />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CommandTabs = () => (
    <div className="flex items-center font-light px-2 space-x-3 border-r border-r-slate-500">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`capitalize cursor-pointer ${
            commandTab === tab ? "text-green-500" : "text-slate-500"
          }`}
          onClick={() => setCommandTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );

  const DurationSixteenth = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Sixteenth Note${holdingAlt ? " (1)" : ""}`}
    >
      <Editor.MenuButton
        className={`invert rounded-sm ${
          duration === "16th" && props.isPatternCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => setDuration("16th")}
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
        className={`invert rounded-sm ${
          duration === "eighth" && props.isPatternCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => setDuration("eighth")}
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
        className={`invert rounded-sm ${
          duration === "quarter" && props.isPatternCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => setDuration("quarter")}
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
        className={`invert rounded-sm ${
          duration === "half" && props.isPatternCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => setDuration("half")}
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
        className={`invert rounded-sm ${
          duration === "whole" && props.isPatternCustom
            ? "ring-2 ring-orange-400 cursor-pointer bg-orange-400/80"
            : "cursor-default"
        }`}
        onClick={() => setDuration("whole")}
      >
        <img className="w-5 p-1 mt-3 object-contain" src={wholeNote} />
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
        className={`${adding ? "text-teal-400" : ""}`}
        onClick={() => (adding ? clearState() : setState("adding"))}
      >
        <BsBrush />
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
        disabled={props.isPatternEmpty}
      >
        <BsCursor
          className={`text-lg ${cursor.hidden ? "" : "text-emerald-500"}`}
        />
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
        className={`${inserting ? "text-teal-400" : ""}`}
        disabled={!props.isPatternCustom || cursor.hidden}
        onClick={() => (inserting ? clearState() : setState("inserting"))}
      >
        <BsInputCursorText />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const EraseButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Erase Note${holdingAlt ? " (-)" : ""}`}
    >
      <Editor.MenuButton
        className="active:text-red-400"
        onClick={onEraseClick}
        disabled={
          !props.isPatternCustom || props.isPatternEmpty || cursor.hidden
        }
      >
        <BsEraser />
      </Editor.MenuButton>
    </Editor.Tooltip>
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
        className="active:text-sky-300"
        onClick={onRestClick}
        disabled={!props.isPatternCustom || (!adding && !inserting)}
      >
        <BsWind />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ClearButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`Clear Pattern${holdingAlt ? " (Shift + Delete)" : ""}`}
    >
      <Editor.MenuButton
        className="active:text-gray-500 "
        onClick={() => props.clearPattern(pattern)}
        disabled={!props.isPatternCustom || props.isPatternEmpty}
      >
        <BsTrash />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ScalarTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Scalar Transpose`}>
      <Editor.MenuButton
        className={`rounded-sm cursor-pointer active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.transposePattern(pattern, sanitizedInput);
          }
        }}
      >
        <BsChevronExpand />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ChordalTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Chordal Transpose`}>
      <Editor.MenuButton
        className={`rotate-90 rounded-sm cursor-pointer active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.rotatePattern(pattern, sanitizedInput);
          }
        }}
      >
        <BsChevronExpand />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ContractButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Contract Pattern">
      <Editor.MenuButton
        onClick={() => props.shrinkPattern(pattern)}
        disabled={props.isPatternEmpty}
      >
        <BsArrowsAngleContract />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ExpandButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Expand Pattern">
      <Editor.MenuButton
        onClick={() => props.stretchPattern(pattern)}
        disabled={props.isPatternEmpty}
      >
        <BsArrowsAngleExpand />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ShuffleButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Shuffle Pattern">
      <Editor.MenuButton
        onClick={() => props.shufflePattern(pattern)}
        disabled={props.isPatternEmpty}
      >
        <BsShuffle />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RepeatButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Repeat Pattern">
      <Editor.MenuButton
        onClick={() => {
          const input = prompt("Repeat this pattern N times:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.repeatPattern(pattern, sanitizedInput);
          }
        }}
        disabled={props.isPatternEmpty}
      >
        <BsClock />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const LengthenButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Continue Pattern">
      <Editor.MenuButton
        onClick={() => {
          const input = prompt("Continue this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.lengthenPattern(pattern, sanitizedInput);
          }
        }}
        disabled={props.isPatternEmpty}
      >
        <BsBoxArrowRight className="text-xl" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const UnfoldButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Unfold Pattern">
      <Editor.MenuButton
        onClick={() => props.unfoldPattern(pattern)}
        disabled={props.isPatternEmpty}
      >
        <BsFillDatabaseFill />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ReverseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Reverse Pattern">
      <Editor.MenuButton
        onClick={() => props.reversePattern(pattern)}
        disabled={props.isPatternEmpty}
      >
        <BsArrowLeftRight />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RandomizeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Randomize Pattern">
      <Editor.MenuButton
        onClick={() => {
          const input = prompt("Randomize this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.randomizePattern(pattern, sanitizedInput);
          }
        }}
      >
        <BsFillDice5Fill />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  return (
    <Editor.Container className={`text-white h-full absolute top-0 w-full`}>
      <Editor.Body className="relative">
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
            editable={props.isPatternCustom}
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
              <UndoButton />
              <RedoButton />
              <PlayButton />
            </Editor.MenuGroup>
            {props.isPatternCustom ? <CommandTabs /> : null}
            <Editor.InstrumentListbox
              instrumentName={instrumentName}
              setInstrumentName={setInstrumentName}
            />
          </Editor.MenuRow>

          <Editor.MenuRow show={props.isPatternCustom} border={true}>
            {commandTab === "compose" && (
              <div className="flex">
                <Editor.MenuGroup border={true}>
                  <DurationSixteenth />
                  <DurationEighth />
                  <DurationQuarter />
                  <DurationHalf />
                  <DurationWhole />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={false}>
                  <AddButton />
                  <CursorButton />
                  <InsertButton />
                  <EraseButton />
                  <RestButton />
                  <ClearButton />
                </Editor.MenuGroup>
              </div>
            )}
            {commandTab === "transform" && (
              <div className="flex">
                <Editor.MenuGroup border={true}>
                  <ScalarTransposeButton />
                  <ChordalTransposeButton />
                  <RepeatButton />
                  <LengthenButton />
                  <RandomizeButton />
                </Editor.MenuGroup>
                <Editor.MenuGroup border={false}>
                  <ContractButton />
                  <ExpandButton />
                  <ReverseButton />
                  <ShuffleButton />
                  <UnfoldButton />
                  <ClearButton />
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
        {...editorState}
        sampler={globalSampler}
        cursor={cursor}
        duration={duration}
        holdingShift={holdingShift}
      />
    </Editor.Container>
  );
}
