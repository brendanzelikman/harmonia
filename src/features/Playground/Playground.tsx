import { PlaygroundMobileSplash } from "./components/PlaygroundMobileSplash";
import { PlaygroundLoadingScreen } from "./components/PlaygroundLoadingScreen";
import { usePlaygroundLoader } from "./hooks/usePlaygroundLoader";
import { useGlobalHotkeys, useMidiController } from "hooks";
import { Timeline } from "features/Timeline";
import { Editor } from "features/Editor";
import { ShortcutsMenu } from "features/Shortcuts/ShortcutsMenu";

/** The playground contains the DAW */
export function Playground() {
  const loadState = usePlaygroundLoader();
  useGlobalHotkeys();
  useMidiController();

  // If the playground is not loaded, show the loading screen.
  if (!loadState.isPlaygroundLoaded) {
    return <PlaygroundLoadingScreen loadState={loadState} />;
  }

  // Otherwise, show the playground.
  return (
    <div className="w-full h-full relative animate-in fade-in duration-500">
      <div className="relative hidden md:flex flex-col h-full">
        <Timeline />
        <Editor />
        <ShortcutsMenu />
      </div>
      <PlaygroundMobileSplash />
    </div>
  );
}
