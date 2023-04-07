import { CiRedo, CiUndo } from "react-icons/ci";
import { useEffect, useState } from "react";
import {
  BsArrowDown,
  BsArrowLeft,
  BsArrowRight,
  BsArrowsAngleContract,
  BsArrowsAngleExpand,
  BsArrowUp,
  BsBookHalf,
  BsCaretLeft,
  BsCaretRight,
  BsChevronBarRight,
  BsEraserFill,
  BsFillBrushFill,
  BsFillDice5Fill,
  BsFillFileMusicFill,
  BsFillPlayCircleFill,
  BsFillSkipEndFill,
  BsFillSkipStartFill,
  BsInputCursor,
  BsPencil,
  BsPlusCircle,
  BsScissors,
  BsShuffle,
  BsTrash,
} from "react-icons/bs";
import { SiVeepee } from "react-icons/si";

import wholeNote from "assets/noteheads/whole.svg";
import halfNote from "assets/noteheads/half.png";
import quarterNote from "assets/noteheads/quarter.png";
import eighthNote from "assets/noteheads/eighth.png";
import sixteenthNote from "assets/noteheads/sixteenth.png";

import useEventListeners from "hooks/useEventListeners";
import { MIDI } from "types/midi";
import Patterns from "types/patterns";
import { EditorPatternsProps } from ".";
import useEditorState from "../hooks/useEditorState";
import * as Editor from "../Editor";
import { Duration } from "types/units";
import { DEFAULT_DURATION } from "appConstants";
import { durationToBeats, isInputEvent } from "appUtil";
import { PatternsPiano } from "./Piano";
import useOSMD from "lib/opensheetmusicdisplay";
import PatternList from "./PatternList";
import { DemoXML } from "assets/demo";
import { Transition } from "@headlessui/react";

type PatternsViewState = "adding" | "inserting";

