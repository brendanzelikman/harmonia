import { EditorContent } from "features/Editor/components/EditorContent";
import { EditorHeader } from "features/Editor/components/EditorHeader";
import { EditorScore } from "features/Editor/components/EditorScore";
import { ScaleEditorProps } from "../ScaleEditor";
import { ScaleEditorToolbar } from "./ScaleEditorToolbar";
import { useProjectDispatch } from "types/hooks";
import { ScaleEditorMenu } from "./ScaleEditorMenu";
import { ScaleEditorNotebox } from "./ScaleEditorNotebox";
import { updateScale } from "types/Scale/ScaleSlice";

export function ScaleEditorContent(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const {
    score,
    scaleName,
    scaleCategory,
    isAdding,
    isRemoving,
    isCustom,
    scale,
  } = props;

  /** The scale editor displays the name of the scale as its title. */
  const ScaleEditorTitle = () => (
    <EditorHeader
      title={scaleName}
      editable={isCustom}
      setTitle={(name) =>
        isCustom && scale
          ? dispatch(updateScale({ data: { id: scale.id, name } }))
          : null
      }
      subtitle={scaleCategory}
      color={"bg-gradient-to-tr from-sky-500 to-sky-600"}
    />
  );

  const scoreBorder = isAdding
    ? "ring-sky-600"
    : isRemoving
    ? "ring-red-500"
    : "ring-stone-800";

  return (
    <EditorContent>
      {ScaleEditorTitle()}
      <ScaleEditorToolbar {...props} />
      {(props.isCustom || props.isTracked) && <ScaleEditorMenu {...props} />}
      <EditorScore className={`my-4 ring-4 ${scoreBorder}`} score={score} />
      <ScaleEditorNotebox {...props} />
    </EditorContent>
  );
}
