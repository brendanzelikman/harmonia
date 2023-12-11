import LogoImage from "assets/images/logo.png";

interface LogoProps {
  className?: string;
  height?: string;
  width?: string;
  onClick?: () => void;
}

export function Logo(props: LogoProps) {
  return (
    <img
      src={LogoImage}
      onClick={props.onClick}
      className={props.className}
      style={{ height: props.height, width: props.width }}
    />
  );
}

export function Splash(props: { title?: string; spinning?: boolean }) {
  return (
    <div className="flex flex-col py-24 -mt-16 items-center font-nunito">
      <img
        src={LogoImage}
        className={`sm:w-60 sm:h-60 w-36 h-36 mb-8 rounded-full shadow-xl shadow-slate-800/40 ${
          props.spinning ? "animate-spin" : ""
        }`}
      />
      <h1 className="font-semibold text-slate-50 sm:text-7xl text-5xl">
        {props.title ?? "Harmonia"}
      </h1>
      <p className="my-2 text-slate-400 sm:text-3xl text-sm">
        Explore Tonality Like Never Before.
      </p>
      <p className="text-slate-400 sm:text-3xl text-sm">
        Embrace the Future of Music.
      </p>
    </div>
  );
}
