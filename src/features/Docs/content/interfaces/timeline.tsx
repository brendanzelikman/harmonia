import { DocsLink, DocsParagraph } from "../../components";
import { DocsList } from "../../components/DocsList";
import { DocsSection } from "../../components/DocsSection";

export function TimelineDocsContent() {
  return (
    <>
      <DocsSection
        question="What is the Timeline?"
        answer={
          <>
            <DocsParagraph>
              The Timeline is a data grid component that renders a unique cell
              for every track/tick coordinate, with an overhead interface for
              storing additional information and metadata like:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Grid Dimensions",
                  description: "The subdivision and cell size.",
                  examples: [
                    `{ ... subdivision: 1/4, cell: { width: 30px, height: 30px } } }`,
                  ],
                },
                {
                  title: "Mouse Events",
                  description:
                    "Details about objects that are currently being selected.",
                  examples: [
                    `{ ... selection: { trackId: "scale_track_1", clipIds: [] } }`,
                  ],
                },
                {
                  title: "Media Creation",
                  description:
                    "Details about objects that are currently being drafted or copied.",
                  examples: [`{ ... draft: {...}, clipboard: {...} }`],
                },
              ]}
            />
            <DocsParagraph>
              The Timeline is essential for allowing us to visualize our
              arrangements and schedule events with a high degree of precision
              and clarity.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How does the Timeline render millions of cells?"
        answer={
          <>
            <DocsParagraph>
              The short answer is that it doesn't. The Timeline is "virtualized"
              (courtesy of{" "}
              <DocsLink type="reactDataGrid">react-data-grid</DocsLink>
              ), meaning that it will only render cells that are currently
              visible on the screen. This is a common technique that allows us
              to store as many cells as we want in memory without worrying about
              performance. The main drawback is that scrolling through the
              Timeline becomes an expensive operation, since it changes the
              boundaries of the viewport and forces the Timeline to re-render
              all of the cells that are now visible. However, this tradeoff is
              necessary in order to support large projects.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
