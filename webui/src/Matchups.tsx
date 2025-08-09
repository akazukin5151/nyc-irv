import {
  CANDIDATE_COLORS,
  format,
  IS_CAND_COLOR_DARK,
  type Matchup,
} from "./core";

const TOTAL_BALLOTS = 1114433;

type MatchupsProps = {
  matchups: Array<Matchup>;
};

export function Matchups({ matchups }: MatchupsProps) {
  const rows = matchups.map(([cand1, cand2, v1, v2], idx) => {
    const sum = v1 + v2;
    const perc1 = (v1 / TOTAL_BALLOTS) * 100;
    const perc2 = (v2 / TOTAL_BALLOTS) * 100;
    const unranked_perc = (1 - sum / TOTAL_BALLOTS) * 100;

    const bar_start = 200;
    const bar_width = 400;
    const lwidth = (perc1 / 100) * bar_width;
    const rwidth = (perc2 / 100) * bar_width;
    const uwidth = (unranked_perc / 100) * bar_width;

    const perc1_f = perc1.toFixed(2) + "%";
    const perc2_f = perc2.toFixed(2) + "%";
    const percu_f = unranked_perc.toFixed(2) + "%";
    const v1_f = format(v1);
    const v2_f = format(v2);
    const vu_f = format(TOTAL_BALLOTS - sum);

    const last1 = cand1.split(" ").pop() as keyof typeof CANDIDATE_COLORS;
    const last2 = cand2.split(" ").pop() as keyof typeof CANDIDATE_COLORS;
    const color1 = CANDIDATE_COLORS[last1];
    const color2 = CANDIDATE_COLORS[last2];

    const text_color_1 = IS_CAND_COLOR_DARK[last1] ? "white" : "black";
    const text_color_2 = IS_CAND_COLOR_DARK[last2] ? "white" : "black";

    const next = matchups[idx + 1];
    const is_section_end = next != null && next[0] !== cand1;

    const tooltip1 = `${cand1}: ${v1_f} (${perc1_f})`;
    const tooltip2 = `${cand2}: ${v2_f} (${perc2_f})`;
    const tooltip_unranked = `Unranked: ${vu_f} (${percu_f})`;

    // smallest number that should be shown as label
    const number_cutoff = 14;

    return (
      <div key={cand1 + cand2} className={is_section_end ? "mb-4" : ""}>
        <svg height="30" width={400 + bar_width} className="mx-auto">
          <g className="[&_text]:text-sm">
            <line
              x1={bar_start - 5}
              y1="15"
              x2={bar_start}
              y2="15"
              strokeWidth="1"
              stroke="black"
            ></line>

            <rect
              x={bar_start}
              y="0"
              width={lwidth}
              height="30"
              fill={color1}
              stroke="white"
            >
              <title>{tooltip1}</title>
            </rect>
            <rect
              x={bar_start + lwidth}
              y="0"
              width={uwidth}
              height="30"
              fill={CANDIDATE_COLORS.Exhausted}
              stroke="white"
            >
              <title>{tooltip_unranked}</title>
            </rect>
            <rect
              x={bar_start + lwidth + uwidth}
              y="0"
              width={rwidth}
              height="30"
              fill={color2}
              stroke="white"
            >
              <title>{tooltip2}</title>
            </rect>

            <line
              x1={bar_start + lwidth + uwidth + rwidth}
              y1="15"
              x2={bar_start + lwidth + uwidth + rwidth + 5}
              y2="15"
              strokeWidth="1"
              stroke="black"
            ></line>

            <text x="190" y="20" textAnchor="end" className="text-sm">
              {cand1}
            </text>
            {perc1 > number_cutoff && (
              <text
                x={bar_start + lwidth - 5}
                y="20"
                fill={text_color_1}
                textAnchor="end"
              >
                {perc1_f}
              </text>
            )}
            {unranked_perc > number_cutoff && (
              <text
                x={bar_start + lwidth + uwidth / 2 + 5}
                y="20"
                fill="white"
                textAnchor="middle"
              >
                {percu_f}
              </text>
            )}
            {perc2 > number_cutoff && (
              <text
                x={bar_start + lwidth + uwidth + 5}
                y="20"
                textAnchor="start"
                fill={text_color_2}
              >
                {perc2_f}
              </text>
            )}
            <text
              x={bar_start + lwidth + uwidth + rwidth + 10}
              y="20"
              textAnchor="start"
              className="text-sm"
            >
              {cand2}
            </text>
          </g>
        </svg>
      </div>
    );
  });

  return (
    <section>
      <h2 className="ml-4 pt-2">Pairwise matchups</h2>

      <div className="flex flex-col items-center">
        <div className="mx-auto my-3 h-[70vh] max-w-full overflow-auto rounded-xl bg-white px-4 py-3 shadow-md">
          {rows}
        </div>
      </div>
    </section>
  );
}
