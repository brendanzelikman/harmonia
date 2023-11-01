import classNames from "classnames";

export const EditorList: React.FC<React.HTMLProps<HTMLUListElement>> = (
  props
) => {
  return (
    <ul
      {...props}
      className={classNames(
        props.className,
        `w-full flex-auto min-h-[10rem] flex flex-col text-gray-300 overflow-auto`
      )}
    >
      {props.children}
    </ul>
  );
};

export interface ListItemProps extends React.HTMLProps<HTMLLIElement> {
  active?: boolean;
  activeClass?: string;
}
export const EditorListItem: React.FC<ListItemProps> = (props) => {
  const { active, activeClass, ...itemProps } = props;
  return (
    <li
      {...itemProps}
      className={classNames(
        itemProps.className,
        "mx-2 p-2 font-light cursor-pointer",
        { [activeClass ?? ""]: active }
      )}
    >
      {itemProps.children}
    </li>
  );
};
