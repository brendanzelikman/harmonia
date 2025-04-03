import classNames from "classnames";
import { HTMLMotionProps, m } from "framer-motion";

interface LandingHeroImageProps extends HTMLMotionProps<"img"> {
  title?: string;
}

export const LandingHeroImage = (props: LandingHeroImageProps) => {
  const { title, ...rest } = props;
  return (
    <div className="max-w-3xl text-white flex h-full items-center">
      <m.img
        {...rest}
        loading="lazy"
        className={classNames(
          props.className,
          "border-8 border-gray-900/80 object-cover backdrop-blur shadow-[0_0_30px_0_black] rounded-lg"
        )}
      />
    </div>
  );
};
