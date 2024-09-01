import classNames from "classnames";
import { TooltipButton } from "components/TooltipButton";
import { View, views } from "pages/MainPage";
import { useAuth } from "providers/auth";
import { useCallback } from "react";
import { Link } from "react-router-dom";

export function NavbarDefaultContent(props: {
  view: View;
  isLoadingPlayground: boolean;
}) {
  const { view, isLoadingPlayground } = props;
  const { isProdigy, isMaestro, isVirtuoso, isAtLeastRank, canPlay } =
    useAuth();

  // Render the link to the view
  const renderLink = useCallback(
    (v: View) => {
      const onPlayground = v === "playground";
      if (!onPlayground && isLoadingPlayground) return null;
      const onProdigy = onPlayground && isProdigy;
      const onMaestro = onPlayground && isMaestro;
      const onVirtuoso = onPlayground && isVirtuoso;
      const invalidPlayground = !canPlay && onPlayground;
      const linkClass = classNames(
        "font-semilight",
        { "text-prodigy/70 active:text-prodigy": onProdigy },
        { "text-maestro/70 active:text-maestro": onMaestro },
        { "text-virtuoso/70 active:text-virtuoso": onVirtuoso },
        { "text-slate-200": !onPlayground && view === v },
        { "text-slate-500": !onPlayground && view !== v }
      );
      if (invalidPlayground) {
        return (
          <TooltipButton
            className="px-2 rounded ring-slate-500"
            notClickable
            cursorClass={"cursor-not-allowed"}
            direction={"vertical"}
            label={
              <div className="animate-in fade-in p-2 w-48 text-xs text-white bg-slate-900/80 backdrop-blur rounded normal-case">
                You must be a{" "}
                <Link to="/profile" className="text-virtuoso">
                  Virtuoso
                </Link>{" "}
                user to use the Playground on Desktop.
              </div>
            }
          >
            Playground
          </TooltipButton>
        );
      }
      return (
        <Link to={`/${v}`} className={linkClass}>
          {onPlayground && isLoadingPlayground ? "Loading Playground..." : v}
        </Link>
      );
    },
    [isLoadingPlayground, isProdigy, isMaestro, isVirtuoso, view]
  );

  // Render the links to the views
  const renderLinks = useCallback(() => {
    const visibleViews = views.filter(
      (v) => isAtLeastRank("maestro") || v !== "projects"
    );
    const viewCount = visibleViews.length;
    return visibleViews.map((v, i) => {
      const shouldAddDivider = i < viewCount - 1 && !isLoadingPlayground;
      return (
        <div className="flex items-center capitalize" key={`link-${v}`}>
          {renderLink(v)}
          {shouldAddDivider && <span className="mx-4">|</span>}
        </div>
      );
    });
  }, [isLoadingPlayground, isAtLeastRank, renderLink]);

  /** The default navbar group containing projects, docs, etc. */
  return (
    <div className={"w-full flex h-full text-slate-500 justify-end pr-2"}>
      {renderLinks()}
    </div>
  );
}
