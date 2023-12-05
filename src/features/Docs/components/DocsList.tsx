import classNames from "classnames";
import { ReactNode } from "react";

interface DocsListItem {
  title: ReactNode;
  description?: ReactNode;
  examples?: ReactNode[];
}

interface DocsListProps {
  items: DocsListItem[];
  className?: string;
  numerical?: boolean;
  start?: number;
  ie?: boolean;
  indent?: boolean;
}

export function DocsList(props: DocsListProps) {
  const { items, numerical, start, indent } = props;
  const listClass = classNames(
    "list-outside space-y-2",
    indent ? "ml-8" : "ml-4",
    numerical ? "list-decimal" : "list-disc"
  );

  const ListElement = numerical ? "ol" : "ul";

  return (
    <ListElement
      className={listClass}
      start={numerical && start ? start : undefined}
    >
      {items.map((item) => {
        return (
          <li className={classNames(props.className, "text-slate-400")}>
            <strong className="text-slate-300 font-semibold">
              {item.title}
            </strong>
            {`: `}
            {item.description ?? null}
            <br />
            {item.examples?.map((example) => {
              return (
                <span className="my-4 ml-4 px-2 bg-slate-900/50 rounded font-light text-slate-500">
                  {`${props.ie ? "i.e." : `e.g.`} ${example}`}
                  <br />
                </span>
              );
            })}
          </li>
        );
      })}
    </ListElement>
  );
}
