import { useCallback, useEffect, useRef } from "react";

export default function useAnimationFrame(
  callback: () => void,
  interval: number = 1000,
  active: boolean = false
) {
  const animationRef = useRef<number>();
  const timeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (timeRef.current !== undefined) {
        const deltaTime = time - timeRef.current;
        if (deltaTime < interval) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        callback();
        timeRef.current = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    },
    [callback, interval]
  );

  useEffect(() => {
    if (active) {
      timeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current!);
    };
  }, [active, animate]);
}
