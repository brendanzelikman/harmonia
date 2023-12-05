import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsCursor, BsEraserFill, BsPencil, BsTrashFill } from "react-icons/bs";
import start from "./lesson4-start.png";
import step1 from "./lesson4-step1.png";
import step1a from "./lesson4-step1a.png";
import step1b from "./lesson4-step1b.png";
import step1c from "./lesson4-step1c.png";
import step1d from "./lesson4-step1d.png";
import step2 from "./lesson4-step2.png";
import step2a from "./lesson4-step2a.png";
import step2b from "./lesson4-step2b.png";
import step2c from "./lesson4-step2c.png";
import step2d from "./lesson4-step2d.png";

export function WorkflowLesson4DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 4: Write Your Patterns!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll open up the Pattern Editor and create a
              melody and a chord voicing to use in our Tracks!
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 4: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Motifs"
        answer={
          <>
            <DocsParagraph>
              This is where we get to write our initial themes and ideas!
              Instead of composing entire musical phrases, we want to write
              short motifs that can be easily repeated and developed. First,
              we'll write an arpeggiated melody for the Grand Piano based on our
              F Major 7th Chord. Then, we'll write a voicing for the Electric
              Guitar to accompany the melody. Even though we'll be relying on
              presets for our drums, feel free to go crazy!
            </DocsParagraph>
            <DocsParagraph>
              We'll be splitting this lesson into two big steps to write the
              following two Patterns:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Grand Piano",
                  description: (
                    <>
                      <strong className="text-pattern">Major 7th Melody</strong>{" "}
                      played by{" "}
                      <span className="text-pattern-track">
                        Pattern Track (1aa)
                      </span>
                      .
                    </>
                  ),
                },
                {
                  title: "Electric Guitar",
                  description: (
                    <>
                      <strong className="text-pattern">
                        Major 7th Voicing
                      </strong>{" "}
                      played by{" "}
                      <span className="text-pattern-track">
                        Pattern Track (1ab)
                      </span>
                      .
                    </>
                  ),
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="Step 1. Open the Pattern Editor"
        answer={
          <>
            <DocsParagraph>
              To open the Pattern Editor, you can click on the{" "}
              <span className="inline-flex items-center justify-center h-7 w-7 p-1 bg-emerald-600 rounded-full text-white">
                <BsPencil />
              </span>{" "}
              button in the Navbar. A new Pattern should be selected by default.
            </DocsParagraph>
            <DocsImage src={step1} alt="Lesson 4: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 1a. Sketch out an F Major 7th Melody"
        answer={
          <>
            <DocsParagraph>
              In order to create a melody based on an F Major 7th Chord, we'll
              need to start off by only including notes that appear in the
              scale. After we've sketched out the melody, we can then introduce
              some neighbor notes to make it more interesting. Let's use a
              repeating 1-3-7 arpeggio to start off with, which will be
              transposed to the correct scale degrees once we bind the Pattern
              to its corresponding Pattern Track.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Select 16th Notes",
                  description: (
                    <>
                      Click on the button labeled "Quarter" and select the 16th
                      duration from the list.
                    </>
                  ),
                },
                {
                  title: "Input the Melody",
                  description: (
                    <>
                      Play through the melody note-by-note on the piano to match
                      the image below.
                    </>
                  ),
                },
                {
                  title: "(Delete if Necessary)",
                  description: (
                    <>
                      If you need to delete the last note you just added, you
                      can press <BsEraserFill className="inline-flex" /> or
                      "Backspace".
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step1a} alt="Lesson 4: Step 1a" />
          </>
        }
      />
      <DocsSection
        question="Step 1b. Bind the Pattern to a Track"
        answer={
          <>
            <DocsParagraph>
              Now, since we want to play this melody with the Grand Piano that
              was nested inside of an F Major 7th Chord, we can bind it to the
              corresponding Pattern Track and use any of the Scales in its
              related Scale Tracks! We'll employ the Auto-Bind feature to
              automatically convert each Pattern Note to a scale degree of the
              most appropriate Scale, i.e. the F Major 7 Chord.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Open the Settings Tab",
                  description: (
                    <>Click on the Settings button in the toolbar.</>
                  ),
                },
                {
                  title: "Bind to Pattern Track (1aa)",
                  description: (
                    <>
                      Click on the button displaying "No Pattern Track" and
                      select the Pattern Track (1aa) option.
                    </>
                  ),
                },
                {
                  title: "Auto-Bind the Pattern",
                  description: (
                    <>Click on the Auto-Bind button to bind all notes.</>
                  ),
                },
              ]}
            />
            <DocsImage src={step1b} alt="Lesson 4: Step 1b" />
          </>
        }
      />
      <DocsSection
        question="Step 1c. Introduce Neighbor Notes"
        answer={
          <>
            <DocsParagraph>
              Now that each note represents a scale degree of an F Major 7th
              Chord, we can write in our neighbor notes by inputting different
              scale offsets! Let's introduce some neighbor notes in a classic
              Barry Harris style by dropping and raising the seventh of the
              chord as shown below.
            </DocsParagraph>

            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Select the First E",
                  description: (
                    <>
                      Click on <BsCursor className="inline-flex" /> or "C" to
                      toggle the cursor and make sure it works by clicking on
                      the first E.
                    </>
                  ),
                },
                {
                  title: "Go to the Edit Tab",
                  description: (
                    <>
                      With a note selected, click on the Edit button in the
                      toolbar.
                    </>
                  ),
                },
                {
                  title: "Lower the Second E",
                  description: <>Click on the second E and set T(1) = -1.</>,
                },
                {
                  title: "Lower the Third E",
                  description: (
                    <>Click on the third E and set T(1) = -1 and N = -1.</>
                  ),
                },
                {
                  title: "Lower the Fourth E",
                  description: <>Click on the fourth E and set T(1) = -1.</>,
                },
                {
                  title: "Skip the Last E",
                  description: <>All done!</>,
                },
              ]}
            />
            <DocsImage src={step1c} alt="Lesson 4: Step 1c" />
          </>
        }
      />
      <DocsSection
        question="Step 1d. Finalize the Melody"
        answer={
          <>
            <DocsParagraph>
              Great job, we now have a convincing melodic idea to play and
              manipulate across our arrangement! Let's take a moment to finalize
              the Pattern and give it a descriptive name like "Major 7th Melody"
              by directly editing the title of the Pattern Editor.
            </DocsParagraph>

            <DocsImage src={step1d} alt="Lesson 4: Step 1e" />
          </>
        }
      />
      <DocsSection
        question="Step 2. Create a New Pattern"
        answer={
          <>
            <DocsParagraph>
              Now, let's move on to writing the Major 7th Chord voicing for our{" "}
              Electric Guitar by clicking on the New button in the toolbar.
            </DocsParagraph>
            <DocsImage src={step2} alt="Lesson 4: Step 2" />
          </>
        }
      />
      <DocsSection
        question="Step 2a. Sketch out the F Major 7th Voicing"
        answer={
          <>
            <DocsParagraph>
              For this voicing, let's use whole notes and stack a chord over a
              shell (1st and 7th) in root position.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Select Whole Notes",
                  description: (
                    <>
                      Click on the button labeled "16th" and select the Whole
                      duration from the list.
                    </>
                  ),
                },
                {
                  title: "Input the Chord",
                  description: (
                    <>
                      Add the Chord by holding Shift and playing through each
                      note on the piano to match the image below.
                    </>
                  ),
                },
                {
                  title: "(Delete if Necessary)",
                  description: (
                    <>
                      If you need to clear the chord, you can press{" "}
                      <BsTrashFill className="inline-flex" /> or
                      "Shift+Backspace".
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step2a} alt="Lesson 4: Step 2a" />
          </>
        }
      />
      <DocsSection
        question="Step 2b. Bind the Pattern to a Track"
        answer={
          <>
            <DocsParagraph>
              Let's follow the same steps again to bind the Pattern to its
              corresponding Pattern Track.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Open the Settings Tab",
                  description: (
                    <>Click on the Settings button in the toolbar.</>
                  ),
                },
                {
                  title: "Bind to Pattern Track (1ab)",
                  description: (
                    <>
                      Click on the button displaying "No Pattern Track" and
                      select the Pattern Track (1ab) option.
                    </>
                  ),
                },
                {
                  title: "Auto-Bind the Pattern",
                  description: (
                    <>Click on the Auto-Bind button to bind all notes.</>
                  ),
                },
              ]}
            />
            <DocsImage src={step2b} alt="Lesson 4: Step 2b" />
          </>
        }
      />
      <DocsSection
        question="Step 2c. Introduce Neighbor Notes"
        answer={
          <>
            <DocsParagraph>
              Let's keep it classy and add a ninth for color by moving the upper
              F to a G.
            </DocsParagraph>
            <DocsList
              className="ml-4"
              numerical
              items={[
                {
                  title: "Select the Chord",
                  description: (
                    <>Show the cursor or click on the chord in the score.</>
                  ),
                },
                {
                  title: "Go to the Edit Tab",
                  description: (
                    <>
                      With a note selected, click on the Edit button in the
                      toolbar.
                    </>
                  ),
                },
                {
                  title: "Select the Upper F",
                  description: <>Click on MIDI = 41 and select MIDI = 65.</>,
                },
                {
                  title: "Raise the Scale Degree",
                  description: <>Set T(1) = 1.</>,
                },
              ]}
            />
            <DocsImage src={step2c} alt="Lesson 4: Step 2c" />
          </>
        }
      />
      <DocsSection
        question="Step 2d. Finalize the Voicing"
        answer={
          <>
            <DocsParagraph>
              Great job, we now have a solid voicing to play and develop with
              our Electric Guitar! Let's take a moment to finalize the Pattern
              and give it a descriptive name like "Major 7th Voicing" by
              directly editing the title of the Pattern Editor.
            </DocsParagraph>

            <DocsImage src={step2d} alt="Lesson 4: Step 2d" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              Since we're using presets for the rest of our Pattern Tracks,
              we're done with writing our Patterns!
            </DocsParagraph>
            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/design-your-poses">
                Lesson 5: Design Your Poses
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
