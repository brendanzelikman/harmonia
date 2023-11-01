import { Editor } from "features/Editor/components";
import { useScaleEditorHotkeys } from "./hooks/useScaleEditorHotkeys";
import { useProjectSelector } from "redux/hooks";
import {
  selectScaleFutureLength,
  selectScalePastLength,
  selectTrackScaleNameAtTick,
} from "redux/selectors";
import { useScaleEditorScore } from "./hooks";
import { ScoreProps } from "lib/opensheetmusicdisplay";
import { ScaleEditor } from "./components";
import { UndoTypes } from "redux/undoTypes";
import { EditorProps } from "..";
import { getScaleCategory, getScaleName } from "types/Scale";

export interface ScaleEditorProps extends EditorProps, ScoreProps {
  // The scale editor passes additional information about the scale
  scaleName: string;
  scaleCategory: string;

  // The scale editor uses the scale history for undo/redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

function ScaleEditorComponent(props: EditorProps) {
  const scoreProps = useScaleEditorScore(props);

  // The scale editor passes additional information about the scale
  const scaleName = useProjectSelector((_) =>
    selectTrackScaleNameAtTick(_, props.track?.id, 0)
  );
  const scaleCategory = getScaleCategory(props.scale);

  // The scale editor uses the scale history for undo/redo
  const canUndo = useProjectSelector((_) => selectScalePastLength(_) > 0);
  const canRedo = useProjectSelector((_) => selectScaleFutureLength(_) > 0);
  const undo = () => props.dispatch({ type: UndoTypes.undoScales });
  const redo = () => props.dispatch({ type: UndoTypes.redoScales });

  // The scale editor passes its props down to all of its components
  const scaleEditorProps: ScaleEditorProps = {
    ...props,
    ...scoreProps,
    scaleName,
    scaleCategory,
    canUndo,
    canRedo,
    undo,
    redo,
  };

  // The scale editor has a custom set of hotkeys
  useScaleEditorHotkeys(scaleEditorProps);

  return (
    <Editor.Container id="scale-editor">
      <Editor.Body className="relative">
        <ScaleEditor.Sidebar {...scaleEditorProps} />
        <ScaleEditor.Content {...scaleEditorProps} />
      </Editor.Body>
      <ScaleEditor.Piano {...scaleEditorProps} />
      <ScaleEditor.ContextMenu {...scaleEditorProps} />
    </Editor.Container>
  );
}

export { ScaleEditorComponent as ScaleEditor };
