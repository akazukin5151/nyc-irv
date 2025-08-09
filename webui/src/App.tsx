import { useEffect, useState } from "react";
import { LaterChoices } from "./LaterChoices";
import { RankDistributions } from "./RankDistributions";
import { WeightedTransfers } from "./WeightedTransfers";
import { ExternalLink } from "./ExternalLink";
import { Icicle } from "./Icicle";
import { PairwiseWins } from "./PairwiseWins";
import { PairwiseMatrix } from "./PairwiseMatrix";
import { Matchups } from "./Matchups";
import type { Matchup } from "./core";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
  const [matchups, setMatchups] = useState<Array<Matchup>>([]);

  useEffect(() => {
    fetch("matchups.json")
      .then((x) => x.json())
      .then((matchups: Array<Matchup>) => {
        setMatchups(matchups);
      });
  }, []);

  useEffect(() => {
    fetch("sorted_cands.tsv")
      .then((x) => x.text())
      .then((cands_csv) => {
        const cands = cands_csv.split("\t").filter((cand) => cand !== "");
        setCands(cands);
      });
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-neutral-100 p-6 pt-0">
      <h1 className="mb-3 pt-6">
        2025 New York City Democratic mayoral primary analysis
      </h1>
      <p className="mb-3">
        This page is focused on interactive graphics. See{" "}
        <ExternalLink href="https://fairvote.org/new-york-city-cast-vote-record-initial-analysis/">
          https://fairvote.org/new-york-city-cast-vote-record-initial-analysis/
        </ExternalLink>{" "}
        for some text commentary.
      </p>

      <PairwiseWins />

      <div style={{ height: "8%" }}></div>

      <PairwiseMatrix cands={cands} matchups={matchups} />

      <div style={{ height: "8%" }}></div>

      <Matchups matchups={matchups} />

      <div style={{ height: "8%" }}></div>

      <Icicle />

      <div style={{ height: "8%" }}></div>

      <RankDistributions cands={cands} />

      <div style={{ height: "8%" }}></div>

      <WeightedTransfers cands={cands} />

      <div style={{ height: "8%" }}></div>

      <LaterChoices cands={cands} />

      <div style={{ height: "8%" }}></div>

      <footer>
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
