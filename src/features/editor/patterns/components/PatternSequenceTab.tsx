import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import { TransformCoordinate } from "types/transform";
import { blurOnMouseUp } from "utils";
import { MIDI, Scale, transposeScale } from "types";
import { PresetScaleList } from "types/presets/scales";
import { BsMusicNote } from "react-icons/bs";
import { useEffect, useState } from "react";

interface PatternSequenceTabProps extends PatternEditorCursorProps {
  transpose: TransformCoordinate;
  setTranspose: React.Dispatch<React.SetStateAction<TransformCoordinate>>;
  scale: Scale;
  setScale: React.Dispatch<React.SetStateAction<Scale>>;
}

export function PatternSequenceTab(props: PatternSequenceTabProps) {
  const { transpose, setTranspose, scale, setScale } = props;

  const tonic = scale.notes[0];
  const tonicKey = MIDI.toPitchClass(tonic);

  const [key, setKey] = useState(MIDI.toPitchClass(scale.notes?.[0]));
  useEffect(() => {
    if (tonicKey !== key) {
      setScale((prev) => {
        const diff = MIDI.ChromaticNumber(tonic) - MIDI.ChromaticNumber(key);
        return transposeScale(prev, diff);
      });
    }
  }, [key]);

  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <Editor.MenuButton
          className="px-2 py-0 text-xs bg-slate-800 border border-slate-600 active:bg-slate-600"
          onClick={() => props.setTranspose((prev) => ({ ...prev, N: 0 }))}
        >
          Reset
        </Editor.MenuButton>
        <div className="flex flex-col ml-1 pr-3 items-center justify-center">
          <label className="text-xs pb-1 pr-2">Chromatic: {transpose.N}</label>
          <input
            className="w-32 accent-fuchsia-600 text-center"
            type="range"
            min={-12}
            max={12}
            value={transpose.N}
            onChange={(e) =>
              setTranspose({ ...transpose, N: parseInt(e.target.value) })
            }
            onDoubleClick={() => setTranspose({ ...transpose, N: 0 })}
            onMouseUp={blurOnMouseUp}
          />
        </div>
        <Editor.MenuButton
          className="px-2 py-0 text-xs bg-slate-800 border border-slate-600 active:bg-slate-600"
          onClick={() => props.setTranspose((prev) => ({ ...prev, T: 0 }))}
        >
          Reset
        </Editor.MenuButton>
        <div className="flex flex-col ml-1 pr-3 items-center justify-center">
          <label className="text-xs pb-1 pr-2">Scalar: {transpose.T}</label>
          <input
            className="w-32 accent-fuchsia-600 text-center"
            type="range"
            min={-12}
            max={12}
            value={transpose.T}
            onChange={(e) =>
              setTranspose({ ...transpose, T: parseInt(e.target.value) })
            }
            onDoubleClick={() => setTranspose({ ...transpose, T: 0 })}
            onMouseUp={blurOnMouseUp}
          />
        </div>
        <Editor.MenuButton
          className="px-2 py-0 text-xs bg-slate-800 border border-slate-600 active:bg-slate-600"
          onClick={() => props.setTranspose((prev) => ({ ...prev, t: 0 }))}
        >
          Reset
        </Editor.MenuButton>
        <div className="flex flex-col ml-1 pr-3 items-center justify-center">
          <label className="text-xs pb-1 pr-2">Chordal: {transpose.t}</label>
          <input
            className="w-32 accent-fuchsia-600 text-center"
            type="range"
            min={-12}
            max={12}
            value={transpose.t}
            onChange={(e) =>
              setTranspose({ ...transpose, t: parseInt(e.target.value) })
            }
            onDoubleClick={() => setTranspose({ ...transpose, t: 0 })}
            onMouseUp={blurOnMouseUp}
          />
        </div>
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false} className="items-center">
        <Editor.CustomListbox
          value={key}
          setValue={(value) => setKey(value)}
          options={MIDI.ChromaticNotes}
          className="mr-1"
          icon={<BsMusicNote className="mr-2 " />}
        />
        <Editor.CustomListbox
          value={props.scale}
          setValue={props.setScale}
          options={PresetScaleList}
          getOptionKey={(option) => option.id}
          getOptionValue={(option) => option.id}
          getOptionName={(option) => option.name}
          icon={<BsMusicNote className="mr-2 " />}
        />
      </Editor.MenuGroup>
    </div>
  );
}
