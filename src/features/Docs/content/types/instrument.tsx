import { EFFECT_KEYS, INSTRUMENT_NAMES } from "types/Instrument";
import { DocsList } from "../../components/DocsList";
import { DocsSection } from "../../components/DocsSection";
import { DocsParagraph } from "../../components";

export function InstrumentDocsContent() {
  return (
    <>
      <DocsSection
        question="What is an Instrument?"
        answer={
          <>
            <DocsParagraph>
              An Instrument is essentially a musical translator that converts
              theoretically-defined notes into real-world sounds. In Harmonia,
              an Instrument contains three main components:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Instrumental Sampler",
                  description:
                    "Plays a sound by interpolating from a collection of pitched audio samples.",
                  examples: [
                    `Grand Piano = { key: "grand_piano", samples: { C4: sample.wav } }`,
                    `Strings Ensemble = { key: "strings_ensemble", samples: { A4: concert_a.wav } }`,
                  ],
                },
                {
                  title: "Channel Interface",
                  description: "Routes a sound through basic audio controls.",
                  examples: [
                    `Quiet Pan Left = { volume: -20dB, pan: -1, ... }`,
                    `Soloed Audio = { solo: true, mute: false, ... }`,
                  ],
                },
                {
                  title: "Audio Effects",
                  description:
                    "Transforms a sound using a chain of audio effects and processes.",
                  examples: [
                    `Reverb + Chorus = [{ key: "reverb", ... }, { key: "chorus", ... }]`,
                    `Bass Boost = [{ key: "eq", low: +5dB, mid: -20dB, high: -20dB, ... }]`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              There are {INSTRUMENT_NAMES.length} types of samplers and{" "}
              {EFFECT_KEYS.length} types of audio effects available for use with
              infinite possibilities for customization.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How are Instruments stored?"
        answer={
          <DocsParagraph>
            Instruments are initially designed to craft a specific timbre and
            then employed to play a specific part in a composition. Upon loading
            a project, the website will create a live, ephemeral audio node for
            every Instrument that will handle playback and exist until the page
            is reloaded or closed. These nodes will be routed into a global
            channel and connected with the audio transport to sync with
            mute/solo states and update whenever the tempo changes. There will
            also be a global sampler created to handle generic audio like
            metronome clicks and score notes. If there are ever any issues with
            audio, your best bets are to restart playback and refresh the page.
          </DocsParagraph>
        }
      />
    </>
  );
}
