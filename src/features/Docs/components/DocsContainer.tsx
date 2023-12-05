export const DocsContainer = (props: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full overflow-scroll">
      <div className="relative p-8 after:pb-1 flex flex-col gap-8 transition-all duration-300">
        {props.children}
      </div>
      <div className="max-w-[1%] w-16" />
    </div>
  );
};
