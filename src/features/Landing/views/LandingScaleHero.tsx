import {
  LandingSection,
  LandingHeroImage,
  LandingHeroProps,
  LandingHeroQuoteContainer,
  LandingHeroQuote,
  LandingPopupHeader,
  LandingImageGroup,
} from "../components";
import ScaleEditorImage from "assets/images/scaleEditor.png";

export const LandingScaleHero = (props: LandingHeroProps) => (
  <LandingSection className="gap-4">
    <LandingPopupHeader title="Unlocking Scales..." />
    <LandingImageGroup>
      <LandingHeroImage
        className="shadow-sky-500"
        src={ScaleEditorImage}
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
                How long have you been waiting for music software that lets you
                design and customize your own scales?
              </p>
              <p>
                How long have you been waiting for DAWs to let you compose with
                a dedicated sheet music editor?
              </p>
              <p>
                How long have you been waiting to write scales within scales
                within scales within scales within scales?
              </p>
              <p>Well, the wait is over. Dive right in.</p>
            </>
          }
        />
      </LandingHeroQuoteContainer>
    </LandingImageGroup>
  </LandingSection>
);
