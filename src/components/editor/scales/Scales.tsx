import * as Editor from "../Editor";
import {
  BsArrowDown,
  BsArrowLeft,
  BsArrowRight,
  BsArrowUp,
  BsFillDashCircleFill,
  BsFillFileMusicFill,
  BsFillPlayCircleFill,
  BsFillPlusCircleFill,
  BsFillTrashFill,
} from "react-icons/bs";

import Scales, { Scale } from "types/scales";
import EditorPiano from "../Piano";
import { MIDI } from "types/midi";
import { EditorScalesProps } from ".";
import useEditorState from "../hooks/useEditorState";
import useEventListeners from "hooks/useEventListeners";
import { isInputEvent } from "appUtil";
import { CiRedo, CiUndo } from "react-icons/ci";
import { Sampler } from "tone";
import useOSMD from "lib/opensheetmusicdisplay";
import ScaleList from "./ScaleList";
import { DemoXML } from "assets/demo";
import { Transition } from "@headlessui/react";
import useEditorData from "../hooks/useEditorData";
import { Tooltip } from "flowbite-react";

type ScaleViewState = "adding" | "removing";

export function EditorScales(props: EditorScalesProps) {
  const { trackScale } = props;
  const scale = useEditorData<Scale>(trackScale) as Scale;

  const activeCategory =
    Scales.PresetCategories.find((c) =>
      Scales.PresetGroups[c].some((m) => m.id === scale?.id)
    ) ?? "Custom Scales";

  const xml = scale ? Scales.serialize(scale?.notes ?? []) : DemoXML;
  const { score } = useOSMD({
    id: "scale-score",
    xml,
    className: "flex items-center w-full h-full p-4",
    noteCount: scale?.notes.length ?? 0,
  });

  const editorState = useEditorState<ScaleViewState>();
  const { state, setState, onState, clearState } = editorState;

  useEventListeners(
    {
      // "Cmd + Z" = Undo
      // "Cmd + Shift + Z" = Redo
      z: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          const holdingShift = !!(e as KeyboardEvent).shiftKey;
          if (holdingShift) {
            props.redoScales();
          } else {
            props.undoScales();
          }
        },
      },
      // + = Start/Stop Adding Notes
      "+": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (onState("adding")) {
            clearState();
          } else {
            setState("adding");
          }
        },
      },
      // - = Start/Stop Removing Notes
      "-": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (onState("removing")) {
            clearState();
          } else {
            setState("removing");
          }
        },
      },
      // Delete = Clear Scale
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (scale) props.clearScale(scale.id);
        },
      },
      // [ = Transpose Scale Down
      "[": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (scale) props.transposeScale(scale.id, -1);
        },
      },
      // ] = Transpose Scale Up
      "]": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (scale) props.transposeScale(scale.id, 1);
        },
      },
      // { = Invert Scale Down
      "{": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (scale) props.rotateScale(scale.id, -1);
        },
      },
      // } = Invert Scale Up
      "}": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (scale) props.rotateScale(scale.id, 1);
        },
      },
    },
    [state]
  );

  // Add the custom scales to the presets
  const ScalePresets = {
    ...Scales.PresetGroups,
    "Custom Scales": props.customScales,
  };

  const isScaleEmpty = !scale?.notes.length;

  // Find the matching scale in the presets (if any)
  const matchingScales = Object.values(ScalePresets)
    .flat()
    .filter((preset) => scale && Scales.areRelated(scale, preset));

  // Set the name of the scale to the matching scale, NOT the underlying scale
  const scaleName = (scale?: Scale) => {
    if (!scale) return "No Scale";
    const firstScaleNote = scale.notes[0];
    const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";
    const match = matchingScales.find((s) => Scales.areRelated(scale, s));
    return match
      ? `${match.name} ${!!firstPitch ? ` (${firstPitch})` : ""}`
      : "Custom Scale";
  };

  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (!scale) return;
    if (onState("adding")) props.addNoteToScale(scale.id, midiNumber);
    if (onState("removing")) props.removeNoteFromScale(scale.id, midiNumber);
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(MIDI.toPitch(midiNumber), "4n");
  };

  return (
    <Editor.Container>
      <Editor.Body>
        <Editor.Sidebar>
          <Editor.CardHeader className="border-b border-b-slate-500/50 mb-2 font-nunito">
            Preset Scales
          </Editor.CardHeader>
          <ScaleList {...props} />
        </Editor.Sidebar>
        <Editor.Content>
          <Editor.Title
            title={scaleName(scale)}
            subtitle={activeCategory}
            color={"bg-sky-500/80"}
          />
          <Editor.ScoreContainer className={`bg-white/90`}>
            {score}
          </Editor.ScoreContainer>
          <Transition
            show={!!scale}
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="mt-auto"
          >
            <Editor.Menu>
              <Editor.MenuGroup label="Actions">
                <Tooltip content="Undo Change">
                  <Editor.MenuButton
                    onClick={props.undoScales}
                    disabled={!props.canUndoScales}
                  >
                    <CiUndo />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Redo Change">
                  <Editor.MenuButton
                    onClick={props.redoScales}
                    disabled={!props.canRedoScales}
                  >
                    <CiRedo />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Play Scale">
                  <Editor.MenuButton
                    className="active:text-emerald-500"
                    onClick={() => scale && props.playScale(scale.id)}
                    disabled={isScaleEmpty}
                  >
                    <BsFillPlayCircleFill />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Export to XML">
                  <Editor.MenuButton
                    className="active:text-emerald-500"
                    disabled={isScaleEmpty}
                    onClick={() =>
                      props.exportScale({
                        ...scale,
                        name: matchingScales[0]?.name ?? "Custom Scale",
                      })
                    }
                  >
                    <BsFillFileMusicFill />
                  </Editor.MenuButton>
                </Tooltip>
              </Editor.MenuGroup>
              <Editor.MenuGroup label="Notes">
                <Tooltip
                  content={onState("adding") ? "Stop Adding" : "Add Notes"}
                >
                  <Editor.MenuButton
                    active={onState("adding")}
                    activeClass={"text-emerald-500/80"}
                    onClick={
                      onState("adding") ? clearState : () => setState("adding")
                    }
                  >
                    <BsFillPlusCircleFill />
                  </Editor.MenuButton>
                </Tooltip>

                <Tooltip
                  content={
                    onState("removing") ? "Stop Removing" : "Remove Notes"
                  }
                >
                  <Editor.MenuButton
                    active={onState("removing")}
                    activeClass={"text-red-400/80"}
                    onClick={
                      onState("removing")
                        ? clearState
                        : () => setState("removing")
                    }
                  >
                    <BsFillDashCircleFill />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Clear Scale">
                  <Editor.MenuButton
                    className="active:text-gray-400"
                    onClick={() => scale && props.clearScale(scale.id)}
                  >
                    <BsFillTrashFill />
                  </Editor.MenuButton>
                </Tooltip>
              </Editor.MenuGroup>
              <Editor.MenuGroup label="Transform">
                <Tooltip content="Transpose Down (N-1)">
                  <Editor.MenuButton
                    onClick={() => scale && props.transposeScale(scale.id, -1)}
                    disabled={isScaleEmpty}
                  >
                    <BsArrowDown />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Transpose Up (N1)">
                  <Editor.MenuButton
                    onClick={() => scale && props.transposeScale(scale.id, 1)}
                    disabled={isScaleEmpty}
                  >
                    <BsArrowUp />
                  </Editor.MenuButton>
                </Tooltip>

                <Tooltip content="Invert Down (t-1)">
                  <Editor.MenuButton
                    onClick={() => scale && props.rotateScale(scale.id, -1)}
                    disabled={isScaleEmpty}
                  >
                    <BsArrowLeft />
                  </Editor.MenuButton>
                </Tooltip>
                <Tooltip content="Invert Up (t1)">
                  <Editor.MenuButton
                    onClick={() => scale && props.rotateScale(scale.id, 1)}
                    disabled={isScaleEmpty}
                  >
                    <BsArrowRight />
                  </Editor.MenuButton>
                </Tooltip>
              </Editor.MenuGroup>
            </Editor.Menu>
          </Transition>
        </Editor.Content>
      </Editor.Body>
      <EditorPiano
        className={`border-t-4 ${
          onState("adding")
            ? "border-t-emerald-500/80"
            : onState("removing")
            ? "border-t-red-500"
            : "border-t-zinc-800/90"
        }`}
        playNote={playNote}
        stopNote={() => null}
      />
    </Editor.Container>
  );
}
