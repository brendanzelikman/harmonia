import classNames from "classnames";

export const EditorSidebar: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex min-w-max whitespace-nowrap h-full flex-col rounded-xl overflow-hidden pl-1`
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
