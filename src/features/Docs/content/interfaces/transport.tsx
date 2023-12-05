import { PPQ } from "utils/durations";
import {
  DocsList,
  DocsSection,
  DocsParagraph,
  DocsLink,
  DocsTerm,
} from "../../components";

export function TransportDocsContent() {
  return (
    <>
      <DocsSection
        question="What is the Transport?"
        answer={
          <>
            <DocsParagraph>
              The Transport controls timing, playback, and synchronization of
              audio events throughout the website, wrapping around the Tone.js{" "}
              <DocsLink to="https://tonejs.github.io/docs/Transport">
                Transport
              </DocsLink>{" "}
              class with various explicit properties including:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Playback Controls",
                  description:
                    "The current playback status, tempo, and time signature.",
                  examples: [
                    `{ ... state: "started", tempo: 120, timeSignature: [4, 4] }`,
                  ],
                },
                {
                  title: "Loop Specifications",
                  description:
                    "The loop start and end ticks, and the loop state.",
                  examples: [`{ ... loopStart: 0, loopEnd: 4, loop: true }`],
                },
                {
                  title: "Audio Context",
                  description:
                    "The current audio context, including mute and volume.",
                  examples: [
                    `{ ... mute: false, volume: 0dB, downloading: false, recording: false }`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              In order to optimize performance and avoid rerendering the website
              on every tick, the Transport will store the current tick outside
              of the state tree and send a custom window event to the relevant
              components whenever they need to update.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How does the Transport measure time?"
        answer={
          <>
            <DocsParagraph>
              The most precise unit of time used in a Transport is a{" "}
              <DocsTerm>Tick</DocsTerm>, which is equivalent to one pulse and
              adjusted in duration by the current tempo, time signature, and
              pulses per quarter note (PPQ). If the project is in 4/4 at 60 BPM
              with a PPQ of {PPQ}, then {PPQ} ticks = 1 quarter note = 1 beat =
              1 second. You might also see the time expressed in{" "}
              <DocsTerm>Bars:Beats:Sixteenths</DocsTerm>, which is a common
              format used in other music notation software.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
