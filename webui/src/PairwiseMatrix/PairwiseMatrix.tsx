import { createSignal, For, Show } from "solid-js";
import type { HoverInfo, Matchup } from "../core";
import { PairwiseMatrixHoverInfo } from "./PairwiseMatrixHoverInfo";

type PairwiseMatrixProps = {
  cands: Array<string>;
  matchups: Array<Matchup>;
};

export function PairwiseMatrix(props: PairwiseMatrixProps) {
  const [hoverInfo, setHoverInfo] = createSignal<HoverInfo | null>(null);

  const cands = () => props.cands.map((cand) => lastName(cand));

  const matrix = () => {
    const m = new Map<string, Record<string, number>>();
    for (const [this_cand, other_cand, value] of props.matchups) {
      const row = m.get(lastName(this_cand));
      if (row == null) {
        m.set(lastName(this_cand), { [lastName(other_cand)]: value });
      } else {
        row[lastName(other_cand)] = value;
      }
    }
    return m;
  };

  return (
    <section>
      <h2 class="ml-4 pt-2">Pairwise matrix</h2>

      <p class="ml-4 dark:text-white">
        The numbers are the number of voters that ranked{" "}
        <span class="font-bold text-sky-500">row</span> over{" "}
        <span class="font-bold text-amber-600">column</span>
      </p>

      <PairwiseMatrixHoverInfo hoverInfo={hoverInfo()} />

      <div class="relative flex max-h-[calc(100vh-134px)] max-w-screen justify-center overflow-auto">
        <table
          class="mt-3 ml-4 rounded-xl bg-white pb-3 shadow-md dark:bg-neutral-800 [&_td]:px-3 [&_td]:py-1 [&_td]:text-right [&_td]:first:sticky [&_td]:first:left-0 [&_td]:first:z-2 [&_td]:first:bg-white [&_td]:first:text-left [&_td]:first:shadow-md [&_th]:px-3 [&_th]:py-1"
          onMouseMove={(evt) => {
            const elem = evt.target as HTMLElement;
            const value = elem.dataset.value;
            const this_cand = elem.dataset.row;
            const other_cand = elem.dataset.col;
            if (this_cand == null || other_cand == null) {
              setHoverInfo(null);
              return;
            }
            const record = matrix().get(other_cand)!;

            setHoverInfo({
              this_cand,
              other_cand,
              votes_for_this: value == null ? null : parseInt(value),
              votes_for_other: value == null ? null : record[this_cand],
            });
          }}
          onMouseLeave={() => {
            setHoverInfo(null);
          }}
        >
          <thead class="sticky top-0 z-3 border-b-2 border-slate-200/50 bg-white shadow-md [&_th]:font-normal">
            <tr>
              <th class="border-r-2 border-slate-200/50" />
              <Show when={cands().length > 0}>
                <For each={cands()}>
                  {(cand) => (
                    <th
                      class={
                        `text-amber-600 ` + getCellStyle(hoverInfo(), "", cand)
                      }
                      data-col={cand}
                    >
                      {cand}
                    </th>
                  )}
                </For>
              </Show>
            </tr>
          </thead>

          <tbody class="dark:[&_td]:not-first:text-white [&_tr]:hover:bg-slate-100 dark:[&_tr]:hover:bg-slate-500">
            <Show when={matrix().size > 0}>
              <For each={cands()}>
                {(this_cand) => {
                  const cols = matrix().get(this_cand);
                  if (cols == null) {
                    return null;
                  }
                  return (
                    <tr>
                      <td class="border-r-2 border-slate-200/50 text-sky-500">
                        {this_cand}
                      </td>
                      <For each={cands()}>
                        {(other_cand) => {
                          const value = cols[other_cand];
                          const formatted = isNaN(value)
                            ? ""
                            : new Intl.NumberFormat("en-US").format(
                                cols[other_cand],
                              );
                          return (
                            <td
                              data-row={this_cand}
                              data-col={other_cand}
                              data-value={value}
                              class={getCellStyle(
                                hoverInfo(),
                                this_cand,
                                other_cand,
                              )}
                            >
                              {formatted}
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  );
                }}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getCellStyle(
  hoverInfo: HoverInfo | null,
  this_cand: string,
  other_cand: string,
) {
  if (hoverInfo == null) {
    return "";
  }

  // opposing cells
  if (
    hoverInfo.other_cand === this_cand
    && hoverInfo.this_cand === other_cand
  ) {
    return "bg-slate-100 dark:bg-slate-500";
  }

  // same column
  if (hoverInfo.other_cand === other_cand) {
    return "bg-slate-100 dark:bg-slate-500";
  }

  return "";
}

function lastName(cand: string): string {
  return cand.split(" ").pop() ?? "";
}
