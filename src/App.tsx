import Navbar from "features/navbar";
import Editor from "features/editor";
import Timeline from "features/timeline";
import Shortcuts from "features/shortcuts";

import useGlobalHotkeys from "hooks/useGlobalHotkeys";
import useMidiController from "hooks/useMidiController";

import { LoadingView } from "views";
import { useAppSelector } from "redux/hooks";
import { selectTransport } from "redux/selectors";

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
      <Navbar />
      <main className="relative flex flex-auto overflow-hidden">
        <Timeline />
        <Editor />
        <Shortcuts />
      </main>
    </div>
  );
}
