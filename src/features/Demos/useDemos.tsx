import { useFetch } from "hooks/useFetch";
import { useMemo } from "react";

const DEMO_NAMES = [
  "demos/romanesca.json",
  "demos/prelude.json",
  "demos/moonlight.json",
  "demos/hammer.json",
  "demos/waves.json",
];

export const DEMO_BLURBS: Record<string, string> = {
  "demos/romanesca.json": `"A descending pattern in Renaissance music."`,
  "demos/prelude.json": `"A short piece of music in the classical style."`,
  "demos/moonlight.json": `"A few bars from the Moonlight Sonata"`,
  "demos/hammer.json": `"A progression from the Hammerklavier Sonata"`,
  "demos/waves.json": `"An arpeggio and bassline in motion."`,
};

export const useDemos = () => {
  const paths = DEMO_NAMES;
  const { data, loading } = useFetch(() =>
    Promise.all(
      paths.map((p) =>
        fetch(p)
          .then((res) => res.json())
          .then((p) => ({ past: [], future: [], present: p }))
      )
    )
  );
  const projects = useMemo(() => {
    if (loading) return [];
    if (!data) return [];
    return data;
  }, [loading, data]);

  return { projects, paths };
};
