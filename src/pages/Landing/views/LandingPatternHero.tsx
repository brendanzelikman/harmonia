import {
  LandingSection,
  LandingHeroImage,
  LandingHeroProps,
  LandingHeroQuoteContainer,
  LandingHeroQuote,
  LandingImageGroup,
  LandingPopupHeader,
} from "../components";
import PatternEditorImage from "assets/images/patternEditor.png";

export const LandingPatternHero = (props: LandingHeroProps) => (
  <LandingSection className="gap-4">
    <LandingPopupHeader title="Upgrading Patterns..." />
    <LandingImageGroup>
      <LandingHeroImage
        className="shadow-emerald-500"
        src={PatternEditorImage}
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
                Are you tired of rewriting the same patterns over and over
                again, just to make a few small changes?
              </p>
              <p>
                Are you tired of seemingly endless dropdown menus and
                continually uninspiring piano roll interfaces?
              </p>
              <p>
                Are you tired of forgetting which degrees are in which scale and
                which notes are in which chord?
              </p>
              <p>We're tired of all of that too. Time to make things easy.</p>
            </>
          }
        />
      </LandingHeroQuoteContainer>
    </LandingImageGroup>
  </LandingSection>
);
