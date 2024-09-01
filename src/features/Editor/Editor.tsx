import { use, useDeep } from "types/hooks";
import { EditorNavbar } from "./components/EditorNavbar";
import { useHotkeyScope } from "hooks";
import { ScaleObject } from "types/Scale/ScaleTypes";
import { Pattern } from "types/Pattern/PatternTypes";
import { useEditorInstrument } from "./hooks/useEditorInstrument";
import { useEditorView } from "./hooks/useEditorView";
import classNames from "classnames";
import { Pose } from "types/Pose/PoseTypes";
import { LiveAudioInstance } from "types/Instrument/InstrumentClass";
import { Instrument, InstrumentKey } from "types/Instrument/InstrumentTypes";
import {
  isScaleEditorOpen,
  isPatternEditorOpen,
  isPoseEditorOpen,
  isInstrumentEditorOpen,
  isEditorOpen,
  isEditorVisible,
  isEditorIdle,
  isEditorAddingNotes,
  isEditorInsertingNotes,
  isEditorRemovingNotes,
  isEditorShowingTracks,
  isEditorShowingTooltips,
  isEditorShowingPiano,
  isEditorShowingSidebar,
} from "types/Editor/EditorFunctions";
import { Editor } from "types/Editor/EditorTypes";
import { Track } from "types/Track/TrackTypes";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { selectEditor } from "types/Editor/EditorSelectors";
import {
  selectSelectedTrack,
  selectSelectedScale,
  selectSelectedPattern,
  selectSelectedPose,
} from "types/Timeline/TimelineSelectors";
import { selectTrackScale } from "types/Track/TrackSelectors";

export interface EditorProps extends Editor {
  // The editor uses currently selected objects for various purposes
  track?: Track;
  scale?: ScaleObject;
  pattern?: Pattern;
  pose?: Pose;

  // Each view has a corresponding instrument available
  instrument?: Instrument;
  setInstrument: (key: InstrumentKey) => void;
  instance?: LiveAudioInstance;

  // The editor can only be in one view at a time
  onScaleEditor: boolean;
  onPatternEditor: boolean;
  onPoseEditor: boolean;
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
}

function EditorComponent() {
  const editor = useDeep(selectEditor);

  // The editor uses currently selected objects for various purposes
  const track = useDeep(selectSelectedTrack);
  const scale = useDeep(
    (_) => selectTrackScale(_, track?.id) ?? selectSelectedScale(_)
  );
  const pattern = useDeep(selectSelectedPattern);
  const pose = useDeep(selectSelectedPose);
  const hasTracks = use(selectHasTracks);

  // Each view has a corresponding instrument available
  const { instrument, setInstrument, instance } = useEditorInstrument();

  // The editor can only be in one view at a time
  const onScaleEditor = isScaleEditorOpen(editor);
  const onPatternEditor = isPatternEditorOpen(editor);
  const onPoseEditor = isPoseEditorOpen(editor);
  const onInstrumentEditor = isInstrumentEditorOpen(editor);

  // The editor has various states describing it
  const isOpen = isEditorOpen(editor);
  const isVisible = isEditorVisible(editor);
  const isActive = !isEditorIdle(editor);
  const isAdding = isEditorAddingNotes(editor);
  const isInserting = isEditorInsertingNotes(editor);
  const isRemoving = isEditorRemovingNotes(editor);

  // The editor has global settings
  const isShowingTracks = !hasTracks ? false : isEditorShowingTracks(editor);
  const isShowingTooltips = isEditorShowingTooltips(editor);
  const isShowingPiano = isEditorShowingPiano(editor);
  const isShowingSidebar = isEditorShowingSidebar(editor);

  // The editor uses a custom hotkey scope
  useHotkeyScope("editor", isVisible);

  // The editor passes its props down to all of the typed editors
  const editorProps: EditorProps = {
    ...editor,
    track,
    scale,
    pattern,
    pose,
    instrument,
    setInstrument,
    instance,
    onScaleEditor,
    onPatternEditor,
    onPoseEditor,
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
  };

  /** Only render the editor if it is visible. */
  const { EditorView } = useEditorView(editorProps);

  const editorClass = classNames(
    isShowingTracks ? "w-[calc(100%-300px)]" : "w-full",
    "top-0 right-0 h-full z-[91]",
    "bg-gradient-to-t from-[#09203f] to-[#33454b]",
    "font-nunito transition-all",
    { "absolute animate-in fade-in": isVisible },
    { "hidden animate-out fade-out pointer-events-none": !isVisible }
  );

  /** Only show the editor if it is active. */
  return (
    <div className={editorClass}>
      <EditorNavbar {...editorProps} />
      {EditorView}
    </div>
  );
}

export { EditorComponent as Editor };
