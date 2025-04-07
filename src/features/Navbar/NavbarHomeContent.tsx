import classNames from "classnames";
import { views } from "main";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useRoute } from "router";

export function NavbarHomeContent(props: { isLoadingPlayground: boolean }) {
  const view = useRoute();
  const { isLoadingPlayground } = props;

  // Render the link to the view
  const renderLink = useCallback(
    (v: string) => {
      const onPlayground = v === "playground";
      if (!onPlayground && isLoadingPlayground) return null;

      return (
        <Link
          to={`/${v}`}
          className={classNames(
            "font-semilight text-sky-400",
            { "text-slate-200": !onPlayground && view === v },
            { "text-slate-500": !onPlayground && view !== v }
          )}
        >
          {onPlayground && isLoadingPlayground ? "Opening Playground..." : v}
        </Link>
      );
    },
    [isLoadingPlayground, view]
  );

  // Render the links to the views
  const renderLinks = useCallback(
    (small?: boolean) => {
      const renderedViews = small ? views.slice(0, -1) : views;
      return renderedViews.map((v, i, arr) => {
        const shouldAddDivider = i < arr.length - 1 && !isLoadingPlayground;
        return (
          <div className="flex items-center capitalize" key={`link-${v}`}>
            {renderLink(v)}
            {shouldAddDivider && <span className="mx-4">|</span>}
          </div>
        );
      });
    },
    [isLoadingPlayground, renderLink]
  );

  /** The default navbar group containing projects, docs, etc. */
  return (
    <>
      <div
        className={"sm:hidden size-full flex text-slate-500 justify-end pr-2"}
      >
        {renderLinks(true)}
      </div>
      <div
        className={
          "max-sm:hidden size-full flex text-slate-500 justify-end pr-2"
        }
      >
        {renderLinks(false)}
      </div>
    </>
  );
}
