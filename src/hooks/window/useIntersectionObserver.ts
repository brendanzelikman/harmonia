import { useState, useMemo, useEffect } from "react";

export const useIntersectionObserver = (element: Element | null) => {
  const [intersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => {
    return new IntersectionObserver((entries) => {
      setIntersecting(entries.some((e) => e.isIntersecting));
    });
  }, [element]);

  useEffect(() => {
    if (!element) return;
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return intersecting;
};
