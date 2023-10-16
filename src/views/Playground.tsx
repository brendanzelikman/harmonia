import Navbar from "features/Navbar";
import Editor from "features/Editor";
import Timeline from "features/Timeline";
import Shortcuts from "features/Shortcuts";
import useGlobalHotkeys from "hooks/useGlobalHotkeys";
import useMidiController from "hooks/useMidiController";

import { LoadingView } from "views";
import { TourBackground } from "features/Tour";
import { useLoadedTransport } from "hooks/useLoadedTransport";
import { useCurrentProject } from "hooks/useCurrentProject";

export function PlaygroundView() {
  useGlobalHotkeys();
  useMidiController();

  // If the project or transport is not loaded, show a loading page.
  const isProjectLoaded = useCurrentProject();
  const isTransportLoaded = useLoadedTransport();
  if (!isProjectLoaded || !isTransportLoaded)
    return <LoadingView isTransportLoaded={isTransportLoaded} />;

  // Otherwise, show the playground.
  return (
    <div className="flex flex-col fade-in h-screen">
      <TourBackground />
      <Navbar />
      <main className="relative flex flex-auto overflow-hidden">
        <Timeline />
        <Editor />
        <Shortcuts />
      </main>
    </div>
  );
}
