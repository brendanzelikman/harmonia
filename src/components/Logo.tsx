interface LogoProps {
  height?: string;
  width?: string;
  onClick?: () => void;
}

export default function Logo(props: LogoProps) {
  return (
    <img
      src="/logo.svg"
      onClick={props.onClick}
      style={{ height: props.height, width: props.width }}
    />
  );
}

export function Background() {
  return (
    <div className="w-screen h-screen fixed bg-gradient-to-t from-[#083a8a] via-[#2c6387] to-[#514f7e] -z-10"></div>
  );
}

export function Splash() {
  return (
    <div className="flex flex-col py-24 -mt-16 items-center">
      <img
        src="/logo.svg"
        className="lg:w-60 lg:h-60 md:w-48 md:h-48 w-36 h-36 mb-8 rounded-full shadow-xl shadow-slate-800/40 drop-shadow-2xl"
      />
      <h1 className="font-semibold text-slate-50 lg:text-8xl md:text-7xl sm:text-6xl text-5xl">
        Harmonia
      </h1>
      <h2 className="lg:my-1 text-slate-400 font-nunito lg:text-3xl md:text-2xl sm:text-lg text-sm">
        Pattern-Based Music Making.
      </h2>
      <h2 className="text-slate-400 font-nunito lg:text-3xl md:text-2xl sm:text-lg text-sm">
        Available for Everyone.
      </h2>
    </div>
  );
}
