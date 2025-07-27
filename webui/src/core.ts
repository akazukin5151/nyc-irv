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
  cands: Array<string>,
  setLaterChoices: Setter<Array<Array<string>>>,
) {
  const res = await fetch(`later_choices/${idx}.bin`);
  const bytes = await res.bytes();

  const later_choices: Array<Array<string>> = [];
  let i = 0;
  while (i < bytes.length) {
    const this_voters_choices = [];
    const arr_length = bytes[i];
    i += 1;
    for (let _j = 0; _j < arr_length; _j++) {
      const cand_idx = bytes[i];
      const cand = cands[cand_idx];
      this_voters_choices.push(cand);
      // this will increment on the last item of the ballot as well,
      // pointing to the next ballot's `arr_length`. this is fine.
      // the for loop will end and the next iteration of the while loop
      // will read the new item into `arr_length`.
      i += 1;
    }

    later_choices.push(this_voters_choices);
  }

  setLaterChoices(later_choices);
}
