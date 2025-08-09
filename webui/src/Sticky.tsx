import type { ReactNode } from "react";
import "./Sticky.css";

type StickyProps = {
  children?: ReactNode;
  className?: string;
};

export function Sticky({ children, className, ...props }: StickyProps) {
  return (
    <>
      <div
        className={
          `sticky-blurred-div sticky top-0 z-1 rounded-lg px-4 py-2 dark:text-white `
          + (className ?? "")
        }
        {...props}
      >
        {children}
      </div>
      <div className="shadow-under-blur" />
      <div className="relative">
        <div className="shadow-coverer" />
      </div>
    </>
  );
}
