import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function EditorDocsContent() {
  return (
    <>
      <DocsSection
        question="What is the Editor?"
        answer={
          <>
            <DocsParagraph>
              The Editor is a dedicated window used for composing and editing
              the fundamental building blocks of a project, encompassing:
            </DocsParagraph>
            <DocsList
              ie
              items={[
                {
                  title: "The Pattern Editor",
                  description:
                    "A score-based interface for creating globally available patterns.",
                  examples: [
                    "The central location for designing melodic themes and musical motifs.",
                  ],
                },
                {
                  title: "The Pose Editor",
                  description:
                    "A module-based interface for creating globally available poses.",
                  examples: [
                    "The central location for designing transpositions, progressions, and forms.",
                  ],
                },
                {
                  title: "The Scale Editor",
                  description:
                    "A score-based interface for editing a Scale Track's Scale.",
                  examples: [
                    "The central location for designing nested musical structures.",
                  ],
                },
                {
                  title: "The Instrument Editor",
                  description:
                    "A module-based interface for editing a Pattern Track's Instrument.",
                  examples: [
                    "The central location for designing unique timbres and textures.",
                  ],
                },
              ]}
            />
            <DocsParagraph>
              The Scale and Instrument Editors are track-specific, managing
              objects that belong to a specific track, whereas the Pattern and
              Pose Editors are global, creating objects that can be used across
              multiple tracks.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Why is the Editor a special window?"
        answer={
          <>
            <DocsParagraph>
              The Editor is designed to be a specialized menu for creating and
              editing the fundamental building blocks of your project so that
              you can focus on one objective at a time without cluttering the
              screen. Using this dedicated approach, the Editor can present as
              much information as necessary without having to compete against
              the main interface for screen space and attention. The Editor is
              carefully designed so that you can easily switch between different
              views without losing your place and dynamically preview your
              changes in real time.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
