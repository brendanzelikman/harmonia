import useGlobalHotkeys from "hooks/useGlobalHotkeys";
import useMidiController from "hooks/useMidiController";
import Shortcuts from "features/shortcuts";

import { LoadingView } from "views";
import { TourBackground } from "features/tour";
import { useLoadedTransport } from "hooks/useLoadedTransport";
import { useCurrentProject } from "hooks/useCurrentProject";
import { Suspense, lazy } from "react";

const Navbar = lazy(() => import("features/Navbar"));
const Editor = lazy(() => import("features/Editor"));
const Timeline = lazy(() => import("features/Timeline"));

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
        <Suspense>
          <Timeline />
          <Editor />
          <Shortcuts />
        </Suspense>
      </main>
    </div>
  );
}