export function EditorPatterns(props: EditorPatternsProps) {
  const { activePattern } = props;
  const activeCategory =
    Patterns.PresetCategories.find((c) =>
      Patterns.PresetGroups[c].some((m) => m.id === activePattern?.id)
    ) ?? "Custom Patterns";

  const scale = props.scale;
  const xml =
    activePattern && scale ? Patterns.serialize(activePattern, scale) : DemoXML;

  const isPatternEmpty = !activePattern?.stream.length;
  const isPatternCustom = props.customPatterns.some(
    (m) => m.id === activePattern?.id
  );

  const { score, cursor } = useOSMD({
    id: "pattern-score",
    xml,
    className: "w-full h-full p-2",
    noteCount: activePattern?.stream.length || 0,
    options: {
      drawTimeSignatures: false,
    },
  });

  const editorState = useEditorState<PatternsViewState>();
  const { state, setState, onState, clearState } = editorState;

  // Selected note duration
  const [duration, setDuration] = useState<Duration>(DEFAULT_DURATION);

  // Detect shift key
  const [holdingShift, setHoldingShift] = useState(false);
  useEventListeners(
    {
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (onState("adding")) {
            clearState();
          } else if (!isPatternEmpty) {
            setState("adding");
          }
        },
      },
      r: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (activePattern && scale) {
            if (onState("adding")) {
              const midiNote = {
                MIDI: MIDI.Rest,
                duration: durationToBeats(duration),
              };
              if (cursor.hidden) {
                props.addPatternNote(activePattern.id, midiNote);
              } else {
                props.updatePatternNote(
                  activePattern.id,
                  cursor.index,
                  midiNote
                );
              }
            }
          }
        },
      },
      ArrowLeft: {
        keydown: () => cursor.prev(),
      },
      ArrowRight: {
        keydown: () => cursor.next(),
      },
      Shift: {
        keydown: (e) => !isInputEvent(e) && setHoldingShift(true),
        keyup: (e) => !isInputEvent(e) && setHoldingShift(false),
      },
    },
    [
      state,
      setHoldingShift,
      activePattern,
      cursor,
      scale,
      duration,
      isPatternEmpty,
    ]
  );

  useEffect(() => {
    if (cursor.hidden && onState("inserting")) clearState();
  }, [cursor.hidden, onState]);

  useEffect(() => {
    if (!isPatternCustom) clearState();
  }, [isPatternCustom, clearState]);

  const onRestClick = () => {
    if (!activePattern) return;
    const note = {
      MIDI: MIDI.Rest,
      duration: durationToBeats(duration),
    };
    if (onState("adding")) {
      if (cursor.hidden) {
        props.addPatternNote(activePattern.id, note);
      } else {
        props.updatePatternNote(activePattern.id, cursor.index, note);
      }
    } else if (onState("inserting")) {
      if (cursor.hidden) {
        props.addPatternNote(activePattern.id, note);
      } else {
        props.insertPatternNote(activePattern.id, note, cursor.index);
      }
    }
  };

  const rewindCursor = () => cursor.setIndex(0);
  const forwardCursor = () =>
    cursor.setIndex((activePattern?.stream.length ?? 1) - 1);

  return (
    <Editor.Container>
      <Editor.Body>
        <Editor.Sidebar>
          <Editor.CardHeader className="border-b border-b-slate-500/50 mb-2 font-nunito">
            Preset Patterns
          </Editor.CardHeader>
          <PatternList {...props} />
        </Editor.Sidebar>
        <Editor.Content>
          <Editor.Title
            editable={isPatternCustom}
            title={activePattern?.name ?? "Pattern"}
            setTitle={(name) => props.setPatternName(activePattern!, name)}
            subtitle={activeCategory}
            color={"bg-emerald-500/80"}
          />
          <Editor.ScoreContainer className={`bg-white/90`}>
            {score}
          </Editor.ScoreContainer>
          <Transition
            show={!!activePattern}
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="mt-auto pt-6"
          >
            <Editor.Menu>
              <Editor.MenuGroup label="Actions">
                <div className="flex flex-col h-full mb-4">
                  <div className="flex">
                    {/* <Tooltip content="Undo Action"> */}
                    <Editor.MenuButton
                      className="mx-2"
                      onClick={props.undoPatterns}
                      disabled={!props.canUndoPatterns}
                    >
                      <CiUndo />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Redo Action"> */}
                    <Editor.MenuButton
                      onClick={props.redoPatterns}
                      disabled={!props.canRedoPatterns}
                    >
                      <CiRedo />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Play Pattern"> */}
                    <Editor.MenuButton
                      className="active:text-emerald-500"
                      disabled={isPatternEmpty}
                      onClick={() => props.playPattern(activePattern!.id)}
                    >
                      <BsFillPlayCircleFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Draw Pattern"> */}
                    <Editor.MenuButton
                      className="active:text-emerald-500"
                      disabled={isPatternEmpty}
                      onClick={() =>
                        props.startAddingPatternAsClip(activePattern!)
                      }
                    >
                      <BsFillBrushFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Export Pattern"> */}
                    <Editor.MenuButton
                      className="active:text-emerald-500"
                      disabled={isPatternEmpty}
                      onClick={() => props.exportPattern(activePattern!)}
                    >
                      <BsFillFileMusicFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                  <div className="flex">
                    {/* <Tooltip content="Skip Start"> */}
                    <Editor.MenuButton
                      onClick={rewindCursor}
                      disabled={cursor.hidden || cursor.index === 0}
                    >
                      <BsFillSkipStartFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Move Back"> */}
                    <Editor.MenuButton
                      onClick={cursor.prev}
                      disabled={cursor.hidden || cursor.index === 0}
                    >
                      <BsCaretLeft />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip
                      content={cursor.hidden ? "Show Cursor" : "Hide Cursor"}
                    > */}
                    <Editor.MenuButton
                      onClick={cursor.hidden ? cursor.show : cursor.hide}
                      disabled={isPatternEmpty}
                    >
                      <BsInputCursor
                        className={`${cursor.hidden ? "" : "text-emerald-500"}`}
                      />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Move Right"> */}
                    <Editor.MenuButton
                      onClick={cursor.next}
                      disabled={
                        cursor.hidden ||
                        cursor.index === activePattern!.stream.length - 1
                      }
                    >
                      <BsCaretRight />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Skip End"> */}
                    <Editor.MenuButton
                      onClick={forwardCursor}
                      disabled={
                        cursor.hidden ||
                        cursor.index === activePattern!.stream.length - 1
                      }
                    >
                      <BsFillSkipEndFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                </div>
              </Editor.MenuGroup>
              <Editor.MenuGroup label="Notes">
                <div className="flex flex-col h-full">
                  <div className="flex justify-center items-center">
                    {/* <Tooltip content="Sixteenth Note"> */}
                    <Editor.MenuButton
                      className={`w-7 h-7 rounded-full ${
                        isPatternCustom ? "bg-slate-200" : "bg-gray-400"
                      } ${
                        duration === "16th" && isPatternCustom
                          ? "ring-2 ring-emerald-500 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => setDuration("16th")}
                    >
                      <img className="h-5 object-contain" src={sixteenthNote} />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Eighth Note"> */}
                    <Editor.MenuButton
                      className={`w-7 h-7 rounded-full ${
                        isPatternCustom ? "bg-slate-200" : "bg-gray-400"
                      } ${
                        duration === "eighth" && isPatternCustom
                          ? "ring-2 ring-emerald-500 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => setDuration("eighth")}
                    >
                      <img
                        className="h-5 ml-0.5 object-contain"
                        src={eighthNote}
                      />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Quarter Note"> */}
                    <Editor.MenuButton
                      className={`w-7 h-7 rounded-full ${
                        isPatternCustom ? "bg-slate-200" : "bg-gray-400"
                      } ${
                        duration === "quarter" && isPatternCustom
                          ? "ring-2 ring-emerald-500 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => setDuration("quarter")}
                    >
                      <img
                        className="h-5 mt-1 object-contain"
                        src={quarterNote}
                      />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Half Note"> */}
                    <Editor.MenuButton
                      className={`w-7 h-7 rounded-full ${
                        isPatternCustom ? "bg-slate-200" : "bg-gray-400"
                      } ${
                        duration === "half" && isPatternCustom
                          ? "ring-2 ring-emerald-500 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => setDuration("half")}
                    >
                      <img className="h-5 mt-0.5" src={halfNote} />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Whole Note"> */}
                    <Editor.MenuButton
                      className={`w-7 h-7 rounded-full ${
                        isPatternCustom ? "bg-slate-200" : "bg-gray-400"
                      } ${
                        duration === "whole" && isPatternCustom
                          ? "ring-2 ring-emerald-500 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => setDuration("whole")}
                    >
                      <img
                        className="w-5 p-1 mt-3 object-contain"
                        src={wholeNote}
                      />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                  <div className="flex justify-center items-center">
                    {/* <Tooltip
                      content={
                        onState("adding")
                          ? cursor.hidden
                            ? "Stop Adding"
                            : "Stop Editing"
                          : cursor.hidden
                          ? "Add Note"
                          : "Edit Note"
                      }
                    > */}
                    <Editor.MenuButton
                      disabled={!isPatternCustom}
                      className={onState("adding") ? "text-green-500" : ""}
                      onClick={() =>
                        onState("adding") ? clearState() : setState("adding")
                      }
                    >
                      {cursor.hidden ? <BsPlusCircle /> : <BsPencil />}
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    <Editor.MenuButton
                      disabled={!isPatternCustom || cursor.hidden}
                      className={onState("inserting") ? "text-green-500" : ""}
                      onClick={() =>
                        onState("inserting")
                          ? clearState()
                          : setState("inserting")
                      }
                    >
                      <BsChevronBarRight />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}

                    {/* <Tooltip
                      content={
                        onState("adding")
                          ? cursor.hidden
                            ? "Add Rest"
                            : "Set Rest"
                          : onState("inserting")
                          ? cursor.hidden
                            ? "Append Rest"
                            : "Insert Rest"
                          : "Add Rest"
                      }
                    > */}
                    <Editor.MenuButton
                      className="active:text-sky-300"
                      onClick={onRestClick}
                      disabled={
                        !isPatternCustom ||
                        (!onState("adding") && !onState("inserting"))
                      }
                    >
                      <SiVeepee />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}

                    {/* <Tooltip content="Erase Note"> */}
                    <Editor.MenuButton
                      className="active:text-red-500"
                      onClick={() => {
                        if (!isPatternEmpty && !cursor.hidden) {
                          props.removePatternNote(
                            activePattern.id,
                            cursor.index
                          );
                        }
                      }}
                      disabled={
                        !isPatternCustom || isPatternEmpty || cursor.hidden
                      }
                    >
                      <BsEraserFill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}

                    {/* <Tooltip content="Clear Pattern"> */}
                    <Editor.MenuButton
                      className="active:text-gray-500"
                      onClick={() => props.clearPattern(activePattern!)}
                      disabled={!isPatternCustom || isPatternEmpty}
                    >
                      <BsTrash />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                </div>
              </Editor.MenuGroup>
              <Editor.MenuGroup label="Transform">
                <div className="flex flex-col h-full mb-4">
                  <div className="flex justify-center items-center">
                    {/* <Tooltip content="+1 (Scalar)"> */}
                    <Editor.MenuButton
                      onClick={() => props.transposePattern(activePattern!, 1)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowUp />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="-1 (Scalar)"> */}
                    <Editor.MenuButton
                      onClick={() => props.transposePattern(activePattern!, -1)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowDown />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="+1 (Chordal)"> */}
                    <Editor.MenuButton
                      onClick={() => props.invertPattern(activePattern!, -1)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowLeft />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="-1 (Chordal)"> */}
                    <Editor.MenuButton
                      onClick={() => props.invertPattern(activePattern!, 1)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowRight />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Random"> */}
                    <Editor.MenuButton
                      onClick={() =>
                        props.randomTransposePattern(activePattern!)
                      }
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsFillDice5Fill />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                  <div className="flex">
                    {/* <Tooltip content="Contract Pattern"> */}
                    <Editor.MenuButton
                      onClick={() => props.shrinkPattern(activePattern!)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowsAngleContract />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Expand Pattern"> */}
                    <Editor.MenuButton
                      onClick={() => props.stretchPattern(activePattern!)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsArrowsAngleExpand />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Repeat Pattern"> */}
                    <Editor.MenuButton
                      onClick={() => props.repeatPattern(activePattern!)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsBookHalf />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Halve Pattern"> */}
                    <Editor.MenuButton
                      onClick={() => props.halvePattern(activePattern!)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsScissors />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                    {/* <Tooltip content="Shuffle Pattern"> */}
                    <Editor.MenuButton
                      onClick={() => props.shufflePattern(activePattern!)}
                      disabled={isPatternEmpty || !isPatternCustom}
                    >
                      <BsShuffle />
                    </Editor.MenuButton>
                    {/* </Tooltip> */}
                  </div>
                </div>
              </Editor.MenuGroup>
              {/* )} */}
            </Editor.Menu>
          </Transition>
        </Editor.Content>
      </Editor.Body>
      <PatternsPiano
        {...props}
        {...editorState}
        cursor={cursor}
        duration={duration}
        holdingShift={holdingShift}
      />
    </Editor.Container>
  );
}
