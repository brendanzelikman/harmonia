import {
  LandingSection,
  LandingHeroImage,
  LandingHeroProps,
  LandingHeroQuoteContainer,
  LandingHeroQuote,
  LandingImageGroup,
  LandingPopupHeader,
} from "../components";
import PosePreviewImage from "assets/images/timeline2.png";

export const LandingPoseHero = (props: LandingHeroProps) => (
  <LandingSection className="gap-4">
    <LandingPopupHeader title="Redefining Transpositions..." />
    <LandingImageGroup>
      <LandingHeroImage
        className="shadow-fuchsia-500"
        src={PosePreviewImage}
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
                Wouldn't it be nice to unravel the layers of your music and
                apply sweeping changes to multiple sections at once?
              </p>
              <p>
                Wouldn't it be cool to explore the relationships between
                structures and easily move through musical space?
              </p>
              <p>
                Wouldn't it be great to automatically calculate your
                transpositions, voice leadings, and chord progressions?
              </p>
              <p>It's time to turn that crazy dream into a reality. </p>
            </>
          }
        />
      </LandingHeroQuoteContainer>
    </LandingImageGroup>
  </LandingSection>
);
