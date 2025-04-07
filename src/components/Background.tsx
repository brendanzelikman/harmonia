import LandingBackground from "assets/images/background.png";
import classNames from "classnames";

export const Background = (props: { className?: string }) => {
  return (
    <img
      src={LandingBackground}
      className={classNames(
        props.className,
        "fixed h-screen animate-background select-none object-cover opacity-50 -z-10"
      )}
    />
  );
};
