import { GiCompactDisc, GiMusicalScore, GiSoundWaves } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { BsCode, BsRecordCircleFill } from "react-icons/bs";
import { sonataVariants } from "./TutorialIntroduction";
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
      variants={sonataVariants}
      className="hidden data-[view=coda]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      {" "}
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Save Project Data"
        subtitle="Export to Native JSON"
        stripColor="border-b border-b-indigo-500/80"
        Icon={BsCode}
        onClick={() => dispatch(exportProjectToJSON())}
        description={
          <>
            <div>
              Projects are autosaved in your browser and exportable into a
              native JSON format.
            </div>
            <div>
              <b>Diary:</b>
              <br />
              Open Diary from the Settings Menu to keep persistent notes about
              your project.
            </div>
            <div>
              <b>Terminal:</b>
              <br />
              Open Terminal from the Settings Menu to see and edit the JSON of
              your project.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-lg"
        title="Export Note Data"
        subtitle="Export to MIDI and WAV"
        stripColor="border-b border-b-teal-500/80"
        Icon={GiMusicalScore}
        onClick={() => dispatch(exportProjectToMIDI(undefined, true))}
        description={
          <>
            <div>
              Note data can be saved to MIDI and WAV for use in other music
              notation programs.
            </div>
            <div>
              <b>Entire Project:</b>
              <br />
              Open the Project Menu by hovering over the{" "}
              <GiCompactDisc className="inline" /> icon, then press Export to
              WAV or MIDI.
            </div>
            <div>
              <b>Selected Clips:</b>
              <br />
              Right click to open the dropdown menu, then go to Selection and
              press Export.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-fuchsia-600/80"
        className="rounded-lg"
        title="Record Note Data"
        subtitle="Capture Browser Audio"
        stripColor="border-b border-b-fuchsia-400/80"
        Icon={GiSoundWaves}
        onClick={() =>
          dispatch(exportProjectToWAV(undefined, { download: true }))
        }
        description={
          <>
            <div>
              Browser audio can be recorded to MIDI and WAV for playback,
              sampling, and sharing.
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
