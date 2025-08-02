import type { TooltipItem } from "chart.js";
import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

export type TextAnchor = "start" | "middle" | "end";

/**
 * for continuous variables
 */
// Esri color ramps - Pastel Dreams
export const SEQUENTIAL_COLORS_SOLID = [
  "#fd7f6fff",
  "#7eb0d5ff",
  "#b2e061ff",
  "#bd7ebeff",
  "#ffb55aff",
  "#ffee65ff",
];

// 0xb2 ~= 70% of 255
export const SEQUENTIAL_COLORS_TRANS = [
  "#fd7f6fb2",
  "#7eb0d5b2",
  "#b2e061b2",
  "#bd7ebeb2",
  "#ffb55ab2",
  "#ffee65b2",
];

export const GRAY = "rgba(201, 203, 207, 0.3)";

export function handleCandidateSelectCore(
  idx: number,
  setLaterChoices: Setter<Array<Array<number>>>,
  setFlowData: Setter<Record<string, Record<string, number>>>,
) {
  fetch(`later_choices/${idx}.json`).then(async (res) => {
    const json: Array<Array<number>> = await res.json();
    setLaterChoices(json);
  });

  fetch(`flows/${idx}.json`).then(async (res) => {
    const json = await res.json();
    setFlowData(json);
  });
}

export function percInFooter(context: Array<TooltipItem<"bar">>): string {
  const c = context[0];
  const n = c.dataset.data[c.dataIndex] as number;
  const sum_of_this_rank = (c.dataset.data.reduce(
    (a, b) => (a as number) + (b as number),
    0,
  ) ?? 0) as number;
  if (sum_of_this_rank === 0) {
    return ``;
  }
  const perc = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format((n / sum_of_this_rank) * 100);
  return `${perc}% of all ${c.dataset.label} votes`;
}
