import { ScaleEditorProps } from "../ScaleEditor";
import { Editor } from "features/Editor/components";
import { ScaleEditorToolbar } from "./ScaleEditorToolbar";

export function ScaleEditorContent(props: ScaleEditorProps) {
  const { score, scaleName, scaleCategory } = props;

  /** The scale editor displays the name of the scale as its title. */
  const ScaleEditorTitle = () => (
    <Editor.Header
      title={scaleName}
      subtitle={scaleCategory}
      color={"bg-gradient-to-tr from-sky-500 to-sky-600"}
    />
  );

  return (
    <Editor.Content className={`ease-in-out duration-300`}>
      <ScaleEditorTitle />
      <ScaleEditorToolbar {...props} />
      <Editor.Score className={`bg-white/90 mt-2`} score={score} />
    </Editor.Content>
  );
}
