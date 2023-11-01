import classNames from "classnames";

export const EditorSidebar: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex min-w-[17rem] h-full flex-col rounded-xl overflow-hidden pr-2 pl-1`
      )}
    >
      {props.children}
    </div>
  );
};

export const EditorSidebarHeader: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex items-center p-3 text-lg font-bold`
      )}
    >
      {props.children}
    </div>
  );
};
