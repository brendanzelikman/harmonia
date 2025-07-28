import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";
import Composition from "/media/composition.gif";
import Portals from "/media/portals.png";
import Performance from "/media/performance.gif";
import Hotkeys from "/media/hotkeys.jpg";
import Math from "/media/math.png";
import Easy from "/media/easy.png";
import Nest from "/media/nest.png";
import Screenshot from "/media/screenshot.png";
import { PropsWithChildren } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

const variants = {
  hidden: { opacity: 0, translateY: -20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingDescription = () => {
  return (
    <LandingSection className="mb-8">
      <m.h2
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        viewport={{ once: true }}
        className="max-[1300px]:hidden mb-8 w-full p-1 total-center max-sm:text-lg text-3xl font-normal drop-shadow-xl text-shadow"
      >
        Find Voice Leadings with Clarity and Ease.
      </m.h2>
      <m.div
        className="w-full flex flex-wrap justify-center px-2 gap-16 max-sm:gap-8 *:animate-in *:fade-in"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ delay: 0.5, delayChildren: 0.5, staggerChildren: 0.1 }}
      >
        <Link to="/demo/bach">
          <Article>
            <ArticleImage src={Screenshot} />
            <ArticleCaption
              title="Design Musical Architectures"
              subtitle="Model the Geometry of Chords and Scales"
            />
          </Article>
        </Link>

        <Link to="/demo/bach_sin">
          <Article>
            <ArticleImage src={Easy} objectPosition="object-bottom-left" />
            <ArticleCaption
              title="Apply Mathematical Transformations"
              subtitle="Develop Notes Across Infinite Dimensions"
            />
          </Article>
        </Link>

        <Link to="/demo/barry_game">
          <Article>
            <ArticleImage src={Hotkeys} objectPosition="object-bottom-left" />
            <ArticleCaption
              title="Perform Keyboard Gestures"
              subtitle="Compose Quickly with Accessible Shortcuts"
            />
          </Article>
        </Link>
        <Link to="/demo/waterfall">
          <Article>
            <ArticleImage src={Composition} />
            <ArticleCaption
              title="Write Sequences Effortlessly"
              subtitle="Rapidly Develop Your Musical Ideas"
            />
          </Article>
        </Link>
        <Link to="/demo/carousels">
          <Article>
            <ArticleImage
              src={Nest}
              objectPosition="object-bottom-left"
              minHeight="min-h-76"
            />
            <ArticleCaption
              title="Create Elaborate Structures"
              subtitle="Unravel the Layers of Harmonic Space"
            />
          </Article>
        </Link>
        <Link to="/demo/bach_sin">
          <Article>
            <ArticleImage src={Math} minHeight="min-h-76" />
            <ArticleCaption
              title="Design Custom Functions"
              subtitle="Write Mathematical Formulas with JavaScript"
            />
          </Article>
        </Link>
        <Article>
          <ArticleImage src={Portals} minHeight="min-h-72" />
          <ArticleCaption
            title="Discover Easter Eggs"
            subtitle="Have Fun With Whimsical Features"
          />
        </Article>
        <Article>
          <ArticleImage src={Performance} minHeight="min-h-72" />
          <ArticleCaption
            title="Make Cool Music"
            subtitle="Build Instruments with Web Audio"
          />
        </Article>
      </m.div>
    </LandingSection>
  );
};

function Article(props: PropsWithChildren<{ className?: string }>) {
  return (
    <m.article
      {...props}
      variants={variants}
      transition={{ type: "spring" }}
      viewport={{ once: true }}
      className={classNames(
        props.className,
        "flex flex-col rounded-md overflow-hidden cursor-pointer hover:saturate-125 group border-2 border-blue-500"
      )}
    >
      {props.children}
    </m.article>
  );
}

function ArticleImage({
  src,
  minHeight = "min-h-64",
  objectPosition = "object-top-left",
}: {
  src: string;
  minHeight?: string;
  objectPosition?: string;
}) {
  return (
    <m.img
      src={src}
      alt="Screenshot of Harmonia"
      initial="hidden"
      whileInView="show"
      variants={variants}
      transition={{ type: "spring" }}
      viewport={{ once: true }}
      className={classNames(
        minHeight,
        objectPosition,
        "shadow-2xl w-xl object-cover p-4 bg-slate-950/90"
      )}
    />
  );
}

function ArticleCaption(props: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
      <h3>{props.title}</h3>
      <h4 className="max-sm:text-base text-lg text-slate-400">
        {props.subtitle}
      </h4>
    </div>
  );
}
