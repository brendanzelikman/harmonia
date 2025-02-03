import { useScaleEditorHotkeys } from "./hooks/useScaleEditorHotkeys";
import { use, useDeep, useProjectSelector } from "types/hooks";
import { ScoreProps } from "lib/opensheetmusicdisplay";
import { EditorBody } from "../components/EditorBody";
import { EditorContainer } from "../components/EditorContainer";
import { ScaleEditorContent } from "./components/ScaleEditorContent";
import { ScaleEditorContextMenu } from "./components/ScaleEditorContextMenu";
import { ScaleEditorPiano } from "./components/ScaleEditorPiano";
import { ScaleEditorSidebar } from "./components/ScaleEditorSidebar";
import { getScaleCategory } from "utils/scale";
import { useScaleEditorScore } from "./hooks/useScaleEditorScore";
import { EditorProps } from "../Editor";
import { selectCustomScales } from "types/Scale/ScaleSelectors";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { selectTrackMidiScale } from "types/Track/TrackSelectors";
import { selectScaleName } from "types/Arrangement/ArrangementTrackSelectors";
import { resolveScaleToMidi } from "types/Scale/ScaleResolvers";
import { MidiScale } from "utils/midi";

export interface ScaleEditorProps extends EditorProps, ScoreProps {
  // The scale editor passes additional information about the scale
  midiScale: MidiScale;
  scaleName: string;
  scaleCategory: string;

  isCustom: boolean;
  isTracked: boolean;
  isEmpty: boolean;
}

function ScaleEditorComponent(props: EditorProps) {
  const customScales = useProjectSelector(selectCustomScales);
  const selectedTrackId = useProjectSelector(selectSelectedTrackId);

  // The scale editor passes additional information about the scale
  const trackId = props.track?.id;
  const midiScale = useDeep((_) =>
    trackId ? selectTrackMidiScale(_, trackId) : resolveScaleToMidi(props.scale)
  );
  const scaleName = use((_) => selectScaleName(_, props.scale?.id) ?? "");
  const scaleCategory = getScaleCategory(props.scale);

  const isCustom = customScales.some((s) => s.id === props.scale?.id);
  const isTracked = !!selectedTrackId;
  const isEmpty = !props.scale?.notes?.length;

  const scoreProps = useScaleEditorScore({
    ...props,
    midiScale,
    isCustom,
    isTracked,
  });

  // The scale editor passes its props down to all of its components
  const scaleEditorProps: ScaleEditorProps = {
    ...props,
    ...scoreProps,
    midiScale,
    scaleName,
    scaleCategory,
    isCustom,
    isTracked,
    isEmpty,
  };

  // The scale editor has a custom set of hotkeys
  useScaleEditorHotkeys(scaleEditorProps);

  return (
    <EditorContainer id="scale-editor">
      <EditorBody className="relative">
        <ScaleEditorSidebar {...scaleEditorProps} />
        <ScaleEditorContent {...scaleEditorProps} />
      </EditorBody>
      <ScaleEditorPiano {...scaleEditorProps} />
      <ScaleEditorContextMenu {...scaleEditorProps} />
    </EditorContainer>
  );
}

export { ScaleEditorComponent as ScaleEditor };
