import { PPQ } from "utils/durations";
import { DocsList, DocsParagraph, DocsSection } from "../../components";
import { DEFAULT_VELOCITY } from "utils/constants";
import { PresetPatternList } from "assets/patterns";

export function PatternDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Pattern?"
        answer={
          <>
            <DocsParagraph>
              A Pattern is a sequential stream of "blocks" that can each be
              interpreted as a musical note, chord, or rest. Each block will
              have a duration expressed in ticks and any other unique properties
              associated with the type of block.
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Pattern Rest",
                  description: `An object with only a duration specified.`,
                  examples: [
                    `One Tick Rest = { duration: 1 }`,
                    `If PPQ = ${PPQ}, then Quarter Note Rest = { duration: ${PPQ} }`,
                  ],
                },
                {
                  title: "Pattern Note",
                  description:
                    "A scale note object with a duration and velocity specified.",
                  examples: [
                    `C4 Quarter Note = { MIDI: 60, duration: ${PPQ}, velocity: ${DEFAULT_VELOCITY} }`,
                    `Tonic Quarter Note = { degree: 1, scaleId: "major-scale", duration: ${PPQ}, velocity: ${DEFAULT_VELOCITY} }`,
                  ],
                },
                {
                  title: "Pattern Chord",
                  description: "An array of Pattern Notes.",
                  examples: [
                    `C Major Chord = [{ MIDI: 60, ... }, { MIDI: 64, ... }, { MIDI: 67, ... }}]`,
                    `Tonic Quarter Note = [{ degree: 1, scaleId: "major-scale", duration: ${PPQ}, velocity: ${DEFAULT_VELOCITY} }]`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              In many ways, a Pattern is a flexible kind of Scale with
              additional properties to orchestrate timing and dynamics. As with
              Scales, we can use MIDI notes or scale degrees to define Pattern
              Notes, and we can specify a parent scale by ID with the
              "patternTrackId" field of the Pattern or override that value using
              the "scaleId" field of a Pattern Note. If no scale is specified,
              the chromatic scale will be used by default.
            </DocsParagraph>
            <DocsParagraph>
              There are {PresetPatternList.length} preset patterns to choose
              from, but you can always create your own!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How do I use a Pattern with a Scale?"
        answer={
          <>
            <DocsParagraph>
              If a Scale is like terrain, then a Pattern is like a hike that can
              cross over any trail. We can design a hike by carefully following
              a predetermined path, or we can walk around randomly and see where
              we end up. If we want to build and release tension in a musically
              satisfying way, then it helps to know which paths will take us
              where we need to go. This is why Patterns can use scale degrees,
              so that we can design hikes that will adapt to different terrains,
              like when a melody modulates to a new key or a chord changes its
              harmony.
            </DocsParagraph>
            <DocsParagraph>
              Once we design a Pattern, we can apply various transformations to
              the pattern (including but not limited to transposition,
              inversion, repetition, reversal, etc.), and substantially develop
              the musical idea. We can also transform any or all of the
              underlying scales of the Pattern to substantially transform the
              tonality . This means that we can design a Pattern once and then
              use it in any scale without having to re-design the Pattern for
              each scale.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
