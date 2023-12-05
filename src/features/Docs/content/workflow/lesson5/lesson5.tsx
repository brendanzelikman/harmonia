import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsPencil } from "react-icons/bs";
import { GiWaveCrest, GiYarn } from "react-icons/gi";
import start from "./lesson5-start.png";
import step1 from "./lesson5-step1.png";
import step1a from "./lesson5-step1a.png";
import step1b from "./lesson5-step1b.png";
import step1c from "./lesson5-step1c.png";
import step2 from "./lesson5-step2.png";
import step2a from "./lesson5-step2a.png";
import step2b from "./lesson5-step2b.png";
import step2c from "./lesson5-step2c.png";

export function WorkflowLesson5DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 5: Design Your Poses!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll open up the Pose Editor and create some
              harmonic progressions to use in our tune.
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 5: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Developments"
        answer={
          <>
            <DocsParagraph>
              This is where we get to write our chord progressions and develop
              our themes! Rather than manually rewriting our patterns, we can
              prepare some Poses that will automatically change our harmonies
              however we want! This stage is the most abstract and will require
              some faith in the process, but it will certainly pay off in the
              end. Let's create the following Poses:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Pose #1",
                  description: (
                    <>
                      <strong className="text-pose">I - vi - ii - V</strong>{" "}
                      used with the{" "}
                      <span className="text-scale-track">F Major Scale</span>.
                    </>
                  ),
                },
                {
                  title: "Pose #2",
                  description: (
                    <>
                      <strong className="text-pose">Melody Solo</strong> used
                      with the{" "}
                      <span className="text-pattern-track">Grand Piano</span>.
                    </>
                  ),
                },
              ]}
            />
            <DocsParagraph>
              The idea here is that Pose #1 will automatically transpose our F
              Major Pattern Tracks to the right keys—F major, D minor, G dorian,
              and C mixolydian—while Pose #2 will move our melody around so that
              we can adjust its contour and tonality the same way a soloist
              would.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 1. Open the Pose Editor"
        answer={
          <>
            <DocsParagraph>
              To open the Pose Editor, you can switch to your Poses by toggling{" "}
              <GiYarn className="inline h-8 w-8 p-1 border border-pattern rounded-full text-emerald" />
              {" => "}
              <GiWaveCrest className="inline h-8 w-8 p-1 border border-pose rounded-full text-emerald" />{" "}
              and clicking on the{" "}
              <span className="inline-flex items-center justify-center h-7 w-7 p-1 bg-pose rounded-full text-white">
                <BsPencil />
              </span>{" "}
              button in the Navbar. A New Pose should be selected by default.
            </DocsParagraph>
            <DocsImage src={step1} alt="Lesson 5: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 1a. Create Four Vectors"
        answer={
          <>
            <DocsParagraph>
              Let's create a four-bar chord progression by using four different
              vectors that last one measure each.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Set the Duration",
                  description: (
                    <>
                      Click on the duration of the first vector and set Ticks =
                      384.
                    </>
                  ),
                },
                {
                  title: "Repeat the Stream Four Times",
                  description: <>Click on Repeat Stream and input 4.</>,
                },
              ]}
            />
            <DocsImage src={step1a} alt="Lesson 5: Step 1a" />
          </>
        }
      />
      <DocsSection
        question="Step 1b. Change the Vector Offsets"
        answer={
          <>
            <DocsParagraph>
              Now, we can adjust the offset of each vector to shape our
              progression. In order to edit an offset, you can click on the pink
              header of a vector and use the tooltip that pops up beside it. For
              the I-vi-ii-V progression, we can use the following offsets:
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Vector 1",
                  description: <>No values set.</>,
                },
                {
                  title: "Vector 2",
                  description: <>Chordal = -2 (moving F major to D minor).</>,
                },
                {
                  title: "Vector 3",
                  description: <>Chordal = 1 (moving F major to G dorian).</>,
                },
                {
                  title: "Vector 4",
                  description: (
                    <>Chordal = 4 (moving F major to C mixolydian).</>
                  ),
                },
              ]}
            />

            <DocsImage src={step1b} alt="Lesson 5: Step 1b" />
          </>
        }
      />
      <DocsSection
        question="Step 1c. Finalize the Pose"
        answer={
          <>
            <DocsParagraph>
              Great job, we now have a chord progression that we can use for our
              F Major Scale! Let's take a moment to finalize the Pose and give
              it a descriptive name like "I - vi - ii - V" by directly editing
              the title of the Pose Editor.
            </DocsParagraph>

            <DocsImage src={step1c} alt="Lesson 5: Step 1c" />
          </>
        }
      />
      <DocsSection
        question="Step 2. Create a new Pose"
        answer={
          <>
            <DocsParagraph>
              Now, let's create a new Pose for our Melodic Poses by clicking on
              the New button in the toolbar.
            </DocsParagraph>
            <DocsImage src={step2} alt="Lesson 5: Step 2" />
          </>
        }
      />
      <DocsSection
        question="Step 2a. Arrange Eight Vectors"
        answer={
          <>
            <DocsParagraph>
              Let's subdivide each measure of our four bar progression by using
              eight different vectors that last for half a measure each.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Set the Duration",
                  description: (
                    <>
                      Click on the duration of the first vector and set Ticks =
                      192.
                    </>
                  ),
                },
                {
                  title: "Repeat the Stream Eight Times",
                  description: <>Click on Repeat Stream and input 8.</>,
                },
              ]}
            />
            <DocsImage src={step2a} alt="Lesson 5: Step 2a" />
          </>
        }
      />
      <DocsSection
        question="Step 2b. Write the Vectors"
        answer={
          <>
            <DocsParagraph>
              For this step, we'll be writing a unique set of changes that will
              move our melody around the scale and chord.
            </DocsParagraph>
            <DocsParagraph>
              To provide a bit of context here, we start from the fact that our
              Major 7th Melody begins on an F, i.e. the root of the F Major
              Scale. Since our I - vi - ii - V progression transposes the F
              Major Scale up and down, our Major 7th Melody will transpose along
              with it—starting on F, then D, then G, then C. In order to add
              more color to the tune and avoid playing in root position all the
              way through, we can build upper extensions by setting Scale Track
              (1) = 4, moving the melody up by 4 steps along the F Major Scale
              stored in Scale Track (1). Then, we can set Scale Track (1a) = -1
              to start at a lower inversion of the Major 7th Chord or Chordal =
              -1 to start at a lower inversion of the melody—changing how it
              connects with the next section of the tune.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Vector 1",
                  description: <>No values set.</>,
                },
                {
                  title: "Vector 2",
                  description: <>No values set.</>,
                },
                {
                  title: "Vector 3",
                  description: <>No values set.</>,
                },
                {
                  title: "Vector 4",
                  description: <>Scale Track (1) = 4, Chordal = -1.</>,
                },
                {
                  title: "Vector 5",
                  description: <>No values set.</>,
                },
                {
                  title: "Vector 6",
                  description: <>Scale Track (1) = 4, Chordal = -1.</>,
                },
                {
                  title: "Vector 7",
                  description: <>Scale Track (1) = 4, Scale Track (1a) = -1.</>,
                },
                {
                  title: "Vector 8",
                  description: <>No values set.</>,
                },
              ]}
            />
            <DocsImage src={step2b} alt="Lesson 5: Step 2b" />
          </>
        }
      />
      <DocsSection
        question="Step 1c. Finalize the Pose"
        answer={
          <>
            <DocsParagraph>
              Great job, we now have a dazzling solo that will transform and
              develop our Major 7th Melody! Let's take a moment to finalize the
              Pose and give it a descriptive name like "Melody Solo" by directly
              editing the title of the Pose Editor.
            </DocsParagraph>
            <DocsImage src={step2c} alt="Lesson 5: Step 2c" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              With our Patterns and Poses in place, we can finally spring to
              action and sketch out the main arrangement!
            </DocsParagraph>
            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/arrange-your-clips">
                Lesson 6: Arrange Your Clips
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
