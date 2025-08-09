import { useEffect, useState } from "react";
import type { HoverInfo } from "./core";
import { PairwiseMatrixHoverInfo } from "./PairwiseMatrixHoverInfo";

type RawData = Array<[string, string, number]>;

type PairwiseMatrixProps = {
  cands: Array<string>;
};

export function PairwiseMatrix({ cands: cands_ }: PairwiseMatrixProps) {
  const [matrix, setMatrix] = useState<Map<string, Record<string, number>>>();
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const cands = cands_.map((cand) => cand.split(" ").pop() ?? "");

  useEffect(() => {
    fetch("matrix.json")
      .then((x) => x.json())
      .then((data: RawData) => {
        const newMatrix = new Map<string, Record<string, number>>();
        for (const [this_cand, other_cand, value] of data) {
          const row = newMatrix.get(this_cand);
          if (row == null) {
            newMatrix.set(this_cand, { [other_cand]: value });
          } else {
            row[other_cand] = value;
          }
        }
        setMatrix(newMatrix);
      });
  }, []);

  return (
    <section>
      <h2 className="ml-4 pt-2">Pairwise matrix</h2>

      <p className="ml-4">
        The numbers are the number of voters that ranked{" "}
        <span className="font-bold text-sky-500">row</span> over{" "}
        <span className="font-bold text-amber-600">column</span>
      </p>

      <PairwiseMatrixHoverInfo hoverInfo={hoverInfo} />

      <table
        className="mt-3 ml-4 rounded-xl bg-white pb-3 shadow-md [&_td]:px-3 [&_td]:py-1 [&_td]:text-right [&_td]:first:text-left [&_th]:px-3 [&_th]:py-1"
        onMouseMove={(evt) => {
          const elem = evt.target as HTMLElement;
          const value = elem.dataset.value;
          const this_cand = elem.dataset.row;
          const other_cand = elem.dataset.col;
          if (this_cand == null || other_cand == null || matrix == null) {
            setHoverInfo(null);
            return;
          }
          const record = matrix.get(other_cand)!;

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
        <thead className="border-b-2 border-slate-200/50 [&_th]:font-normal">
          <tr>
            <th className="border-r-2 border-slate-200/50"></th>
            {cands.length > 0
              && cands.map((cand) => (
                <th
                  key={cand}
                  className={
                    `text-amber-600 ` + getCellStyle(hoverInfo, "", cand)
                  }
                  data-col={cand}
                >
                  {cand}
                </th>
              ))}
          </tr>
        </thead>

        <tbody className="[&_tr]:hover:bg-slate-100">
          {matrix != null
            && matrix.size > 0
            && cands.map((this_cand) => {
              const cols = matrix.get(this_cand);
              if (cols == null) {
                return null;
              }
              return (
                <tr key={this_cand}>
                  <td className="border-r-2 border-slate-200/50 text-sky-500">
                    {this_cand}
                  </td>
                  {cands.map((other_cand) => {
                    const value = cols[other_cand];
                    const formatted = isNaN(value)
                      ? ""
                      : new Intl.NumberFormat("en-US").format(cols[other_cand]);
                    return (
                      <td
                        key={other_cand}
                        data-row={this_cand}
                        data-col={other_cand}
                        data-value={value}
                        className={getCellStyle(
                          hoverInfo,
                          this_cand,
                          other_cand,
                        )}
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
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
    return "bg-slate-100";
  }

  // same column
  if (hoverInfo.other_cand === other_cand) {
    return "bg-slate-100";
  }

  return "";
}
