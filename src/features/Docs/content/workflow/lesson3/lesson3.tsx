import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsPencil, BsTrash } from "react-icons/bs";

import start from "./lesson3-start.png";
import step1 from "./lesson3-step1.png";
import step2 from "./lesson3-step2.png";
import step3 from "./lesson3-step3.png";
import step4 from "./lesson3-step4.png";

export function WorkflowLesson3DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 3: Prepare Your Scales!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll open up the Scale Editor and create a unique
              tonality for each Scale Track.
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 3: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Terrain"
        answer={
          <>
            <DocsParagraph>
              Though the exact definition of "tonality" is complicated, we are
              essentially trying to compose a set of notes here that will sound
              good together and provide structure and meaning to our other
              musical elements. A scale is a lot like a map in that it can show
              us which directions are available from a given place, allowing us
              to take our music through interesting paths without getting lost.
            </DocsParagraph>
            <DocsParagraph>
              With all that being said, let's design our Scale Tracks with the
              following scales:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              items={[
                {
                  title: (
                    <span className="text-scale-track">Scale Track (1)</span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">
                        (F, G, A, Bb, C, D, E)
                      </strong>
                      {` => `}
                      <strong className="text-scale">F Major Scale</strong>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-scale-track">Scale Track (1a)</span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">(F, A, C, E)</strong>
                      {` => `}
                      <strong className="text-scale">F Major 7th Chord</strong>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-scale-track">Scale Track (2)</span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">
                        (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
                      </strong>
                      {` => `}
                      <strong className="text-scale">Chromatic Scale</strong>
                    </>
                  ),
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="Step 1. Open the Scale Editor"
        answer={
          <>
            <DocsParagraph>
              To open the Scale Editor, we can click on the{" "}
              <span className="text-scale">Scale Button</span> containing the
              name of a scale within a Scale Track. Whenever we work on nested
              structures, it's important to work from the top down and create
              parents before children, so let's start with{" "}
              <span className="text-scale-track">Scale Track (1)</span>.
            </DocsParagraph>
            <DocsImage src={step1} alt="Lesson 3: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 2. Create the F Major Scale"
        answer={
          <>
            <DocsParagraph>
              Since <span className="text-scale-track">Scale Track (1)</span> is
              a top level Scale Track (indicated by the lack of letters in its
              name), we should start off by clearing its Scale so that all of
              its nested Scale Tracks can start from a blank slate.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Clear Scale Notes",
                  description: (
                    <>
                      Click on the <BsTrash className="inline-flex" /> button to
                      clear the scale (and all of its nested scales).
                    </>
                  ),
                },
                {
                  title: "Start Adding Notes",
                  description: (
                    <>
                      Click on the <BsPencil className="inline-flex" /> button
                      to start/stop adding notes.
                    </>
                  ),
                },
                {
                  title: "Input the F Major Scale",
                  description: (
                    <>
                      Play the F major scale with the piano by clicking F, G, A,
                      Bb, C, D, and E.
                    </>
                  ),
                },
              ]}
            />
            <DocsParagraph>
              Great, we now have an{" "}
              <span className="text-scale">F Major Scale</span> that can be
              inherited by other Tracks!
            </DocsParagraph>
            <DocsImage src={step2} alt="Lesson 3: Step 2" />
          </>
        }
      />
      <DocsSection
        question="Step 3. Create the C Major Chord"
        answer={
          <>
            <DocsParagraph>
              Now, let's create an{" "}
              <span className="text-scale">F Major 7th Chord</span> nested
              within our <span className="text-scale">F Major Scale</span>.
              Since <span className="text-scale-track">Scale Track (1a)</span>{" "}
              was nested within{" "}
              <span className="text-scale-track">Scale Track (1)</span>, all of
              the notes we play on the piano will automatically be converted to
              scale degrees based on the F Major Scale!
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Open the Scale Editor",
                  description: (
                    <>
                      Make sure that{" "}
                      <span className="text-scale-track">Scale Track (1a)</span>{" "}
                      is selected.
                    </>
                  ),
                },
                {
                  title: "Start Adding Notes",
                  description: (
                    <>
                      Click on the <BsPencil className="inline-flex" /> button
                      to start/stop adding notes.
                    </>
                  ),
                },
                {
                  title: "Input the F Major 7th Chord",
                  description: (
                    <>
                      Play the chord with the piano by clicking F, A, C, and E.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step3} alt="Lesson 3: Step 3" />
            <DocsParagraph>
              Remember, this "7th chord" is actually a scale, but we choose to
              refer to it as a chord because it is a more conventional name than
              "F Major 7th Chord Scale" or "F Major 1-3-5-7" or so on. In
              general, though, you can name the scale whatever you want!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 4. Create the Chromatic Scale"
        answer={
          <>
            <DocsParagraph>
              Since <span className="text-scale-track">Scale Track (2)</span>{" "}
              contains a <span className="text-scale">Chromatic Scale</span> by
              default, we are already done with this step!
            </DocsParagraph>
            <DocsImage src={step4} alt="Lesson 3: Step 4" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              We now have all of the Scales we'll need for this project and
              we've given a unique identity to each Scale Track!
            </DocsParagraph>
            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/write-your-patterns">
                Lesson 4: Write Your Patterns
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
