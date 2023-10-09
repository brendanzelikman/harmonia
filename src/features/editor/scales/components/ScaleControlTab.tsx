import { Menu } from "@headlessui/react";
import { ScaleEditorProps } from "..";
import * as Editor from "features/editor";
import { BsBrushFill, BsEraserFill, BsTrash } from "react-icons/bs";
import { InstrumentKey } from "types/Instrument";
import { unpackScale } from "types/Scale";

interface ScaleControlTabProps extends ScaleEditorProps {
  instrument: InstrumentKey;
  setInstrument: (instrument: InstrumentKey) => void;
}

export function ScaleControlTab(props: ScaleControlTabProps) {
  const { scale, scaleTrack } = props;
  if (!scale || !scaleTrack) return null;
  const notes = unpackScale(scale);

  const ExportButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Export Scale`}
    >
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
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Save Scale"
    >
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={async () => {
          if (!scale) return;
          props.createScale(props.scalePartial);
        }}
      >
        Save
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PlayButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Play Scale"
    >
      <Editor.MenuButton
        className="px-1 active:text-emerald-500"
        onClick={() => props.playScale(scale)}
        disabled={!notes.length}
        disabledClass="px-1"
      >
        Play
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const UndoButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Undo Change"
    >
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
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Redo Change"
    >
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
      placement="bottom"
      show={props.showingTooltips}
      content={`${props.adding ? "Stop Adding" : "Add Notes"}`}
    >
      <Editor.MenuButton
        className="px-1"
        active={props.adding}
        activeClass={"px-1 text-emerald-400/80"}
        onClick={props.adding ? props.clear : () => props.setState("adding")}
      >
        <BsBrushFill className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RemoveButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`${props.removing ? "Stop Removing" : "Remove Notes"}`}
    >
      <Editor.MenuButton
        className="px-1"
        active={props.removing}
        activeClass={"px-1 text-red-400/80"}
        onClick={
          props.removing ? props.clear : () => props.setState("removing")
        }
      >
        <BsEraserFill className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ClearButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Clear Pattern`}
    >
      <Editor.MenuButton
        className="px-1 active:text-gray-400"
        onClick={props.clearScaleTrack}
      >
        <BsTrash className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const TransposeButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Transpose Scale`}
    >
      <Editor.MenuButton
        className={`p-1 rounded active:bg-fuchsia-500/80`}
        onClick={() => {
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.transposeScaleTrack(scaleTrack.id, sanitizedInput);
          }
        }}
      >
        Transpose (T)
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RotateButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Rotate Scale`}
    >
      <Editor.MenuButton
        className={`p-1 rounded active:bg-fuchsia-500/80`}
        onClick={() => {
          const input = prompt("Transpose along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.rotateScaleTrack(scaleTrack.id, sanitizedInput);
          }
        }}
      >
        Transpose (t)
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  return (
    <>
      <Editor.MenuGroup border={true}>
        <ExportButton />
        <SaveButton />
        {/* <UndoButton />
        <RedoButton /> */}
        <PlayButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <AddButton />
        <RemoveButton />
        <ClearButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <TransposeButton />
        <RotateButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false}>
        <Editor.Tooltip
          show={props.showingTooltips}
          content={`Select Instrument`}
        >
          <Editor.InstrumentListbox
            value={props.instrument}
            setValue={props.setInstrument}
          />
        </Editor.Tooltip>
      </Editor.MenuGroup>
    </>
  );
}
