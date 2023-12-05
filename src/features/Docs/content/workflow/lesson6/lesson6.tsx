import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "features/Docs/components";
import { BsArrowRepeat, BsBrush, BsPlay } from "react-icons/bs";

import start from "./lesson6-start.png";
import step1 from "./lesson6-step1.png";
import step2 from "./lesson6-step2.png";
import step3 from "./lesson6-step3.png";

export function WorkflowLesson6DocsContent() {
  return (
    <>
      <DocsSection
        question="Welcome to Lesson 6: Arrange Your Clips!"
        answer={
          <>
            <DocsParagraph>
              In this lesson, we'll arrange our Clips into our Tracks and
              assemble a playable composition!
            </DocsParagraph>
            <DocsImage src={start} alt="Lesson 6: Start" />
          </>
        }
      />
      <DocsSection
        question="Goal: Compose Our Arrangement"
        answer={
          <>
            <DocsParagraph>
              Finally, we get the satisfaction of putting all of our pieces
              together and hearing our composition come to life! Although this
              is a moment of truth, it is important to remember that this lesson
              is scripted and there is usually a lot more back and forth between
              writing and listening in the creative process. The point of this
              lesson is to get you comfortable with the process of arranging
              Clips, so please don't feel like this is the end of your creative
              process!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 1: Prepare the Timeline"
        answer={
          <>
            <DocsParagraph>
              Before we start arranging our Clips, let's prepare the Timeline to
              make it easier to see what we're doing and create a looped section
              to work with.
            </DocsParagraph>
            <DocsList
              numerical
              items={[
                {
                  title: "Zoom Out",
                  description: (
                    <>
                      Click on <span>Cmd + Minus</span> to zoom out and see all
                      four measures.
                    </>
                  ),
                },
                {
                  title: "Enable Looping",
                  description: (
                    <>
                      Click on <BsArrowRepeat className="inline-flex" /> or
                      "Shift + L" to enable looping.
                    </>
                  ),
                },
                {
                  title: "Set the Loop End",
                  description: (
                    <>
                      Move the loop point to the end of the fourth bar by
                      dragging it to the appropriate position in the header of
                      the Timeline or by holding "E" and clicking there.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step1} alt="Lesson 6: Step 1" />
          </>
        }
      />
      <DocsSection
        question="Step 2: Add Your Pattern Clips!"
        answer={
          <>
            <DocsParagraph>
              We recommend playing through your loop here while you arrange each
              of your Clips to jam along and imagine how it might sound as the
              different instruments enter in a fully realized composition!
              However, keep in mind that your work will not be saved while the
              Transport is playing, so don't forget to stop your loop before you
              save or leave the website.
            </DocsParagraph>
            <DocsList
              numerical
              items={[
                {
                  title: "(Play the Loop)",
                  description: (
                    <>
                      Click on <BsPlay className="inline-flex" /> or "Space" to
                      play through the loop.
                    </>
                  ),
                },
                {
                  title: "Select Your Pattern",
                  description: (
                    <>
                      Select the appropriate preset from the Pattern Listbox in
                      the Navbar.
                    </>
                  ),
                },
                {
                  title: "Add Your Pattern Clips",
                  description: (
                    <>
                      Click on <BsBrush className="inline-flex" /> to start
                      adding your Clips and click on any empty cells in the
                      Timeline.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step2} alt="Lesson 6: Step 2" />
            <DocsParagraph>
              The Straight Quarter Notes can be found in the Straight Durations
              category, and the rest of the presets can be found in Latin
              Rhythms.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Step 3: Add Your Pose Clips!"
        answer={
          <>
            <DocsParagraph>
              Now that we have our Pattern Clips arranged, we can add our Pose
              Clips to the Timeline and hear how they change the composition!
            </DocsParagraph>
            <DocsList
              numerical
              items={[
                {
                  title: "Select Your Pose",
                  description: (
                    <>
                      Toggle the mode of the Navbar and select the appropriate
                      preset from the Pose Listbox.
                    </>
                  ),
                },
                {
                  title: "Add Your Pose Clips",
                  description: (
                    <>
                      Click on <BsBrush className="inline-flex" /> to start
                      adding your Clips and click on any empty cells in the
                      Timeline.
                    </>
                  ),
                },
              ]}
            />
            <DocsImage src={step3} alt="Lesson 6: Step 3" />
          </>
        }
      />
      <DocsSection
        question={"Great job! You've reached the end of this lesson!"}
        answer={
          <>
            <DocsParagraph>
              Using all of the work done thus far, we've composed a full
              arrangement! This is a great time to play through your loop and
              make any adjustments to your music as you see fit. The next and
              last lesson will quickly show you how to save and export your
              project, so feel free to take your time here!
            </DocsParagraph>
            <DocsParagraph>
              Whenever you're ready, you can go to{" "}
              <DocsLink redirect to="/docs/workflow/export-your-music">
                Lesson 7: Export Your Music
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
