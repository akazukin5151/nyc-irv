import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

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
  setLaterChoices: Setter<Array<Array<number>>>,
) {
  const res = await fetch(`later_choices/${idx}.json`);
  const json: Array<Array<number>> = await res.json();
  setLaterChoices(json);
}
