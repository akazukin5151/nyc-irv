import type { TooltipItem } from "chart.js";

export type Matchup = [string, string, number, number];

export type HoverInfo = {
  this_cand: string;
  other_cand: string;
  votes_for_this: number | null;
  votes_for_other: number | null;
};

export type Coordinate = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  ancestors: Array<string>;
  value: number;
};

export const radioStyle =
  "box-content h-1 w-1 appearance-none rounded-full border border-[5px] border-white bg-white bg-clip-padding ring-1 ring-gray-300 outline-none checked:border-sky-600 checked:border-sky-600 transition-all focus:ring-blue-600 focus:ring-2";

export const CANDIDATE_COLORS = {
  Mamdani: "#ffad00",
  Lander: "#e13c1a",
  Adams: "#4f3797",
  Cuomo: "#0d447c",
  Myrie: "#b2e061",
  Stringer: "#7eb0d5",
  Blake: "#b28b34",
  Ramos: "#ffaaff",
  Tilson: "#0bbaeb",
  Bartholomew: "#c30eff",
  Prince: "#06cb13",
  Exhausted: "#888",
};

export const IS_CAND_COLOR_DARK = {
  Mamdani: false,
  Lander: false,
  Adams: true,
  Cuomo: true,
  Myrie: false,
  Stringer: false,
  Blake: false,
  Ramos: false,
  Tilson: false,
  Bartholomew: false,
  Prince: false,
  Exhausted: true,
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

export async function handleCandidateSelectCore(
  idx: number,
): Promise<[Array<Array<number>>, Record<string, Record<string, number>>]> {
  const promises = [
    fetch(`later_choices/${idx}.json`).then(async (res) => {
      const json: Array<Array<number>> = await res.json();
      return json;
    }),

    fetch(`flows/${idx}.json`).then(async (res) => {
      const json: Record<string, Record<string, number>> = await res.json();
      return json;
    }),
  ] as const;

  return Promise.all(promises);
}

export function format(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
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

export function getCandColor(firstChoiceCand: string | null): string {
  if (firstChoiceCand == null) {
    return "none";
  }

  const lastName = firstChoiceCand.split(" ").pop();
  if (lastName == null || !(lastName in CANDIDATE_COLORS)) {
    return "none";
  }
  return CANDIDATE_COLORS[lastName as keyof typeof CANDIDATE_COLORS];
}

export function numToOrdinal(choice_num: number) {
  return choice_num === 1
    ? "st"
    : choice_num === 2
      ? "nd"
      : choice_num === 3
        ? "rd"
        : "th";
}
