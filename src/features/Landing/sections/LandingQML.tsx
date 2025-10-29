import { LandingSection } from "../components/LandingSection";
import Pic from "assets/images/qml_plugin.png";

export const LandingQML = () => {
  return (
    <main id="body" className="size-full overflow-scroll">
      <LandingSection className="animate-in fade-in duration-300 pt-nav pb-0">
        <div className="text-center text-5xl font-bold py-10 select-none">
          MuseScore Plugin
        </div>
        <img
          src={Pic}
          alt="QML Plugin"
          className="mx-auto h-72 border-4 border-slate-50 ring-6 ring-sky-400 rounded-sm mb-10 shadow-lg"
        />
        <div className="xl:mx-48 *:wrap-break-word mx-12 text-xl p-4 rounded border border-slate-50/20 bg-slate-800">
          <p>
            Step 1: Download the QML file from the website{" "}
            <a
              href="harmonia.qml"
              className="text-blue-400 hover:underline"
              download
            >
              here
            </a>
            .
          </p>
          <p>
            Step 2: Add the plugin to MuseScore in
            ~/Documents/MuseScore4/Plugins/PLUGIN_FOLDER/PLUGIN_FILE.qml
          </p>
          <p>
            Step 3: Open MuseScore and enable the plugin in the application's
            Home screen.
          </p>
          <p>
            Step 4 (Optional): Click Edit Shortcut and set a binding like
            Shift+H to easily open it.
          </p>
          <p className="mt-2">
            Voila! It should now pop up in the toolbar under Plugins {"->"}{" "}
            Composing/arranging tools or via your shortcut.
          </p>
        </div>
      </LandingSection>
    </main>
  );
};
