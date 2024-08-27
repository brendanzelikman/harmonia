import classNames from "classnames";

export const EditorContainer: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex flex-col w-full h-full text-white animate-in fade-in duration-300`
      )}
    >
      {props.children}
    </div>
  );
};
