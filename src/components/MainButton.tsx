export const MainButton = (props: { onClick?: () => void }) => {
  return (
    <button
      onClick={props.onClick}
      className="border py-5 px-8 text-slate-100 bg-slate-800/20 hover:bg-sky-950/90 hover:shadow-[0px_0px_10px_5px_rgb(15,150,200)] transition-all duration-150 border-slate-500 rounded-xl backdrop-blur shadow-xl sm:text-4xl text-xl font-light"
    >
      Make Music Now!
    </button>
  );
};
