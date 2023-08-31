import * as Editor from "../Editor";
import { BsBrushFill, BsEraserFill, BsTrash } from "react-icons/bs";

import Scales, { Scale } from "types/scales";
import EditorPiano from "../Piano";
import { MIDI } from "types/midi";
import { ScaleEditorProps } from ".";
import useEditorState from "../hooks/useEditorState";
import { Sampler } from "tone";
import useOSMD from "lib/opensheetmusicdisplay";
import ScaleList from "./ScaleList";
import { DemoXML } from "assets/demo";
import { Menu, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { getGlobalInstrumentName, getGlobalSampler } from "types/instrument";
import useScaleShortcuts from "./useScaleShortcuts";
import ContextMenu from "components/ContextMenu";

type ScaleViewState = "adding" | "removing";

export function ScaleEditor(props: ScaleEditorProps) {
  // Editor state
  const editorState = useEditorState<ScaleViewState>();
  const { setState, onState, clearState } = editorState;
  const adding = onState("adding");
  const removing = onState("removing");

  // Score information
  const scale = props.scale as Scale;
  const xml = scale ? Scales.exportToXML(scale?.notes ?? []) : DemoXML;
  const { score } = useOSMD({
    id: "scale-score",
    xml,
    className: "items-center w-full h-full p-4",
    noteCount: scale?.notes.length ?? 0,
    ignoreCursor: true,
  });
  useScaleShortcuts({ ...props, scale, onState, setState, clearState });

  // Sampler information
  const [globalSampler, setGlobalSampler] = useState(getGlobalSampler());
  const [instrumentName, setInstrumentName] = useState(
    getGlobalInstrumentName() || ""
  );
  useEffect(() => {
    setTimeout(() => {
      const sampler = getGlobalSampler();
      setGlobalSampler(sampler);
    }, 100);
  }, [instrumentName]);

  // Play note method for the piano
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (!scale) return;
    if (onState("adding")) props.addNoteToScale(scale.id, midiNumber);
    if (onState("removing")) props.removeNoteFromScale(scale.id, midiNumber);
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(MIDI.toPitch(midiNumber), "4n");
  };

  const ExportButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Export Pattern`}>
      <Editor.MenuButton>
        <Menu>
          <div className="relative z-50">
            <Menu.Button className="px-1 rounded active:bg-slate-500">
              Export
            </Menu.Button>
            <Menu.Items className="absolute w-auto left-0 p-2 rounded-lg border-0.5 border-slate-200/80 whitespace-nowrap bg-slate-800/80 backdrop-blur-lg">
              <Menu.Item>
                <div
                  className="hover:bg-slate-600/80 px-4 rounded"
                  onClick={() =>
                    props.exportScaleToMIDI({ ...scale, name: props.scaleName })
                  }
                >
                  Export MIDI
                </div>
              </Menu.Item>
              <Menu.Item>
                <div
                  className="hover:bg-slate-600/80 px-4 rounded"
                  onClick={() =>
                    props.exportScaleToXML({ ...scale, name: props.scaleName })
                  }
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

  const SaveButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Save Scale">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={async () => {
          if (!scale) return;
          props.createScale({ ...scale, name: props.scaleName });
        }}
      >
        Save
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PlayButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Play Scale">
      <Editor.MenuButton
        className="px-1 active:text-emerald-500"
        onClick={() => scale && props.playScale(scale.id)}
        disabled={!scale?.notes.length}
        disabledClass="px-1"
      >
        Play
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const UndoButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Undo Change">
      <Editor.MenuButton
        className="px-1"
        onClick={props.undoScales}
        disabled={!props.canUndoScales}
        disabledClass="px-1"
      >
        Undo
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RedoButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Redo Change">
      <Editor.MenuButton
        className="px-1"
        onClick={props.redoScales}
        disabled={!props.canRedoScales}
        disabledClass="px-1"
      >
        Redo
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const AddButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${adding ? "Stop Adding" : "Add Notes"}`}
    >
      <Editor.MenuButton
        className="px-1"
        active={onState("adding")}
        activeClass={"px-1 text-emerald-400/80"}
        onClick={onState("adding") ? clearState : () => setState("adding")}
      >
        <BsBrushFill className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RemoveButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${removing ? "Stop Removing" : "Remove Notes"}`}
    >
      <Editor.MenuButton
        className="px-1"
        active={onState("removing")}
        activeClass={"px-1 text-red-400/80"}
        onClick={onState("removing") ? clearState : () => setState("removing")}
      >
        <BsEraserFill className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ClearButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Clear Pattern`}>
      <Editor.MenuButton
        className="px-1 active:text-gray-400"
        onClick={() => scale && props.clearScale(scale.id)}
      >
        <BsTrash className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ScalarTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Scalar Transpose`}>
      <Editor.MenuButton
        className={`px-1 rounded-sm cursor-pointer active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.transposeScale(scale.id, sanitizedInput);
          }
        }}
      >
        Transpose
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ChordalTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Chordal Transpose`}>
      <Editor.MenuButton
        className={`px-1 rounded-sm cursor-pointer active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.rotateScale(scale.id, sanitizedInput);
          }
        }}
      >
        Invert
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const menuOptions = [
    {
      label: "Undo Last Action",
      onClick: props.undoScales,
      disabled: !props.canUndoScales,
    },
    {
      label: "Redo Last Action",
      onClick: props.redoScales,
      disabled: !props.canRedoScales,
      divideEnd: true,
    },
    {
      label: "Save Scale",
      onClick: () => {
        if (!scale) return;
        props.createScale({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
    },
    {
      label: "Export Scale to MIDI",
      onClick: () => {
        if (!scale) return;
        props.exportScaleToMIDI({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
    },
    {
      label: "Export Scale to XML",
      onClick: () => {
        if (!scale) return;
        props.exportScaleToXML({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
      divideEnd: true,
    },
    {
      label: `${adding ? "Stop" : "Start"} Adding Notes`,
      onClick: adding ? clearState : () => setState("adding"),
      disabled: !scale,
    },
    {
      label: `${removing ? "Stop" : "Start"} Removing Notes`,
      onClick: removing ? clearState : () => setState("removing"),
      disabled: !scale,
    },
    {
      label: "Clear Scale",
      onClick: () => scale && props.clearScale(scale.id),
      disabled: !scale,
    },
  ];

  return (
    <Editor.Container id="scale-editor">
      <ContextMenu
        targetId="scale-editor"
        options={menuOptions}
        className="-ml-[300px] -mt-4"
      />
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
          <Editor.Sidebar>
            <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2 font-nunito">
              Preset Scales
            </Editor.SidebarHeader>
            <ScaleList {...props} />
          </Editor.Sidebar>
        </Transition>

        <Editor.Content className={`ease-in-out duration-300`}>
          <Editor.Title
            title={props.scaleName}
            subtitle={props.scaleCategory}
            color={"bg-sky-500/80"}
          />
          <Editor.MenuRow show={true} border={false}>
            <Editor.MenuGroup border={true}>
              <ExportButton />
              <SaveButton />
              <UndoButton />
              <RedoButton />
              <PlayButton />
            </Editor.MenuGroup>
            <Editor.MenuGroup border={true}>
              <AddButton />
              <RemoveButton />
              <ClearButton />
            </Editor.MenuGroup>
            <Editor.MenuGroup border={true}>
              <ScalarTransposeButton />
              <ChordalTransposeButton />
            </Editor.MenuGroup>
            <Editor.InstrumentListbox
              instrumentName={instrumentName}
              setInstrumentName={setInstrumentName}
            />
          </Editor.MenuRow>

          <Editor.ScoreContainer className={`bg-white/90 mt-2 rounded-xl`}>
            {score}
          </Editor.ScoreContainer>
        </Editor.Content>
      </Editor.Body>
      <EditorPiano
        className={`border-t-8 ${
          onState("adding")
            ? "border-t-emerald-400"
            : onState("removing")
            ? "border-t-red-500"
            : "border-t-zinc-800/90"
        }`}
        sampler={globalSampler}
        playNote={playNote}
        stopNote={() => null}
      />
    </Editor.Container>
  );
}
