import {
  DocsImage,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsMusicPlayer, BsRecord } from "react-icons/bs";

import step1 from "./lesson7-step1.png";

export function WorkflowLesson7Content() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 7: Export Your Music!"
        answer={
          <>
            <DocsParagraph>
              In this final lesson, we'll wrap up by briefly covering the
              different options available for saving and exporting a Project.
            </DocsParagraph>
            <DocsImage src={step1} alt="Lesson 7: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Naming Your Work"
        answer={
          <>
            <DocsParagraph>
              You can rename your Project by clicking on{" "}
              <BsMusicPlayer className="inline-flex" /> in the Navbar and
              editing the text in the field. This name will be used for the
              title of any exported file and show up in the browser tab.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Saving Your Work"
        answer={
          <>
            <DocsParagraph>
              In case you didn't know, your work will be automatically saved and
              stored in the browser as long as there is no music playing! You
              can also undo and redo the most recent changes made to your
              Project in any given session, but the history will be cleared when
              you close the website. Even though the website will automatically
              save your work, the best way to guarantee that a Project is not
              lost is to export it as a HAM file.
            </DocsParagraph>
          </>
        }
      />

      <DocsSection
        question="Exporting Your Work"
        answer={
          <>
            <DocsParagraph>
              Harmonia can export your Project as a HAM file, a MIDI file, or a
              WAV file. It is important to note that only a HAM file will
              contain all of the information about your Project, since it is
              Harmonia's native file type, whereas the MIDI file will only
              contain notes and the WAV file will only contain audio.
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Save for Harmonia",
                  description: (
                    <>
                      Click on <BsMusicPlayer className="inline-flex" /> and
                      press Save as HAM.
                    </>
                  ),
                },
                {
                  title: "Export to Other DAWs",
                  description: (
                    <>
                      Click on <BsMusicPlayer className="inline-flex" /> and
                      press Export to MIDI.
                    </>
                  ),
                },
                {
                  title: "Export to Playable Audio",
                  description: (
                    <>
                      Click on <BsMusicPlayer className="inline-flex" /> and
                      press Export to WAV.
                    </>
                  ),
                },
                {
                  title: "Record as Playable Audio",
                  description: (
                    <>
                      Click on the Record button in the Navbar and the website
                      will record all audio until you press it again.
                    </>
                  ),
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="That's All, Folks!"
        answer={
          <>
            <DocsParagraph>
              We hope you enjoyed this tutorial and had fun using Harmonia!
              Please refer to the rest of the documentation for more information
              about the specific features of the website, and feel free to
              contact us if you have any questions or feedback about any lesson.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
