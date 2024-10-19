import { ScaleEditorProps } from "../ScaleEditor";
import classNames from "classnames";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { EditorListItem } from "features/Editor/components/EditorList";
import { updateScale } from "types/Scale/ScaleSlice";
import { getScaleNotes, getParentAsNewScale } from "types/Scale/ScaleFunctions";
import { resolveScaleToMidi } from "types/Scale/ScaleResolvers";
import { areScalesEqual } from "types/Scale/ScaleUtils";
import { ScaleObject } from "types/Scale/ScaleTypes";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { getScaleName } from "utils/scale";
import { PresetScaleGroupMap } from "assets/scales";
import { useMemo } from "react";

export interface PresetScaleProps extends ScaleEditorProps {
  presetScale: ScaleObject;
  category?: keyof typeof PresetScaleGroupMap;
}

export const PresetScale = (props: PresetScaleProps) => {
  const dispatch = useProjectDispatch();
  const { presetScale, scale, track } = props;
  const isEqual = areScalesEqual(presetScale, scale);
  const notes = getScaleNotes(presetScale);
  const midiNotes = resolveScaleToMidi(presetScale);
  const name = useMemo(() => {
    const name = getScaleName(midiNotes);
    const mode = props.category === "Diatonic Modes";
    if (mode && name.includes("Major Scale")) {
      return name.replace("Major Scale", "Ionian Mode");
    }
    if (mode && name.includes("Minor Scale")) {
      return name.replace("Minor Scale", "Aeolian Mode");
    }
    const messiaen = props.category === "Messiaen Modes";
    if (messiaen && name.includes("Whole Tone Scale")) {
      return name.replace("Whole Tone Scale", "Messiaen Mode 1");
    }
    if (messiaen && name.includes("Octatonic Scale (H-W")) {
      return name.replace("Octatonic Scale (H-W)", "Messiaen Mode 2");
    }
    return name;
  }, [midiNotes]);
  const scales = useProjectSelector((_) => selectTrackScaleChain(_, track?.id));

  // Clicking on a preset scale will update the current scale
  const onScaleClick = () => {
    if (!scale) return;
    const newNotes = getParentAsNewScale(scales.slice(0, -1), notes);
    dispatch(updateScale({ data: { id: scale.id, notes: newNotes } }));
  };

  // A preset scale will display its name and its first pitch if it can
  const PresetScaleName = () => (
    <div
      className={`border-0 bg-transparent w-full rounded p-1 cursor-pointer outline-none pointer-events-none overflow-ellipsis whitespace-nowrap`}
    >
      {name}
    </div>
  );

  if (!presetScale || !scale) return null;
  return (
    <EditorListItem
      className={classNames("group border-l", {
        "text-sky-500 border-l border-l-sky-500": isEqual,
        "text-slate-400 border-l-slate-500/80 hover:border-l-slate-300":
          !isEqual,
      })}
      onClick={onScaleClick}
    >
      <div className="flex relative items-center h-6">
        <PresetScaleName />
      </div>
    </EditorListItem>
  );
};
