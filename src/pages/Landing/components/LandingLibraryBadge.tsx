import { MotionProps, m } from "framer-motion";

interface LibraryBadgeProps extends MotionProps {
  index: number;
}

const LibraryBadge = ({ index, ...rest }: LibraryBadgeProps) => (
  <m.div
    {...rest}
    className="h-48 basis-1/4 w-full flex flex-col justify-center items-center text-white text-xl"
    initial={{ opacity: 0, translateY: 50 }}
    whileInView={{ opacity: 1, translateY: 0 }}
    transition={{ delay: index * 0.1 }}
  />
);

const LibraryLink = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a {...props} className="h-full" target="_blank" />
);

interface LibraryImageProps extends React.HTMLProps<HTMLImageElement> {
  link?: string;
}

const LibraryImage = ({ link, ...rest }: LibraryImageProps) => {
  const img = (
    <img {...rest} className="max-w-28 h-full flex-1 object-contain" />
  );
  return link ? <LibraryLink href={link}>{img}</LibraryLink> : img;
};

const LibraryLabel = (props: { title: string; description: string }) => (
  <div className="text-center flex-shrink-0 mt-auto pt-4 select-none">
    <h3 className="text-2xl font-bold text-slate-100">{props.title}</h3>
    <p className="text-base text-slate-200">{props.description}</p>
  </div>
);

export type LandingLibraryBadgeProps = {
  title: string;
  description: string;
  image: string;
  link: string;
  index: number;
};

export const LandingLibraryBadge = (props: LandingLibraryBadgeProps) => (
  <LibraryBadge index={props.index}>
    <LibraryImage src={props.image} link={props.link} />
    <LibraryLabel title={props.title} description={props.description} />
  </LibraryBadge>
);
