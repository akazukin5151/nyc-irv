import type { TooltipItem } from "chart.js";
import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

export type TextAnchor = "start" | "middle" | "end";

export const radioStyle =
  "box-content h-1 w-1 appearance-none rounded-full border border-[5px] border-white bg-white bg-clip-padding ring-1 ring-gray-300 outline-none checked:border-blue-500 checked:border-blue-500 transition-all";

export const CANDIDATE_COLORS = {
  Mamdani: "#ffad00",
  Lander: "#e13c1a",
  Adams: "#4f3797",
  Cuomo: "#0d447c",
  Myrie: "#b2e061",
  Stringer: "#7eb0d5",
  Blake: "#b28b34",
  Ramos: "#f9b615",
  Tilson: "#0bbaeb",
  Bartholomew: "#c30eff",
  Prince: "#06cb13",
  Exhausted: "#888",
};

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
