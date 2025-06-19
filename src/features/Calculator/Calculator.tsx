import Editor from "features/Editor/Editor";
import Shortcuts from "features/Shortcuts/Shortcuts";
import Terminal from "features/Terminal/Terminal";
import Tutorial from "features/Tutorial/Tutorial";
import Timeline from "features/Timeline/Timeline";

export default function Calculator() {
  return (
    <div className="size-full pt-nav">
      <div className="size-full relative">
        <Timeline />
        <Tutorial />
        <Editor />
        <Terminal />
        <Shortcuts />
      </div>
    </div>
  );
}
