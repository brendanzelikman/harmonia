import { BsGear } from "react-icons/bs";
import * as _ from "redux/Editor";
import { useState } from "react";
import { EditorProps } from "..";
import { EasyTransition } from "components/Transition";

export function EditorNavbar(props: EditorProps) {
  const { dispatch } = props;
  const [showingSettings, setShowingSettings] = useState(false);
  const toggleSettings = () => setShowingSettings(!showingSettings);

  const SettingsButton = () => (
    <span
      className="flex font-light capitalize cursor-pointer mr-3 text-md"
      onClick={toggleSettings}
    >
      Editor Settings <BsGear className="ml-2 text-lg my-auto" />
    </span>
  );

  const SettingsOptions = (
    <EasyTransition
      show={showingSettings}
      className="flex space-x-3 [&>div]:cursor-pointer"
    >
      <div onClick={() => dispatch(_.toggleEditorTracks())}>
        {props.isShowingTracks ? "Hide" : "Show"} Tracks
      </div>
      <span className="w-1">•</span>
      <div onClick={() => dispatch(_.toggleEditorPresets())}>
        {props.isShowingSidebar ? "Hide" : "Show"} Presets
      </div>
      <span className="w-1">•</span>
      <div onClick={() => dispatch(_.toggleEditorTooltips())}>
        {props.isShowingTooltips ? "Hide" : "Show"} Tooltips
      </div>
      <span className="w-1">•</span>
      <div onClick={() => dispatch(_.toggleEditorPiano())}>
        {props.isShowingPiano ? "Hide" : "Show"} Piano
      </div>
    </EasyTransition>
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
        onClick={() => dispatch(_.hideEditor())}
      >
        Close Editor
      </span>
    </div>
  );
}
