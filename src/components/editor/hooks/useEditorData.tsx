import { useEffect, useState } from "react";

export default function useEditorData<T>(data?: T) {
  const [prev, setPrev] = useState<T | null>(null);
  useEffect(() => {
    if (!data) return;
    setPrev(data);
  }, [data, prev]);

  return data || prev;
}
