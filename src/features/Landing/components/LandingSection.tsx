import classNames from "classnames";

export const LandingSection = (props: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <section
    className={classNames(
      props.className,
      "relative w-full snap-center min-h-screen py-5 shrink-0"
    )}
  >
    {props.children ?? null}
  </section>
);
