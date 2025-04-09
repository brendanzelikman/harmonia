import classNames from "classnames";

export const LandingSection = (props: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={classNames(
      props.className,
      "relative total-center-col w-full min-h-screen py-5 shrink-0"
    )}
  >
    {props.children ?? null}
  </div>
);
