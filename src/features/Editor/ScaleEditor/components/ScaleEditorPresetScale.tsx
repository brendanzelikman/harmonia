import { Editor } from "features/Editor/components";
import { updateScale } from "redux/Scale";
import * as _ from "types/Scale";
import { ScaleEditorProps } from "../ScaleEditor";
import classNames from "classnames";

export interface PresetScaleProps extends ScaleEditorProps {
  presetScale: _.Scale;
}

export const PresetScale = (props: PresetScaleProps) => {
  const { dispatch, presetScale, scale } = props;
  const isEqual = _.areScalesEqual(presetScale, scale);
  const isRelated = _.areScalesRelated(presetScale, scale);
  const notes = _.getScaleAsArray(presetScale);
  const name = _.getScaleName(presetScale);

  // A preset scale will display its tonic pitch
  const trackScaleNotes = _.getScaleAsArray(scale);
  const firstScaleNote = trackScaleNotes[0];
  const firstPitch = firstScaleNote
    ? _.getScaleNoteAsPitchClass(firstScaleNote)
    : "";

  // Clicking on a preset scale will update the current scale
  const onScaleClick = () => {
    if (!scale) return;
    dispatch(updateScale({ id: scale.id, notes }));
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
    <Editor.ListItem
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
    </Editor.ListItem>
  );
};
