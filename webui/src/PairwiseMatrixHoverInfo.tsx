import type { HoverInfo } from "./core";

type PairwiseMatrixHoverInfoProps = {
  hoverInfo: HoverInfo | null;
};

export function PairwiseMatrixHoverInfo({
  hoverInfo,
}: PairwiseMatrixHoverInfoProps) {
  if (
    hoverInfo == null
    || hoverInfo.votes_for_this == null
    || hoverInfo.votes_for_other == null
  ) {
    return (
      <div className="ml-4 h-[72px]">
        <p>Hover over a cell to view the matchup details</p>
      </div>
    );
  }

  const vthis = new Intl.NumberFormat("en-US").format(hoverInfo.votes_for_this);
  const vother = new Intl.NumberFormat("en-US").format(
    hoverInfo.votes_for_other,
  );

  const sum = hoverInfo.votes_for_this + hoverInfo.votes_for_other;
  const perc_for_this = (hoverInfo.votes_for_this / sum) * 100;
  const perc_for_other = (hoverInfo.votes_for_other / sum) * 100;

  const winner =
    hoverInfo.votes_for_this > hoverInfo.votes_for_other
      ? hoverInfo.this_cand
      : hoverInfo.other_cand;
  const winner_color =
    hoverInfo.votes_for_this > hoverInfo.votes_for_other
      ? "text-sky-500"
      : "text-amber-600";

  const vote_diff = Math.abs(
    hoverInfo.votes_for_this - hoverInfo.votes_for_other,
  );
  const vdiff = new Intl.NumberFormat("en-US").format(vote_diff);

  const perc_diff = Math.abs(perc_for_this - perc_for_other);

  return (
    <div className="ml-4 h-[72px]">
      <p>
        {vthis} voters ranked{" "}
        <span className="font-bold text-sky-500">{hoverInfo.this_cand}</span>{" "}
        over{" "}
        <span className="font-bold text-amber-600">{hoverInfo.other_cand}</span>{" "}
        ({perc_for_this.toFixed(2)}%)
      </p>
      <p>
        {vother} voters ranked{" "}
        <span className="font-bold text-amber-600">{hoverInfo.other_cand}</span>{" "}
        over{" "}
        <span className="font-bold text-sky-500">{hoverInfo.this_cand}</span> (
        {perc_for_other.toFixed(2)}%)
      </p>
      <p>
        <span className={`font-bold ${winner_color}`}>{winner}</span> wins the
        matchup by {vdiff} votes ({perc_diff.toFixed(2)}%)
      </p>
    </div>
  );
}
