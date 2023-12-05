import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsPlusCircle } from "react-icons/bs";

import start from "./lesson2-start.png";
import step1 from "./lesson2-step1.png";
import step3 from "./lesson2-step3.png";
import step4 from "./lesson2-step4.png";

export function WorkflowLesson2DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 2: Choose Your Instruments!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll open up the Instrument Editor and create a
              unique sound for each Pattern Track.
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 2: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Sounds"
        answer={
          <>
            <DocsParagraph>
              The timbres of our instruments will not only determine what we
              hear but also what we write! It's crucial to consider the range
              and register of an instrument when composing for it because it
              will decide which notes are available and how they will mix with
              other frequencies. Therefore, even though we can change our sounds
              at any stage of the creative process, it will be useful for us to
              know which parts are which ahead of time.
            </DocsParagraph>
            <DocsParagraph>
              In that case, let's set our Pattern Tracks to the following
              instruments:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              items={[
                {
                  title: (
                    <span className="text-pattern-track">
                      Pattern Track (1aa)
                    </span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">Keyboards</strong>
                      {` => `}
                      <span className="text-instrument">Grand Piano</span>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-pattern-track">
                      Pattern Track (1ab)
                    </span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">Guitars</strong>
                      {` => `}
                      <span className="text-instrument">Electric Guitar</span>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-pattern-track">
                      Pattern Track (2a)
                    </span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">Kicks</strong>
                      {` => `}

                      <span className="text-instrument">Tube Kick</span>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-pattern-track">
                      Pattern Track (2b)
                    </span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">Tom</strong>
                      {` => `}
                      <span className="text-instrument">Blast Tom</span>
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-pattern-track">
                      Pattern Track (2c)
                    </span>
                  ),
                  description: (
                    <>
                      <strong className="text-slate-300">Hats</strong>
                      {` => `}
                      <span className="text-instrument">
                        Acoustic Closed Hat
                      </span>
                    </>
                  ),
                },
              ]}
            />
          </>
        }
      />

      <DocsSection
        question="Step 1. Open the Instrument Editor"
        answer={
          <>
            <DocsParagraph>
              To open the Instrument Editor, we can click on the{" "}
              <span className="text-instrument">Instrument Button</span>{" "}
              containing the name of an instrument within a Pattern Track. Let's
              go down our list of tracks, starting with{" "}
              <span className="text-pattern-track">Pattern Track (1aa)</span>.
            </DocsParagraph>
            <DocsImage src={step1} alt="Lesson 2: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 2. Select the Instrument Preset"
        answer={
          <>
            <DocsParagraph>
              To select an instrument preset, we can click on the corresponding
              category in the left sidebar and then click on the preset name.
              Since the Grand Piano is already selected for Pattern Track (1aa),
              we can move on to the next step!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 3. Add Some Effects (Or Not)"
        answer={
          <>
            <DocsParagraph>
              We could leave our Grand Piano as it is, but we'll add some basic
              effects to show you an example!
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Add a Reverb Effect",
                  description: (
                    <>
                      Click on{" "}
                      <strong className="text-white">
                        Reverb <BsPlusCircle className="inline" />
                      </strong>{" "}
                      and set wet to ~0.5 and decay to ~4.
                    </>
                  ),
                },
                {
                  title: "Add a Chorus Effect",
                  description: (
                    <>
                      Click on{" "}
                      <strong className="text-white">
                        Chorus <BsPlusCircle className="inline" />
                      </strong>{" "}
                      and set wet to ~0.2.
                    </>
                  ),
                },
                {
                  title: "Add a Delay Effect",
                  description: (
                    <>
                      Click on{" "}
                      <strong className="text-white">
                        Feedback Delay <BsPlusCircle className="inline" />
                      </strong>{" "}
                      and set wet to ~0.2.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step3} alt="Lesson 2: Step 3" />
          </>
        }
      />
      <DocsSection
        question="Step 4. Rinse and Repeat"
        answer={
          <>
            <DocsParagraph>
              To avoid repeating ourselves four more times, we'll leave the rest
              up to you! Here are the effects we chose for each Instrument:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Electric Guitar (1ab)",
                  description: (
                    <>
                      Reverb (Wet = 0.4, Decay = 5), Ping Pong Delay (Wet = 0.6,
                      Time = 0.38)
                    </>
                  ),
                },
                {
                  title: "Tube Kick (2a)",
                  description: <>Distortion (Wet = 0.5)</>,
                },
                {
                  title: "Blast Tom (2b)",
                  description: (
                    <>Distortion (Wet = 0.25), Feedback Delay (Wet = 0.2)</>
                  ),
                },
                {
                  title: "Acoustic Closed Hat (2c)",
                  description: (
                    <>Ping Pong Delay (Wet = 0.5) , Filter (Frequency = 5000)</>
                  ),
                },
              ]}
            />
            <DocsImage src={step4} alt="Lesson 2: Step 4" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              We now have all of the Instruments we'll need for this project and
              we've given a unique identity to each Pattern Track!
            </DocsParagraph>
            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/prepare-your-scales">
                Lesson 3: Prepare your Scales
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
