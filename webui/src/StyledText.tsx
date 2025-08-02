import type { ReactNode } from "react";
import type { Setter } from "./core";

type StyledTextProps = {
  idx: number;
  x: number;
  y: number;
  tooltipData: number | null;
  setTooltipData: Setter<number | null>;
  children?: ReactNode;
};

export function StyledText({
  idx,
  x,
  y,
  tooltipData,
  setTooltipData,
  children,
}: StyledTextProps) {
  return (
    <text
      x={x}
      y={y}
      className="drop-shadow-md drop-shadow-white transition-opacity hover:opacity-100"
      style={{ opacity: tooltipData === idx ? 1 : 0 }}
      stroke="white"
      strokeWidth={3}
      paintOrder="stroke"
      textAnchor="middle"
      onMouseOver={() => {
        setTooltipData(idx);
      }}
      onMouseLeave={() => {
        setTooltipData(null);
      }}
    >
      {children}
    </text>
  );
}
