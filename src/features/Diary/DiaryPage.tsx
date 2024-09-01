import LandingBackground from "assets/images/landing-background.png";
import classNames from "classnames";
import { FlipBookPageProps, FlipBookPage } from "lib/react-pageflip";
import { forwardRef } from "react";

const bookRing = "ring-8 ring-indigo-700 rounded";

export const DiaryPageBinding = () => {
  return (
    <div className={classNames("absolute inset-0 size-full", bookRing)}>
      <div className="relative size-full overflow-hidden">
        <img
          src={LandingBackground}
          className={classNames(
            "absolute inset-0 object-cover size-full animate-[animateLandingBackground_120s_ease-in-out_infinite]"
          )}
          draggable={false}
        />
      </div>
    </div>
  );
};

export const DiaryPage = forwardRef<HTMLDivElement, FlipBookPageProps>(
  (props, ref) => {
    return (
      <FlipBookPage
        ref={ref}
        className={classNames(
          bookRing,
          "relative size-full flex flex-col text-slate-950"
        )}
      >
        <img
          src={LandingBackground}
          className={classNames(
            "absolute m-0 inset-0 h-full object-cover -z-20 pointer-events-none",
            (props.index ?? 1) % 2 === 1 ? "rotate-180" : ""
          )}
          draggable={false}
        />
        {props.children}
      </FlipBookPage>
    );
  }
);

export const DiaryCoverPage = forwardRef<HTMLDivElement, FlipBookPageProps>(
  (props, ref) => {
    return (
      <FlipBookPage
        ref={ref}
        className={classNames(
          props.className,
          bookRing,
          "relative flex flex-col text-slate-950"
        )}
      >
        <div className="absolute inset-0 m-0 size-full -z-10" />
        <img
          src={LandingBackground}
          className="absolute inset-0 m-0 size-full object-cover -z-20 pointer-events-none"
        />
        {props.children}
      </FlipBookPage>
    );
  }
);
