import {
  DocsSection,
  DocsParagraph,
  DocsList,
  DocsTerm,
} from "../../components";

export function ProjectDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Project?"
        answer={
          <>
            <DocsParagraph>
              A Project is, put simply, a collection of Scales, Patterns, Poses,
              Instruments, Tracks, Clips, and Portals! There are some additional
              settings that need to be stored as well, such as tempo and time
              signature, but the bulk of the Project is made up of these seven
              core concepts. You can even think of a Project more simply as:
            </DocsParagraph>
            <DocsList
              numerical
              ie
              items={[
                {
                  title: "Building Blocks",
                  description: `Themes, Motifs, and Gestures.`,
                  examples: ["Scales, Patterns, Poses, and Instruments."],
                },
                {
                  title: "Scheduled Arrangement",
                  description: "Structure, Form, and Orchestration.",
                  examples: [`Tracks and Media (Clips and Portals).`],
                },
              ]}
            />
            <DocsParagraph>
              The building blocks are the raw materials that you design and use
              across your music, and the scheduled arrangement contains the way
              that you organize and manipulate those materials over time. This
              is not a strict division by any means, but it is a useful way to
              think about Projects and how they are structured. In reality,
              musicmaking is a dynamic process that involves a lot of back and
              forth between these two categories.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How is a Project stored?"
        answer={
          <DocsParagraph>
            A Project is stored in our proprietary JSON format known as{" "}
            <DocsTerm>HAM</DocsTerm> (short for "HArMonia" or "Harmonia
            Arrangement Markup" files), which is directly serialized from the
            state tree or "store" created with Redux. This format is designed to
            be as human-readable and human-writable as possible, so that you can
            easily edit your Projects by hand if you want to. No information is
            lost when converting between HAM and JSON, so you can use any JSON
            or text editor to work with your Projects as well.
          </DocsParagraph>
        }
      />
      <DocsSection
        question="How can I share a Project?"
        answer={
          <DocsParagraph>
            The most straightforward way to share a Project with someone else is
            to export it as a HAM file and send it through any file sharing
            service. This will allow the recipient to import the Project into
            their own Harmonia session and play it for themselves or continue
            working on it. Alternatively, you can export a Project as a MIDI
            file that can be opened in any other DAW or as a WAV file that will
            capture the audio of a Project from start to finish, but do keep in
            mind that these files will not contain any of the underlying
            information about your Project. In the future, we plan to support
            additional file formats, live collaboration, and cloud storage.
          </DocsParagraph>
        }
      />
    </>
  );
}
