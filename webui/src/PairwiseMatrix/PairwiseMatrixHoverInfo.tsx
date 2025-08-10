import { Show } from "solid-js";
import type { HoverInfo } from "../core";

type PairwiseMatrixHoverInfoProps = {
  hoverInfo: HoverInfo | null;
};

export function PairwiseMatrixHoverInfo(props: PairwiseMatrixHoverInfoProps) {
  return (
    <Show
      when={
        !(
          props.hoverInfo == null
          || props.hoverInfo.votes_for_this == null
          || props.hoverInfo.votes_for_other == null
        )
      }
      fallback={
        <div class="ml-4 h-[72px] dark:text-white">
          <p>Hover over a cell to view the matchup details</p>
        </div>
      }
    >
      <PairwiseMatrixHoverInfoInner hoverInfo={props.hoverInfo!} />
    </Show>
  );
}

type PairwiseMatrixHoverInfoInnerProps = {
  hoverInfo: HoverInfo;
};

function PairwiseMatrixHoverInfoInner(
  props: PairwiseMatrixHoverInfoInnerProps,
) {
  const vthis = () =>
    new Intl.NumberFormat("en-US").format(props.hoverInfo.votes_for_this!);
  const vother = () =>
    new Intl.NumberFormat("en-US").format(props.hoverInfo.votes_for_other!);

  const sum = () =>
    props.hoverInfo.votes_for_this! + props.hoverInfo.votes_for_other!;
  const perc_for_this = () => (props.hoverInfo.votes_for_this! / sum()) * 100;
  const perc_for_other = () => (props.hoverInfo.votes_for_other! / sum()) * 100;

  const winner = () =>
    props.hoverInfo.votes_for_this! > props.hoverInfo.votes_for_other!
      ? props.hoverInfo.this_cand
      : props.hoverInfo.other_cand;
  const winner_color = () =>
    props.hoverInfo.votes_for_this! > props.hoverInfo.votes_for_other!
      ? "text-sky-500"
      : "text-amber-600";

  const vote_diff = () =>
    Math.abs(
      props.hoverInfo.votes_for_this! - props.hoverInfo.votes_for_other!,
    );
  const vdiff = () => new Intl.NumberFormat("en-US").format(vote_diff());

  const perc_diff = () => Math.abs(perc_for_this() - perc_for_other());

  return (
    <output class="ml-4 block h-[72px] dark:text-white">
      <p>
        {vthis()} voters ranked{" "}
        <span class="font-bold text-sky-500">{props.hoverInfo.this_cand}</span>{" "}
        over{" "}
        <span class="font-bold text-amber-600">
          {props.hoverInfo.other_cand}
        </span>{" "}
        ({perc_for_this().toFixed(2)}%)
      </p>
      <p>
        {vother()} voters ranked{" "}
        <span class="font-bold text-amber-600">
          {props.hoverInfo.other_cand}
        </span>{" "}
        over{" "}
        <span class="font-bold text-sky-500">{props.hoverInfo.this_cand}</span>{" "}
        ({perc_for_other().toFixed(2)}%)
      </p>
      <p>
        <span class={`font-bold ${winner_color()}`}>{winner()}</span> wins the
        matchup by {vdiff()} votes ({perc_diff().toFixed(2)}%)
      </p>
    </output>
  );
}
