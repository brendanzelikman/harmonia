import classNames from "classnames";

export const LandingSection = (props: {
  children?: React.ReactNode;
  id?: string;
  className?: string;
}) => (
  <section
    id={props.id}
    className={classNames(
      props.className,
      "relative w-full snap-center min-h-screen py-5 shrink-0"
    )}
  >
    {props.children ?? null}
  </section>
);
