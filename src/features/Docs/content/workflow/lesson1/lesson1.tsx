import { DocsImage } from "features/Docs/components/DocsImage";
import {
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
  DocsTerm,
} from "../../../components";
import { BsPlusCircle } from "react-icons/bs";

import start from "./lesson1-start.png";
import step1 from "./lesson1-step1.png";
import step2 from "./lesson1-step2.png";

export function WorkflowLesson1DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 1: Organize Your Tracks!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll start working on our Project by creating and
              organizing our Tracks in the Timeline.
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 1: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Architecture"
        answer={
          <>
            <DocsParagraph>
              Rather than rushing in to writing our melodies and chord
              progressions, let's take a moment to sketch out the architecture
              of our arrangement so that we can have an idea of what we're
              trying to compose in the first place. It can be tempting to skip
              this step, but it will allow us to streamline our workflow and
              directly reference the structure of our composition as we write
              our music.
            </DocsParagraph>
            <DocsParagraph>
              Let's split our Tracks into two groups:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "F Major Leads",
                  description: (
                    <>
                      <span className="text-scale-track">F Major Scale</span>
                      {` => `}
                      <span className="text-scale-track">
                        F Major 7th Chord
                      </span>
                      {` => `}
                      <span className="text-pattern-track">
                        Piano and Guitar
                      </span>
                    </>
                  ),
                },
                {
                  title: "Chromatic Drumkit",
                  description: (
                    <>
                      <span className="text-scale-track">Chromatic Scale</span>
                      {` => `}
                      <span className="text-pattern-track">
                        Kick, Tom, and Hat
                      </span>
                    </>
                  ),
                },
              ]}
            />
            <DocsParagraph>
              For now, we will just be creating and rearranging tracks, so don't
              worry about choosing the right scales or instruments just yet!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 1. Create the F Major Section"
        answer={
          <>
            <DocsParagraph>
              To create the first group of tracks, we can perform the following
              steps:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Create a Nested Scale Track (+1a)",
                  description: (
                    <>
                      Click the{" "}
                      <BsPlusCircle className="inline text-scale-track" />{" "}
                      button in{" "}
                      <span className="text-scale-track">Scale Track (1)</span>.
                    </>
                  ),
                },
                {
                  title: "Rearrange the Piano Track (1a => 1aa)",
                  description: (
                    <>
                      Drag{" "}
                      <span className="text-pattern-track">
                        Pattern Track (1a)
                      </span>{" "}
                      into{" "}
                      <span className="text-scale-track">Scale Track (1b)</span>
                      .
                    </>
                  ),
                },
                {
                  title: "Create a Guitar Track (+1ab)",
                  description: (
                    <>
                      Click the{" "}
                      <BsPlusCircle className="inline text-pattern-track" />{" "}
                      button in{" "}
                      <span className="text-scale-track">Scale Track (1a)</span>
                      .
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step1} alt="Lesson 1: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 2. Create the Chromatic Section"
        answer={
          <>
            <DocsParagraph>
              To create the second group of tracks, we can perform the following
              steps:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Create a New Scale Track (+2)",
                  description: (
                    <>
                      Click on <DocsTerm>Add a Scale Track</DocsTerm> underneath
                      the bottom-most track.
                    </>
                  ),
                },
                {
                  title: "Create the Drum Tracks (+2a, +2b, +2c)",
                  description: (
                    <>
                      Click the{" "}
                      <BsPlusCircle className="inline text-pattern-track" />{" "}
                      button in{" "}
                      <span className="text-scale-track">Scale Track (2)</span>{" "}
                      three times to create each of our drum tracks.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step2} alt="Lesson 2: Step 2" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              Well done! Now that we have the basic scaffolding in place, we can
              slowly start filling in the details!
            </DocsParagraph>

            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/choose-your-instruments">
                Lesson 2: Choose Your Instruments
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
