import { createResource, Match, Show, Switch } from "solid-js";
import { LaterChoices } from "./LaterChoices/LaterChoices";
import { RankDistributions } from "./RankDistributions";
import { WeightedTransfers } from "./Chord/WeightedTransfers";
import { ExternalLink } from "./ExternalLink";
import { Icicle } from "./Icicle/Icicle";
import { PairwiseWins } from "./PairwiseWins";
import { PairwiseMatrix } from "./PairwiseMatrix/PairwiseMatrix";
import { Matchups } from "./Matchups";
import type { Matchup } from "./core";

async function fetchCandsFirstPrefs(): Promise<[Array<string>, Array<number>]> {
  const sorted_cands = await fetch("sorted_cands.json");
  const json: Array<[string, number]> = await sorted_cands.json();
  return [json.map((x) => x[0]), json.map((x) => x[1])];
}

async function fetchMatchups(): Promise<Array<Matchup>> {
  const x = await fetch("matchups.json");
  return x.json();
}

function App() {
  const [candsFirstPrefs] = createResource(fetchCandsFirstPrefs);
  const [matchups] = createResource(fetchMatchups);

  return (
    <div class="h-screen overflow-y-auto bg-neutral-100 p-6 pt-0 dark:bg-neutral-700 dark:[&_h2]:text-neutral-100">
      <h1 class="mb-3 pt-6 dark:text-neutral-100">
        2025 New York City Democratic mayoral primary analysis
      </h1>
      <p class="dark:text-white">
        The CVR data is from{" "}
        <ExternalLink href="https://www.vote.nyc/page/election-results-summary">
          https://www.vote.nyc/page/election-results-summary
        </ExternalLink>
      </p>
      <p class="mb-3 dark:text-white">
        This page is focused on interactive graphics. See{" "}
        <ExternalLink href="https://fairvote.org/new-york-city-cast-vote-record-initial-analysis/">
          https://fairvote.org/new-york-city-cast-vote-record-initial-analysis/
        </ExternalLink>{" "}
        for some text commentary.
      </p>

      <div class="ml-4 flex flex-col items-center pt-2 pb-4">
        <h2>Caveats</h2>
        <ul class="ml-6 w-lg list-disc dark:text-white">
          <li>
            Some voters ranked the same candidate multiple times{" "}
            <span class="whitespace-nowrap">
              (e.g., A &gt; A &gt; A &gt; C)
            </span>
            . We ignore the duplicated ranks, so the example would turn into{" "}
            <span class="whitespace-nowrap">A &gt; C</span>.
          </li>
          <li>
            We pretend write-ins don't exist and skip to the next named
            candidate (they won't affect the result anyway).
          </li>
          <li>We ignore overvotes and undervotes.</li>
          <li>
            No ties happened in this election, so the code did not check for
            ties.
          </li>
        </ul>
      </div>

      <PairwiseWins />

      <div style={{ height: "8%" }} />

      <Show when={candsFirstPrefs.loading}>Cands loading</Show>
      <Switch>
        <Match when={candsFirstPrefs.error}>Cands error</Match>
        <Match when={candsFirstPrefs()}>
          <Show when={matchups.loading}>matchups loading</Show>
          <Switch>
            <Match when={matchups.error}>matchups error</Match>
            <Match when={matchups()}>
              <PairwiseMatrix
                cands={candsFirstPrefs()![0]}
                matchups={matchups()!}
              />

              <div style={{ height: "8%" }} />

              <Matchups matchups={matchups()!} />
            </Match>
          </Switch>
          <div style={{ height: "8%" }} />
        </Match>
      </Switch>

      <Icicle />

      <div style={{ height: "8%" }} />

      <Show when={candsFirstPrefs.loading}>Cands loading</Show>
      <Switch>
        <Match when={candsFirstPrefs.error}>Cands error</Match>
        <Match when={candsFirstPrefs()}>
          <RankDistributions cands={candsFirstPrefs()![0]} />

          <div style={{ height: "8%" }} />

          <WeightedTransfers cands={candsFirstPrefs()![0]} />

          <div style={{ height: "8%" }} />

          <LaterChoices candsFirstPrefs={candsFirstPrefs()!} />

          <div style={{ height: "8%" }} />
        </Match>
      </Switch>

      <footer class="dark:text-white">
        <ul>
          <li>
            Source code:{" "}
            <ExternalLink href="https://github.com/akazukin5151/nyc-irv">
              https://github.com/akazukin5151/nyc-irv
            </ExternalLink>
          </li>
          <li>License: AGPLv3 or later</li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
