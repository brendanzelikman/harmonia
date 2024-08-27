import { BsGear } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { EditorProps } from "../Editor";
import {
  toggleEditorTracks,
  toggleEditorPresets,
  toggleEditorTooltips,
  hideEditor,
} from "types/Editor/EditorSlice";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";

export function EditorNavbar(props: EditorProps) {
  const dispatch = useProjectDispatch();
  const hasTracks = useProjectSelector(selectHasTracks);
  const showingSettings = true;
  // const [showingSettings, setShowingSettings] = useState(false);
  // const toggleSettings = () => setShowingSettings(!showingSettings);

  const SettingsButton = () => (
    <span
      className="flex font-light capitalize cursor-pointer mr-3"
      // onClick={toggleSettings}
    >
      Editor Settings <BsGear className="ml-2 text-lg my-auto" />
    </span>
  );

  const SettingsOptions = !showingSettings ? null : (
    <div className="flex space-x-3 [&>div]:cursor-pointer animate-in fade-in">
      {hasTracks ? (
        <>
          <div onClick={() => dispatch(toggleEditorTracks({ data: null }))}>
            {props.isShowingTracks ? "Hide" : "Show"} Tracks
          </div>
          <span className="w-1">•</span>
        </>
      ) : null}
      <div onClick={() => dispatch(toggleEditorPresets())}>
        {props.isShowingSidebar ? "Hide" : "Show"} Presets
      </div>
      <span className="w-1">•</span>
      <div onClick={() => dispatch(toggleEditorTooltips())}>
        {props.isShowingTooltips ? "Hide" : "Show"} Tooltips
      </div>
      {/* <span className="w-1">•</span>
      <div onClick={() => dispatch(toggleEditorPiano())}>
        {props.isShowingPiano ? "Hide" : "Show"} Piano
      </div> */}
    </div>
  );

  return (
    <div
      className={`w-full flex justify-center items-center h-[25px] text-white rounded-br-md p-2 text-xs font-light bg-gradient-to-b from-emerald-100/20 to-slate-500/30 select-none whitespace-nowrap`}
    >
      <SettingsButton />
      {SettingsOptions}
      <span className="w-full ml-auto"></span>
      <span
        className="pr-2 cursor-pointer"
        onClick={() => dispatch(hideEditor({ data: null }))}
      >
        Close Editor
      </span>
    </div>
  );
}
