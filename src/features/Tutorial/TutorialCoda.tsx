import { GiCompactDisc, GiMusicalScore, GiSoundWaves } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { BsCode, BsGear, BsRecordCircleFill } from "react-icons/bs";
import { tutorialVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";
import {
  exportProjectToJSON,
  exportProjectToMIDI,
  exportProjectToWAV,
} from "types/Project/ProjectExporters";
import { useAppDispatch } from "hooks/useRedux";

export const TutorialCoda = (props: { view: string }) => {
  const dispatch = useAppDispatch();
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      data-view={props.view}
      variants={tutorialVariants}
      className="hidden data-[view=coda]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      {" "}
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Tip: Save and Load as JSON"
        stripColor="border-b border-b-indigo-500/80"
        Icon={BsCode}
        onClick={() => dispatch(exportProjectToJSON())}
        description={
          <>
            <div>
              Projects are autosaved in your browser and exportable to a native
              JSON file format.
            </div>
            <div>
              <b>File Menu:</b>
              <br />
              Hover into the <GiCompactDisc className="inline" /> icon to
              rename, duplicate, and save your project to various formats.
            </div>
            <div>
              <b>Settings Menu:</b>
              <br />
              Hover into the <BsGear className="inline" /> icon to edit specific
              values and access the Terminal and Shortcuts.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-lg"
        title="Tip: Export to MIDI and WAV"
        stripColor="border-b border-b-teal-500/80"
        Icon={GiMusicalScore}
        onClick={() => dispatch(exportProjectToMIDI(undefined, true))}
        description={
          <>
            <div>
              Project data can be saved to MIDI and WAV for use in other music
              notation programs.
            </div>
            <div>
              <b>Entire Project:</b>
              <br />
              Hover into the File Menu, then click on Export to MIDI or Export
              to WAV.
            </div>
            <div>
              <b>Selected Clips:</b>
              <br />
              Right click on a clip, then go to Selection and press Export to
              MIDI or Export to WAV.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-fuchsia-600/80"
        className="rounded-lg"
        title="Tip: Record to MIDI and WAV"
        stripColor="border-b border-b-fuchsia-400/80"
        Icon={GiSoundWaves}
        onClick={() =>
          dispatch(exportProjectToWAV(undefined, { download: true }))
        }
        description={
          <>
            <div>
              Browser audio can be captured live and downloaded into MIDI and
              WAV files.
            </div>
            <div>
              <b>Start Recording:</b>
              <br />
              Click the <BsRecordCircleFill className="inline" /> button to
              start recording, then start playback to begin capturing audio.
            </div>
            <div>
              <b>Save Recording:</b>
              <br />
              Click the <BsRecordCircleFill className="inline" /> button to stop
              recording, then follow the menu to download your file.
            </div>
          </>
        }
      />
    </m.div>
  );
};
