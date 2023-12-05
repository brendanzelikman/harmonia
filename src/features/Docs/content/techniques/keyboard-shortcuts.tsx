import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function KeyboardShortcutsDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Keyboard Shortcut?"
        answer={
          <>
            <DocsParagraph>
              Instead of performing an explicit action like clicking a button or
              dragging an object, you may be able to make use of a shortcut that
              lets you simply press a key or combination of keys instead! This
              is known as a "keyboard shortcut" and it can be useful for quickly
              performing repetitive tasks and bypassing the process of dragging
              and clicking your mouse. Every keyboard shortcut is designed to
              match with conventional web and music software.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Which shortcuts can I use?"
        answer={
          <>
            <DocsParagraph>
              There are three different types of keyboard shortcuts available in
              Harmonia:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Global Shortcuts",
                  description: "Accessible anywhere on the website.",
                  examples: [
                    `"Cmd + S" = Save Project to HAM`,
                    `"Cmd + ," = Open/Close Settings`,
                  ],
                },
                {
                  title: "Timeline Shortcuts",
                  description: "Accessible in the timeline.",
                  examples: [
                    `"Space" = Play/Pause Transport`,
                    `"Cmd + A" = Select All Media`,
                  ],
                },
                {
                  title: "Editor Shortcuts",
                  description: "Accessible in a specific Editor.",
                  examples: [
                    `"Shift + Space" = Play Scale`,
                    `"Esc" = Close Editor`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              For a full list of shortcuts, you can open the Shortcuts Menu at
              any time by clicking on "View Shortcuts" in the Settings menu of
              the Navbar or by inputting a question mark anywhere in the
              Playground (i.e. "?" or "Shift + /").
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="There's too many shortcuts to learn!"
        answer={
          <DocsParagraph>
            We understand that it can be overwhelming to learn a bunch of new
            shortcuts, especially when you're just starting out, but every
            shortcut is entirely optional and designed to save you time, not
            waste it! Rather than memorizing every shortcut, we recommend that
            you explore them as you go and rely on the Shortcuts Menu for
            reference whenever necessary. There won't be an exam at the end, so
            don't worry about it!
          </DocsParagraph>
        }
      />
    </>
  );
}
