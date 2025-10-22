import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";
import Thesis from "/media/thesis.mp4";
import Demo from "/media/demo.mp4";
import Lavos from "/media/lavos.png";
import { Link } from "react-router-dom";
import { PropsWithChildren } from "react";
import classNames from "classnames";
import { DEMOS_BY_KEY } from "lib/demos";

const variants = {
  hidden: { opacity: 0, translateY: 20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingVideo = () => {
  return (
    <main id="body" className="size-full overflow-scroll">
      <LandingSection className="animate-in fade-in duration-300 pt-nav pb-0">
        <div className="text-center text-5xl font-bold bg-radial from-slate-950/0 to-slate-950 border-b border-b-slate-700 py-10 select-none">
          Demo Gallery
        </div>
        <div className="flex flex-col gap-0 min-h-0 h-min *:py-16">
          <VideoSection
            title="Introductory"
            subtitle="These pieces have a few transpositions to get you started."
            bg="bg-radial from-slate-950 via-sky-700/50 to-slate-950"
          >
            <VideoCard
              title="Romanesca"
              description="A simple and popular descending pattern."
              image={DEMOS_BY_KEY["romanesca"].image}
              link="/demo/romanesca"
            />
            <VideoCard
              title="Sentence"
              description="A grammatical musical phrase in C major."
              image={DEMOS_BY_KEY["sentence"].image}
              link="/demo/sentence"
            />
            <VideoCard
              title="Sketch"
              description={"A quick sketch with a playful melody."}
              image={DEMOS_BY_KEY["sketch"].image}
              link="/demo/sketch"
            />
          </VideoSection>
          <VideoSection
            title="Classical"
            subtitle="These recreations of historical pieces reveal more complex uses of transposition."
            bg="bg-radial from-slate-950 via-emerald-700/50 to-slate-950"
          >
            <VideoCard
              title="Scherzo in Bb Major"
              description="A short scherzo inspired by Ludwig van Beethoven."
              image={DEMOS_BY_KEY["scherzo"].image}
              link="/demo/scherzo"
            />
            <VideoCard
              title="Sonata-Reminiscenza (Intro)"
              description="By Nikolai Medtner, recreated in Harmonia."
              image={DEMOS_BY_KEY["reminiscenza"].image}
              link="/demo/reminiscenza"
            />
            <VideoCard
              title="Prelude in C Major"
              description="By Johann Sebastian Bach, recreated in Harmonia."
              image={DEMOS_BY_KEY["prelude"].image}
              link="/demo/prelude"
            />
          </VideoSection>
          <VideoSection
            title="Jazz"
            subtitle="These improvisatory pieces showcase examples with multiple layers of logic."
            bg="bg-radial from-slate-950 via-amber-600/40 to-slate-950"
          >
            <VideoCard
              title="A Groove"
              description={DEMOS_BY_KEY["groove"].blurb}
              image={DEMOS_BY_KEY["groove"].image}
              link="/demo/groove"
            />
            <VideoCard
              title="Fly Me To Barry"
              description={DEMOS_BY_KEY["barry"].blurb}
              image={DEMOS_BY_KEY["barry"].image}
              link="/demo/barry"
            />
            <VideoCard
              title="Carousel"
              description={DEMOS_BY_KEY["carousel"].blurb}
              image={DEMOS_BY_KEY["carousel"].image}
              link="/demo/carousel"
            />
          </VideoSection>
          <VideoSection
            title="Electronic"
            bg="bg-radial from-slate-950 via-red-500/30 to-slate-950"
            subtitle="These longer-scale projects showcase diverse variations in texture and form."
          >
            <VideoCard
              title="Tidal Waves"
              description="A soothing electronic piece for piano and bass with calm, rippling arpeggios."
              image={DEMOS_BY_KEY["wave"].image}
              link="/demo/wave"
            />
            <VideoCard
              title="Scriabinism"
              description="An upbeat piano-based electronic piece inspired by a theme from Scriabin's Sonata No. 5."
              image={DEMOS_BY_KEY["scriabinism"].image}
              link="/demo/scriabinism"
            />
            <VideoCard
              title="Lavos"
              description="A hardcore techno beat that experiments with pitch-shifted drum loops."
              image={DEMOS_BY_KEY["lavos"].image}
              link="/demo/lavos"
            />
          </VideoSection>
          <VideoSection
            title="Mathematical"
            subtitle="These experimental pieces explore different possibilities for custom scripts."
            bg="bg-radial from-slate-950 via-rose-500/40 to-slate-950"
          >
            <VideoCard
              title="C Major In Sine"
              description="A basic script that modulates a C major chord through one period of a sine wave."
              image={DEMOS_BY_KEY["sine"].image}
              link="/demo/sine"
            />
            <VideoCard
              title="Prelude in C Tan Major"
              description="A piece that gradually transposes Bach's Prelude in C Major from +0 to +∞ using the tangent function."
              image={DEMOS_BY_KEY["bach_tan"].image}
              link="/demo/bach_tan"
            />
            <VideoCard
              title="Prelude in Cluster vs. Chord"
              description="A piece that uses dynamic probability functions to assign notes to clusters or chords."
              image={DEMOS_BY_KEY["bach_clusters"].image}
              link="/demo/bach_clusters"
            />
          </VideoSection>
          <VideoSection
            title="Rhythm Games"
            subtitle="These performance pieces let you transpose in real-time!"
            bg="bg-radial from-slate-950 via-pink-500/40 to-slate-950"
          >
            <VideoCard
              title="Fly Me to Barry (Game)"
              description="Perform the melody from Fly Me to Barry!"
              image={DEMOS_BY_KEY["barry"].image}
              link="/demo/barry_game"
            />
            <VideoCard
              title="Tidal Waves (Game)"
              description="Perform the chord progression from Tidal Waves!"
              image={DEMOS_BY_KEY["wave"].image}
              link="/demo/game_wave"
            />
            <VideoCard
              title="A Groove (Game)"
              description="Perform the groove from A Groove!"
              image={DEMOS_BY_KEY["groove"].image}
              link="/demo/game_groove"
            />
          </VideoSection>
        </div>
      </LandingSection>
    </main>
  );
};

function VideoCard({
  title,
  description,
  image,
  link,
}: {
  title: string;
  description: string;
  image?: string;
  link: string;
}) {
  return (
    <m.div
      className="flex flex-col hover:scale-105 transition-all"
      variants={variants}
      viewport={{ once: true }}
    >
      <Link className="flex-1 flex items-center" to={link}>
        <img
          className="max-sm:w-xs border border-slate-50/20 rounded"
          width="350"
          height="200"
          src={image ?? Lavos}
        />
      </Link>
      <div className="text-xl">{title}</div>
      <div className="text-slate-500 max-w-xs text-center -mt-3 text-sm">
        {description}
      </div>
    </m.div>
  );
}

function VideoSection(
  props: PropsWithChildren<{ title: string; subtitle?: string; bg?: string }>
) {
  return (
    <div
      className={classNames(
        props.bg,
        "total-center-col pt-8 gap-2 border-b border-b-slate-700 rounded"
      )}
    >
      <div className="w-full text-center font-light drop-shadow-lg text-3xl">
        {props.title}
      </div>
      {props.subtitle && (
        <div className="w-full text-center text-lg font-light text-gray-400 drop-shadow">
          {props.subtitle}
        </div>
      )}
      <m.div className="sm:p-6 flex justify-center flex-wrap max-sm:gap-6 gap-20 *:bg-slate-950 *:border-2 *:border-indigo-500 *:p-4 *:pt-2 *:px-4 *:rounded-lg *:flex *:flex-col *:items-center *:justify-between max-sm:*:text-lg *:text-3xl *:gap-4 *:font-light">
        {props.children}
      </m.div>
    </div>
  );
}
