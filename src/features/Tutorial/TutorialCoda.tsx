import { GiMusicalScore, GiSoundWaves } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { BsCode } from "react-icons/bs";
import { sonataVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";

export const TutorialCoda = (props: { view: string }) => {
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
        subtitle="Export to JSON File"
        stripColor="border-b border-b-indigo-500/80"
        Icon={BsCode}
        description={
          <>
            <div>
              Projects are autosaved in your browser and exportable into a
              native JSON format.
            </div>
            <div>
              <b>Diary:</b>
              <br />
              Open Diary from the Settings Menu to store metadata about your
              project.
            </div>
            <div>
              <b>Terminal:</b>
              <br />
              Open Terminal from the Settings Menu to directly edit the JSON of
              your project.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-lg"
        title="Save Note Data"
        subtitle="Export to MIDI File"
        stripColor="border-b border-b-teal-500/80"
        Icon={GiMusicalScore}
        description={
          <>
            <div>
              Note data can be saved to MIDI files for use in other music
              notation programs.
            </div>
            <div>
              <b>Entire Project:</b>
              <br />
              Open the Project Menu (Compact Disc) and press Export to MIDI.
            </div>
            <div>
              <b>Selected Clips:</b>
              <br />
              Right click to open the dropdown menu, then press Selection and
              Export to MIDI.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-fuchsia-600/80"
        className="rounded-lg"
        title="Save Audio Data"
        subtitle="Export to WAV File"
        stripColor="border-b border-b-fuchsia-400/80"
        Icon={GiSoundWaves}
        description={
          <>
            <div>
              Audio data can be saved to WAV files for playback, sampling, and
              sharing.
            </div>
            <div>
              <b>Entire Project:</b>
              <br />
              Open the Project Menu (Compact Disc) and press Export to WAV.
            </div>
            <div>
              <b>Live Session:</b>
              <br />
              Click Record to start capturing audio, then again to download your
              playback.
            </div>
          </>
        }
      />
    </m.div>
  );
};
