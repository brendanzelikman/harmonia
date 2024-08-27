import Background from "assets/images/landing-background.png";

// The timeline placeholder for performance mode

export function TimelinePlaceholder() {
  return (
    <div
      className="flex flex-col relative size-full total-center animate-in fade-in duration-7 opacity-50"
      style={{ backgroundImage: `url(${Background})` }}
    />
  );
}
