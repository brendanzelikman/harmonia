import * as _ from "types/Editor";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor } from "redux/Editor";
import { EditorNavbar } from "./components/EditorNavbar";
import { useHotkeyScope } from "hooks";
import { EasyTransition } from "components/Transition";
import { Track } from "types/Track";
import { selectSelectedPattern, selectSelectedTrack } from "redux/Timeline";
import { ScaleObject } from "types/Scale";
import { Pattern } from "types/Pattern";
import { selectTrackScale } from "redux/Track";
import { Instrument, InstrumentKey, LiveAudioInstance } from "types/Instrument";
import { useEditorInstrument } from "./hooks/useEditorInstrument";
import { Dispatch } from "types/Project";
import { Editor } from "./components";
import { EditorTooltipProps } from "./components/EditorTooltip";
import { EditorButtonProps } from "./components/EditorButton";
import { useEditorView } from "./hooks/useEditorView";
import classNames from "classnames";

export interface EditorProps extends _.Editor {
  dispatch: Dispatch;

  // The editor uses currently selected objects for various purposes
  track?: Track;
  scale?: ScaleObject;
  pattern?: Pattern;

  // Each view has a corresponding instrument available
  instrument?: Instrument;
  setInstrument: (key: InstrumentKey) => void;
  instance?: LiveAudioInstance;

  // The editor can only be in one view at a time
  onScaleEditor: boolean;
  onPatternEditor: boolean;
  onInstrumentEditor: boolean;

  // The editor has various states describing it
  isOpen: boolean;
  isVisible: boolean;
  isActive: boolean;
  isAdding: boolean;
  isInserting: boolean;
  isRemoving: boolean;

  // The editor has global settings
  isShowingTracks: boolean;
  isShowingTooltips: boolean;
  isShowingPiano: boolean;
  isShowingSidebar: boolean;

  // The editor passes some components with derived props
  Tooltip: React.FC<EditorTooltipProps>;
  Button: React.FC<EditorButtonProps>;
}

function EditorComponent() {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);

  // The editor uses currently selected objects for various purposes
  const track = useProjectSelector(selectSelectedTrack);
  const scale = useProjectSelector((_) => selectTrackScale(_, track?.id));
  const pattern = useProjectSelector(selectSelectedPattern);

  // Each view has a corresponding instrument available
  const { instrument, setInstrument, instance } = useEditorInstrument();

  // The editor can only be in one view at a time
  const onScaleEditor = _.isScaleEditorOpen(editor);
  const onPatternEditor = _.isPatternEditorOpen(editor);
  const onInstrumentEditor = _.isInstrumentEditorOpen(editor);

  // The editor has various states describing it
  const isOpen = _.isEditorOpen(editor);
  const isVisible = _.isEditorVisible(editor);
  const isActive = !_.isEditorIdle(editor);
  const isAdding = _.isEditorAddingNotes(editor);
  const isInserting = _.isEditorInsertingNotes(editor);
  const isRemoving = _.isEditorRemovingNotes(editor);

  // The editor has global settings
  const isShowingTracks = _.isEditorShowingTracks(editor);
  const isShowingTooltips = _.isEditorShowingTooltips(editor);
  const isShowingPiano = _.isEditorShowingPiano(editor);
  const isShowingSidebar = _.isEditorShowingSidebar(editor);

  // The editor passes some components with derived props
  const Tooltip = (props: EditorTooltipProps) => (
    <Editor.Tooltip {...props} show={isShowingTooltips} />
  );
  const Button = (props: EditorButtonProps) => (
    <Tooltip content={props.label ?? ""} placement={props.placeTooltip}>
      <Editor.Button {...props} />
    </Tooltip>
  );

  // The editor uses a custom hotkey scope
  useHotkeyScope("editor");

  // The editor passes its props down to all of the typed editors
  const editorProps: EditorProps = {
    ...editor,
    dispatch,
    track,
    scale,
    pattern,
    instrument,
    setInstrument,
    instance,
    onScaleEditor,
    onPatternEditor,
    onInstrumentEditor,
    isOpen,
    isVisible,
    isActive,
    isAdding,
    isInserting,
    isRemoving,
    isShowingTracks,
    isShowingTooltips,
    isShowingPiano,
    isShowingSidebar,
    Tooltip,
    Button,
  };

  /** Only render the editor if it is visible. */
  const { EditorView } = useEditorView(editorProps);
  if (!isVisible) return null;

  const editorWidth = {
    "w-[calc(100%-300px)]": isShowingTracks,
    "w-full": !isShowingTracks,
  };
  const editorClass = classNames(
    "absolute bottom-0 right-0 h-full bg-gradient-to-t from-[#09203f] to-[#33454b] backdrop-blur-xl font-nunito transition-all fade-in-200",
    editorWidth
  );

  /** Only show the editor if it is active. */
  if (!isOpen) return null;
  return (
    <div className={editorClass}>
      <EditorNavbar {...editorProps} />
      {EditorView}
    </div>
  );
}

export { EditorComponent as Editor };
