import { CANDIDATE_COLORS } from "./core";

export function PairwiseWins() {
  const Mamdani = (
    <span
      className="underline decoration-3"
      style={{ textDecorationColor: CANDIDATE_COLORS.Mamdani }}
    >
      Mamdani
    </span>
  );

  return (
    <>
      <section>
        <h2 className="ml-4 pt-2">Number of pairwise wins</h2>

        <div className="max-md2:flex-col md2:justify-between mx-auto flex max-w-[850px] items-center justify-center py-3">
          <table className="max-md2:mb-2 rounded-xl bg-white pb-3 whitespace-nowrap shadow-md [&_td]:border-b-2 [&_td]:border-neutral-200/20 [&_td]:px-3 [&_td]:py-1 [&_td]:nth-[2n]:text-right [&_th]:px-3 [&_th]:py-1 [&_tr]:hover:bg-slate-100/50">
            <thead
              className="border-b-2 border-slate-200/50 bg-slate-100 text-slate-500"
              style={{ fontVariant: "small-caps" }}
            >
              <tr>
                <th>candidate</th>
                <th>pairwise wins</th>
              </tr>
            </thead>
            <tbody className="[&_td]:first:underline [&_td]:first:decoration-3">
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Mamdani }}>
                  <b>Zohran Kwame Mamdani</b>
                </td>
                <td>
                  <b>10</b>
                </td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Lander }}>
                  Brad Lander
                </td>
                <td>9</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Adams }}>
                  Adrienne E. Adams
                </td>
                <td>8</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Cuomo }}>
                  Andrew M. Cuomo
                </td>
                <td>7</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Myrie }}>
                  Zellnor Myrie
                </td>
                <td>6</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Stringer }}>
                  Scott M. Stringer
                </td>
                <td>5</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Blake }}>
                  Michael Blake
                </td>
                <td>4</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Ramos }}>
                  Jessica Ramos
                </td>
                <td>3</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Tilson }}>
                  Whitney R. Tilson
                </td>
                <td>2</td>
              </tr>
              <tr>
                <td
                  style={{ textDecorationColor: CANDIDATE_COLORS.Bartholomew }}
                >
                  Selma K. Bartholomew
                </td>
                <td>1</td>
              </tr>
              <tr>
                <td style={{ textDecorationColor: CANDIDATE_COLORS.Prince }}>
                  Paperboy Love Prince
                </td>
                <td>0</td>
              </tr>
            </tbody>
          </table>

          <ul className="w-sm list-disc [&>li]:my-2">
            <li>There were 11 candidates for Mayor.</li>
            <li>Each candidate can have 10 other 1 v 1 matchups.</li>
            <li>
              {Mamdani} won all 10 of his matchups, so he is the{" "}
              <span className="underline decoration-green-600 decoration-3">
                Condorcet winner
              </span>
              .
            </li>
            <li>
              {Mamdani} was also the winner of this IRV (RCV) election, so in
              this case, IRV successfully elected the Condorcet winner.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
