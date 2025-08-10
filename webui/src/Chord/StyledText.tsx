import type { Setter } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

type StyledTextProps = {
  idx: number;
  x: number;
  y: number;
  tooltipData: number | null;
  setTooltipData: Setter<number | null>;
  children?: JSX.Element;
};

export function StyledText(props: StyledTextProps) {
  return (
    <text
      x={props.x}
      y={props.y}
      class="stroke-white drop-shadow-md drop-shadow-white transition-opacity hover:opacity-100 dark:stroke-none dark:drop-shadow-black"
      style={{ opacity: props.tooltipData === props.idx ? 1 : 0 }}
      stroke-width={3}
      paint-order="stroke"
      text-anchor="middle"
      onMouseOver={() => {
        props.setTooltipData(props.idx);
      }}
      onMouseLeave={() => {
        props.setTooltipData(null);
      }}
    >
      {props.children}
    </text>
  );
}
