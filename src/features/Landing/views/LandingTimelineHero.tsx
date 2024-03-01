import {
  LandingSection,
  LandingHeroImage,
  LandingHeroProps,
  LandingHeroQuoteContainer,
  LandingHeroQuote,
  LandingPopupHeader,
  LandingImageGroup,
} from "../components";
import TimelineImage from "assets/images/timeline1.png";

export const LandingTimelineHero = (props: LandingHeroProps) => (
  <LandingSection className="gap-4">
    <LandingPopupHeader title="Revolutionizing Workflow..." />
    <LandingImageGroup>
      <LandingHeroImage
        className="shadow-indigo-500"
        src={TimelineImage}
        initial={{ opacity: 0, translateX: -50 }}
        whileInView={{ opacity: 1, translateX: 0 }}
      />
      <LandingHeroQuoteContainer
        initial={{ opacity: 0, translateX: 50 }}
        whileInView={{ opacity: 1, translateX: 0 }}
      >
        <LandingHeroQuote
          text={
            <>
              <p>
                Jump outside the box of your digital audio workstation and
                explore a universe of musical possibilities that were previously
                inaccessible to the digital composer.
              </p>
              <p>
                Compose musical structures of infinite complexity and
                effortlessly navigate the geometry of music with Harmonia's
                universally-accessible interface.
              </p>
              <p>Level up your workflow. Unleash your creativity.</p>
            </>
          }
        />
      </LandingHeroQuoteContainer>
    </LandingImageGroup>
  </LandingSection>
);
