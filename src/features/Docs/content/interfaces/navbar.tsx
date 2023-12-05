import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function NavbarDocsContent() {
  return (
    <>
      <DocsSection
        question="What is the Navbar?"
        answer={
          <>
            <DocsParagraph>
              The Navbar (short for "navigation bar") is a component
              centralizing various functionality that is always visible at the
              top of the screen. The current iteration of the Navbar contains
              six main sections, from left to right:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Section #1",
                  description: "Project/File Controls",
                  examples: [
                    "Save and export the project, undo and redo the arrangement, etc.",
                  ],
                },
                {
                  title: "Section #2",
                  description: "Audio/Transport Controls",
                  examples: [
                    "Start and stop the transport, adjust loop regions, etc.",
                  ],
                },
                {
                  title: "Section #3",
                  description: "Pattern Customization",
                  examples: [
                    "Toggle the Pattern Editor, arrange Pattern Clips, etc.",
                  ],
                },
                {
                  title: "Section #4",
                  description: "Pose Customization",
                  examples: [
                    "Toggle the Pose Editor, arrange Pose Clips, etc.",
                  ],
                },
                {
                  title: "Section #5",
                  description: "Media Controls",
                  examples: ["Slice and merge Clips, create Portals, etc."],
                },
                {
                  title: "Section #6",
                  description: "Timeline/Transport Settings",
                  examples: ["Lower the volume, adjust the tempo, etc."],
                },
              ]}
            />
            <DocsParagraph>
              The Navbar is the most frequently updated component of the
              interface, since it contains functionality spanning across the
              entire website and facilitates every interaction not directly
              contained within the Timeline or Editor. Please be patient as we
              roll out new features and improvements!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Why Navbar instead of Toolbar?"
        answer={
          <>
            <DocsParagraph>
              We opt to call this component the Navbar rather than the Toolbar
              because it does not contain the only tools in the interface, but
              it is always visible and accessible for navigation. We embrace the
              imagery of navigating between different worlds rather than
              cluttering our hands with tools. Referring to it as the Navbar
              also helps to distinguish it from actual toolbars that may pop up
              within other components with more specific functionality.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
