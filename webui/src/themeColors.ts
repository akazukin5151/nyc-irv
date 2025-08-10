import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handler = (evt: MediaQueryListEvent) => {
      setIsDark(evt.matches);
    };
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", handler);

    setIsDark(mql.matches);

    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDark;
}

export function axisLabelColor(isDark: boolean) {
  if (isDark) {
    return "white";
  }
  return "#666";
}
