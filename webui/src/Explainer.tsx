import type { JSX } from "solid-js/jsx-runtime";

type ExplainerProps = {
  className?: string;
  children?: JSX.Element;
};

export function Explainer(props: ExplainerProps) {
  return (
    <span
      class={
        `text-sm text-neutral-500 dark:text-neutral-200 `
        + (props.className ?? "")
      }
    >
      {props.children}
    </span>
  );
}
