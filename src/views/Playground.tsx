import {
  useGlobalHotkeys,
  useMidiController,
  useTransportLoader,
  useProjectLoader,
} from "hooks";
import { Navbar } from "features/Navbar";
import { Timeline } from "features/Timeline";
import { Editor } from "features/Editor/Editor";
import { ShortcutsMenu } from "features/Shortcuts";
import { LoadingView } from "views";
import { TourBackground } from "features/Tour";

/** The playground contains the DAW */
export function PlaygroundView() {
  const isProjectLoaded = useProjectLoader();
  const isTransportLoaded = useTransportLoader();
  useGlobalHotkeys();
  useMidiController();

  // If the project or transport is not loaded, show a loading page.
  if (!isProjectLoaded || !isTransportLoaded) {
    return <LoadingView isTransportLoaded={isTransportLoaded} />;
  }

  // Otherwise, show the playground.
  return (
    <div className="flex flex-col fade-in h-screen">
      <TourBackground />
      <Navbar />
      <main className="relative flex flex-auto overflow-hidden">
        <Timeline />
        <Editor />
        <ShortcutsMenu />
      </main>
    </div>
  );
}
