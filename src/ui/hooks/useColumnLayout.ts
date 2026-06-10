import { useEffect, useRef, useState } from "react";

interface ColumnLayoutOptions {
  itemHeight?: number;
  bottomOffset?: number;
  minWidth?: number;
}

export function useColumnLayout(options: ColumnLayoutOptions = {}) {
  const { itemHeight = 80, bottomOffset = 120, minWidth = 768 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    function calculate() {
      if (!ref.current) return;
      if (window.innerWidth < minWidth) {
        setRows(0);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const available = window.innerHeight - rect.top - bottomOffset;
      const count = Math.max(1, Math.floor(available / itemHeight));
      setRows(count);
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [itemHeight, bottomOffset, minWidth]);

  const style: React.CSSProperties | undefined =
    rows > 1
      ? {
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(${rows}, auto)`,
        }
      : undefined;

  return { gridRef: ref, style };
}
