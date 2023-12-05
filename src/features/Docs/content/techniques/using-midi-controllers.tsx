import {
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "../../components";

export function UsingMidiControllersDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a MIDI Controller?"
        answer={
          <>
            <DocsParagraph>
              A MIDI Controller is any physical or digital interface that allows
              you to input MIDI data. This can be a keyboard, a drum pad, a
              guitar, a DJ controller, or even a smartphone app! A MIDI
              controller might be used for live performance, recording, or
              composition, and it can theoretically be used to control any
              parameter of any software that accepts MIDI data.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How can I use a MIDI Controller?"
        answer={
          <>
            <DocsParagraph>
              Plug and play! As long as your MIDI Controller is connected to the
              same computer that you're using to access the website, it should
              automatically be detected and ready to use. If you're having
              trouble, make sure that your MIDI Controller is connected to your
              computer before you open the website.
            </DocsParagraph>
            <DocsParagraph>
              Once your MIDI Controller is connected, you can use it to control
              the website in a variety of ways. For example, you can use it to:
            </DocsParagraph>

            <DocsList
              ie
              items={[
                {
                  title: "Hear Pitches",
                  description: "Play notes using a global piano sampler.",
                  examples: ["Input a note anywhere in the Timeline."],
                },
                {
                  title: "Play Instruments",
                  description:
                    "Play notes using the Instrument of a Pattern Track.",
                  examples: ["Input a note with a Pattern Track selected."],
                },
                {
                  title: "Input Notes/Chords",
                  description:
                    "Play notes that would be inputted using the virtual piano interface.",
                  examples: ["Input a note in the Scale or Pattern Editor."],
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="I have a question about my MIDI Controller!"
        answer={
          <>
            <DocsParagraph>
              If you have any questions about the functionality of your MIDI
              controllers, please consult the{" "}
              <DocsLink to="https://webmidijs.org/">WebMIDI</DocsLink>{" "}
              documentation for further details! We are working on improving
              support for MIDI Controllers, so please stay tuned for more
              updates!
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
