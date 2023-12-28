import {
  LandingSection,
  LandingHeroImage,
  LandingHeroQuoteContainer,
  LandingHeroQuote,
  LandingImageGroup,
  LandingPopupHeader,
} from "./components";
import PortalImage from "assets/images/timeline3.png";

export const LandingPortalHero = () => (
  <LandingSection className="gap-4">
    <LandingPopupHeader title="Breaking Barriers..." />
    <LandingImageGroup>
      <LandingHeroImage
        className="shadow-orange-500"
        src={PortalImage}
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
              <p>Who said we're not allowed to have fun?</p>
              <p>Who said we can't bend the rules a little?</p>
              <p>Who said we shouldn't have it all?</p>
              <p>We didn't. We want it all.</p>
            </>
          }
        />
      </LandingHeroQuoteContainer>
    </LandingImageGroup>
  </LandingSection>
);
