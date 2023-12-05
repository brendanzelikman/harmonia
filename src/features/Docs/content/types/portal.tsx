import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function PortalDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Portal?"
        answer={
          <>
            <DocsParagraph>
              A Portal is an instantaneous event that transports a Clip from one
              track and tick to another, consisting of two portal fragments that
              can each be placed anywhere in the timeline:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Entrance Portal",
                  description: "The entrance of a Portal. Finite clips only.",
                  examples: [`{ tick: 0, trackId: "piano-track", ... }`],
                },
                {
                  title: "Exit Portal",
                  description: "The exit of a Portal. Cannot be entered.",
                  examples: [
                    `{ portaledTick: 500, portaledTrackId: "guitar-track", ... }`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              Since a Portal is a track-based event, it will only interact with
              Clips that are placed before it in the same track. When a Clip
              crosses the entrance of a portal, the remainder of the Clip will
              be removed from the original Track and placed in the new Track at
              the specified tick. This feature was based off of the portal
              mechanic in the "Portal" video game series created by Valve.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="What is a Portal used for?"
        answer={
          <DocsParagraph>
            Instead of slicing and rearranging clips around the timeline, we can
            use a Portal to slice and move a clip without changing its
            underlying content. This allows us to clearly reharmonize or
            reorchestrate a Pattern Clip and easily split or alternate a Pose
            Clip. Since we can adjust or remove the entrance and exit of a
            Portal at will, we have significantly more flexibility with our
            Clips and we do not need to worry about merging and re-slicing them
            at any point. Additionally, we can use Portals to create various
            kinds of transformations that would otherwise be impossible to
            notate, like tunneling a pattern through spacetime or alternating a
            modulation between different instruments.
          </DocsParagraph>
        }
      />
      <DocsSection
        question="Isn't this a bit too niche?"
        answer={
          <>
            <DocsParagraph>
              Perhaps. But maybe it's not niche enough! By gamifying music
              software with fun and intuitive features, we can make it easier
              for musicians to engage with fundamental concepts while exploring
              alternative frameworks of composition. A Portal is easy to
              understand and instantly recognizable, which means that we can use
              it as a metaphor for more complex ideas like modulation and
              voice-leading. This is a great way to make music theory more
              accessible to a wider audience. As long as we strike a balance
              between subtlety and clarity, we can still have a robust tool for
              composition that is accessible, powerful, and immersive without
              sacrificing any of its functionality.
            </DocsParagraph>
            <DocsParagraph>
              If you're not convinced about Portals, then you can always just
              use them as a glorified cut and paste tool. But if you're
              interested in exploring uncharted musical territory, then you can
              use Portals to create some really interesting, unexpected, and
              beautiful music.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
