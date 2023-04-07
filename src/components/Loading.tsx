import logo from "/logo.svg";

export function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-full h-full flex flex-col items-center justify-center rounded-lg bg-sky-800/50 backdrop-blur">
        <img src={logo} className="animate-spin w-1/2 h-1/2" alt="Loading" />
      </div>
    </div>
  );
}
