import { ScaleEditorProps } from "../ScaleEditor";
import classNames from "classnames";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { EditorListItem } from "features/Editor/components/EditorList";
import { updateScale } from "types/Scale/ScaleSlice";
import {
  getScaleNotes,
  getScaleName,
  getScaleNotePitchClass,
  getParentAsNewScale,
} from "types/Scale/ScaleFunctions";
import { resolveScaleToMidi } from "types/Scale/ScaleResolvers";
import { areScalesEqual, areScalesRelated } from "types/Scale/ScaleUtils";
import { ScaleObject } from "types/Scale/ScaleTypes";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { getPreferredKey } from "presets/keys";

export interface PresetScaleProps extends ScaleEditorProps {
  presetScale: ScaleObject;
}

export const PresetScale = (props: PresetScaleProps) => {
  const dispatch = useProjectDispatch();
  const { presetScale, scale, track, midiScale } = props;
  const isEqual = areScalesEqual(presetScale, scale);
  const isRelated = areScalesRelated(presetScale, scale);
  const notes = getScaleNotes(presetScale);
  const midiNotes = resolveScaleToMidi(presetScale);
  const name = getScaleName(presetScale, midiNotes);
  const scales = useProjectSelector((_) => selectTrackScaleChain(_, track?.id));

  // A preset scale will display its tonic pitch
  const trackScaleNotes = getScaleNotes(scale);
  const firstScaleNote = trackScaleNotes[0];
  const key = getPreferredKey(midiScale[0], presetScale.name);
  const firstPitch = firstScaleNote
    ? getScaleNotePitchClass(midiScale[0], key)
    : "";

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
      {(isEqual || isRelated) && firstPitch ? (
        <>
          <span className={`group-hover:hidden`}>{firstPitch} </span>
          <span className={`hidden group-hover:inline`}>C </span>
          {name}
        </>
      ) : (
        name
      )}
    </div>
  );

  if (!presetScale || !scale) return null;
  return (
    <EditorListItem
      className={classNames("group border-l", {
        "text-sky-500 border-l border-l-sky-500": isRelated,
        "text-slate-400 border-l-slate-500/80 hover:border-l-slate-300":
          !isRelated,
      })}
      onClick={onScaleClick}
    >
      <div className="flex relative items-center h-6">
        <PresetScaleName />
      </div>
    </EditorListItem>
  );
};
