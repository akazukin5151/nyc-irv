import type { ReactNode } from "react";
import "./Sticky.css";

type StickyProps = {
  height: number;
  children?: ReactNode;
  className?: string;
};

export function Sticky({ height, children, className, ...props }: StickyProps) {
  return (
    <>
      <div
        className={
          `sticky-blurred-div sticky top-0 z-1 rounded-lg px-1 py-2 `
          + (className ?? "")
        }
        style={{ height }}
        {...props}
      >
        {children}
      </div>
      <div className="shadow-under-blur" style={{ top: `${height}px` }} />
      <div className="relative">
        <div className="shadow-coverer" />
      </div>
    </>
  );
}
