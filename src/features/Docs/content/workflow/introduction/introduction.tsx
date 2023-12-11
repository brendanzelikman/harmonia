import { Logo } from "components/Logo";
import {
  DocsImage,
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "../../../components";
import end from "./introduction-end.png";
import { BsMusicPlayer } from "react-icons/bs";

export function WorkflowIntroductionDocsContent() {
  return (
    <>
      <DocsSection
        question="How do I create a Project?"
        answer={
          <>
            <DocsParagraph>
              Of course, there are many different ways to create a project, but
              we can cover a great detail of information by starting with a
              simple workflow. Here, we will give you a crash course on using
              the website by recreating the Ode to Barry demo from scratch! This
              tutorial might not always be updated with the most recent version
              of the website, since the interfaces are constantly evolving, but
              it will always cover all that you need to know about creating a
              project! If this is your first time using the website, we
              recommend that you follow along in order, since the content builds
              upon itself.
            </DocsParagraph>
            <DocsParagraph>
              Here is the outline for the lessons we have planned:
            </DocsParagraph>
            <DocsList
              indent
              items={[
                {
                  title: "Lesson #1",
                  description: (
                    <DocsLink to="/docs/workflow/organize-your-tracks" redirect>
                      Organize Your Tracks
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #2",
                  description: (
                    <DocsLink
                      to="/docs/workflow/choose-your-instruments"
                      redirect
                    >
                      Choose Your Instruments
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #3",
                  description: (
                    <DocsLink to="/docs/workflow/prepare-your-scales" redirect>
                      Prepare Your Scales
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #4",
                  description: (
                    <DocsLink to="/docs/workflow/write-your-patterns" redirect>
                      Write Your Patterns
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #5",
                  description: (
                    <DocsLink to="/docs/workflow/design-your-poses" redirect>
                      Design Your Poses
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #6",
                  description: (
                    <DocsLink to="/docs/workflow/arrange-your-clips" redirect>
                      Arrange Your Clips
                    </DocsLink>
                  ),
                },
                {
                  title: "Lesson #7",
                  description: (
                    <DocsLink to="/docs/workflow/export-your-music" redirect>
                      Export Your Music
                    </DocsLink>
                  ),
                },
              ]}
            />
            <DocsParagraph>
              And voila, by explaining every core data type with a practical
              example from the website, we can cover all there is to know about
              creating a Project! Even though we might not have a playable tune
              until the very end, we are still equally composing along every
              step of the way. If you are already familiar with the website,
              feel free to skip around to any of the lessons that you find
              interesting.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Ready to Learn?"
        answer={
          <>
            <DocsParagraph>
              If you'd like to follow along, you can{" "}
              <DocsLink to="/projects">open the website</DocsLink> in a new tab
              or window and load a new Project in one of two ways:
            </DocsParagraph>
            <DocsList
              indent
              items={[
                {
                  title: "From The Projects Tab",
                  description: (
                    <>
                      Click on Create a Project under the search bar and click
                      on the Project File to open the Playground.
                    </>
                  ),
                },
                {
                  title: "From The Playground",
                  description: (
                    <>
                      Click on <BsMusicPlayer className="inline-flex" /> in the
                      Navbar and click on Open New Project.
                    </>
                  ),
                },
              ]}
            />

            <DocsImage src={end} alt="End of Introduction" />
            <DocsParagraph>
              Whenever you're ready, you can start with{" "}
              <DocsLink redirect to="/docs/workflow/organize-your-tracks">
                Lesson 1: Organize Your Tracks
              </DocsLink>
              .
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
