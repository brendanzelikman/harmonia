import classNames from "classnames";
import { useAuth } from "providers/auth";
import { IconType } from "react-icons";

interface ActionButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: IconType;
  text: string;
  children?: React.ReactNode;
  link?: string;
  disabled?: boolean;
}

export const UserActionButton = (props: ActionButtonProps) => {
  const { isVirtuoso } = useAuth();
  const buttonClass = classNames(
    `size-full flex flex-col gap-3 ring-2 font-bold total-center rounded-xl`,
    props.className
  );
  const icon = <props.icon className="size-12 flex total-center" />;
  return (
    <div
      className={classNames(
        "relative w-full min-w-36 h-36 p-4",
        isVirtuoso ? "basis-1/4" : "basis-1/3"
      )}
    >
      {props.children}
      {props.link ? (
        <a
          href={props.link}
          target="_blank"
          rel="noreferrer"
          className={buttonClass}
        >
          {icon}
          {props.text}
        </a>
      ) : (
        <button
          className={buttonClass}
          onClick={props.disabled ? undefined : props.onClick}
        >
          {icon}
          {props.text}
        </button>
      )}
    </div>
  );
};
