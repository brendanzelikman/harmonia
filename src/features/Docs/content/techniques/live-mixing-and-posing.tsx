import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function LiveMixingAndPosingDocsContent() {
  return (
    <>
      <DocsSection
        question="What is Live Mixing and Posing?"
        answer={
          <>
            <DocsParagraph>
              In order to make robust changes to a Project in real-time, we've
              developed a set of techniques known as live mixing and posing:
            </DocsParagraph>

            <DocsList
              items={[
                {
                  title: "Live Mixing",
                  description:
                    "The control over audio played by Pattern Tracks.",
                  examples: [
                    `"Mute the Piano Track and lower the Guitar Tracks."`,
                    `"Solo the Drum Tracks and mute the snare."`,
                  ],
                },
                {
                  title: "Live Posing",
                  description:
                    "The control over notes through real-time Pose Clip transformation.",
                  examples: [
                    `"Transpose a C Major Arpeggio to its dominant."`,
                    `"Modulate the Lead Tracks from C Major to E Locrian."`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              Although live mixing has been incredibly robust for decades,
              composers have traditionally been very limited in their ability to
              change the tonality of their music during a live
              performance—external plugin parameters are easily controllable but
              they cannot determine or transform the architecture of a
              composition. With the flexibility offered by live posing, however,
              we can switch up melodies, harmonies, progressions, and even
              entire forms on the fly with a set of keyboard shortcuts—creating
              an unlimited sandbox for musical exploration.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How do I mix and pose?"
        answer={
          <>
            <DocsParagraph>
              In order to mix and pose your music, you can select any Pose Clips
              on the Timeline and toggle the Live Play button that appears in
              the Navbar. This will enable live mixing and posing for the
              Project and it will persist until the button is toggled again. If
              you would like to change a Pose in relation to a specific Track,
              make sure that the Track is selected in the Timeline as well.
            </DocsParagraph>
            <DocsParagraph>
              A full list of keyboard shortcuts can be displayed by hovering
              over the Live Play button in the Navbar. Whereas live mixing is
              performed with consistent shortcuts that can't be changed, live
              posing can be performed with one of two types of shortcuts:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Numerical Shortcuts",
                  description: "Displayed with a calculator icon.",
                  examples: [
                    `"Hold Q + Press 5" = Shift a Pose up by 5 semitones (if Q = Chromatic).`,
                    `"Hold E + Press 0" = Reset a Pose's chordal offsets to 0 (if E = Chordal).`,
                  ],
                },
                {
                  title: "Alphabetical Shortcuts",
                  description: "Displayed with a keyboard icon.",
                  examples: [
                    `"Press M" = Shift a Pose up by 1 chordal step (if N is the center key).`,
                    `"Press Y" = Reset a Pose's chromatic offsets (if Y is the center key).`,
                  ],
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="Why should I mix and pose?"
        answer={
          <>
            <DocsParagraph>
              The ability to mix and pose live allows you to transform Harmonia
              from a useful tool for composition to a powerful instrument for
              performance! Whereas changing up a musical idea typically requires
              you to rewrite and reconsider your arrangement, mixing and posing
              lets you make robust changes to a Pattern or Scale on the fly with
              no preparation at all. This is useful for not only composing,
              performing, or improvising, but also for varying, experimenting,
              and jamming—you can even record your music while mixing and posing
              to export the performance as a WAV file!
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
