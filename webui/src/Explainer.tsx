import type { ReactNode } from "react";

type ExplainerProps = {
  className?: string;
  children?: ReactNode;
};

export function Explainer({ children, className }: ExplainerProps) {
  return (
    <span
      className={
        `text-sm text-neutral-500 dark:text-neutral-200 ` + (className ?? "")
      }
    >
      {children}
    </span>
  );
}
