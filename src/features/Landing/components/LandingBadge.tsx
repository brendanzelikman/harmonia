import classNames from "classnames";
import { m } from "framer-motion";

interface LibraryImageProps extends React.HTMLProps<HTMLImageElement> {
  link?: string;
}

const LibraryImage = ({ link, ...rest }: LibraryImageProps) => {
  const img = <img {...rest} className="size-24 object-contain" />;
  if (!link) return img;
  return <a href={link}>{img}</a>;
};

export type BadgeProps = {
  title: string;
  description: string;
  image: string;
  link: string;
  index: number;
  borderColor?: string;
};

export const Badge = (props: BadgeProps) => (
  <m.div
    className="h-64 basis-full md:basis-1/3 lg:basis-1/4 p-4 total-center-col text-white text-xl select-none"
    variants={{
      hidden: { opacity: 0, translateY: 50 },
      show: { opacity: 1, translateY: 0 },
    }}
  >
    <div
      className={classNames(
        props.borderColor ?? "border-sky-800",
        "h-full min-w-0 w-full max-w-64 total-center-col bg-slate-900 border-2 rounded-3xl shadow-lg shadow-slate-900/50"
      )}
    >
      <LibraryImage src={props.image} link={props.link} />
      <div className="mt-4 text-2xl font-bold text-slate-100">
        {props.title}
      </div>
      <div className="text-base text-slate-200">{props.description}</div>
    </div>
  </m.div>
);
