interface LogoProps {
  className?: string;
  height?: string;
  width?: string;
  onClick?: () => void;
}

export default function Logo(props: LogoProps) {
  return (
    <img
      src="logo.svg"
      onClick={props.onClick}
      className={props.className}
      style={{ height: props.height, width: props.width }}
    />
  );
}

export function Background() {
  return (
    <div className="w-screen h-screen fixed bg-gradient-to-t from-[#083a8a] via-[#2c6387] to-[#514f7e] -z-10"></div>
  );
}

export function Splash(props: { title?: string; spinning?: boolean }) {
  return (
    <div className="flex flex-col py-24 -mt-16 items-center font-nunito">
      <img
        src="logo.svg"
        className={`sm:w-60 sm:h-60 w-36 h-36 mb-8 rounded-full shadow-xl shadow-slate-800/40 drop-shadow-2xl`}
      />
      <h1 className="font-semibold drop-shadow-xl text-slate-50 sm:text-8xl text-5xl">
        {props.title ?? "Harmonia"}
      </h1>
      <p className="my-1 text-slate-400 sm:text-3xl text-sm">
        Pattern-Based Music Making.
      </p>
      <p className="text-slate-400 sm:text-3xl text-sm">
        Available for Everyone.
      </p>
    </div>
  );
}
