import Navbar from "features/Navbar";
import Editor from "features/Editor";
import Timeline from "features/Timeline";
import Shortcuts from "features/Shortcuts";
import useGlobalHotkeys from "hooks/useGlobalHotkeys";
import useMidiController from "hooks/useMidiController";

import { LoadingView } from "views";
import { useAppSelector } from "redux/hooks";
import { selectTransport } from "redux/selectors";
import { TourBackground } from "features/Tour";

/**
 * The main app is composed of four components.
 * * Navbar: Transport, toolkit, etc.
 * * Timeline: Tracks, media, etc.
 * * Editor: Scales, patterns, etc.
 * * Shortcuts: Shortcut menu.
 */
export default function App() {
  useGlobalHotkeys();
  useMidiController();

  // If the transport is not loaded, show a loading page.
  const transport = useAppSelector(selectTransport);
  if (!transport.loaded) return <LoadingView />;

  // Otherwise, show the app.
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
