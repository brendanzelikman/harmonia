import { DEMOS } from "app/demos";
import { useFetch } from "hooks/useFetch";
import { useMemo } from "react";

export const useDemos = () => {
  const paths = DEMOS.map((demo) => demo.path);
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
