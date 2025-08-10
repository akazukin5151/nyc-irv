import { createEffect, createSignal, onCleanup } from "solid-js";

export function useTheme() {
  const [isDark, setIsDark] = createSignal(false);

  createEffect(() => {
    const handler = (evt: MediaQueryListEvent) => {
      setIsDark(evt.matches);
    };
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", handler);

    setIsDark(mql.matches);

    onCleanup(() => mql.removeEventListener("change", handler));
  });

  return isDark;
}

export function axisLabelColor(isDark: boolean) {
  if (isDark) {
    return "white";
  }
  return "#666";
}
