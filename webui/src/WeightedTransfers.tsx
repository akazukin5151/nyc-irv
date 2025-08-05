import { useEffect, useState } from "react";
import { Chord } from "./Chord";
import { ExternalLink } from "./ExternalLink";
import { Explainer } from "./Explainer";
import { CANDIDATE_COLORS, radioStyle } from "./core";

const metrics = [
  {
    name: "Borda",
    dataIdx: 1,
    description: (
      <>
        Weights use the{" "}
        <ExternalLink href="https://en.wikipedia.org/wiki/Arithmetic_progression">
          arithmetic sequence
        </ExternalLink>
      </>
    ),
    weights: ["4", "3", "2", "1"],
  },
  {
    name: "Harmonic",
    dataIdx: 2,
    description: (
      <>
        <ExternalLink href="https://en.wikipedia.org/wiki/Positional_voting#Dowdall">
          Dowdall's method in Nauru
        </ExternalLink>
      </>
    ),
    weights: ["⅟", "½", "⅓", "¼"],
  },
  {
    name: "Geometric",
    dataIdx: 3,
    description: <>Weights are halved every transfer</>,
    weights: ["⅟", "½", "¼", "⅛"],
  },
  {
    name: "Inverse square",
    dataIdx: 4,
    description: (
      <>
        Weights are reduced by inverse square (analogous to{" "}
        <ExternalLink href="https://en.wikipedia.org/wiki/Inverse-square_law">
          distance decay in 3D
        </ExternalLink>
        )
      </>
    ),
    weights: [
      <>
        1<sup>-2</sup>
      </>,
      <>
        2<sup>-2</sup>
      </>,
      <>
        3<sup>-2</sup>
      </>,
      <>
        4<sup>-2</sup>
      </>,
    ],
  },
  {
    name: "First transfer",
    dataIdx: 0,
    description: <>Only the first transfer is counted</>,
    weights: ["1", "0", "0", "0"],
  },
] as const;

type MetricName = (typeof metrics)[number]["name"];

type WeightedTransfersProps = {
  cands: Array<string>;
};

export function WeightedTransfers({ cands }: WeightedTransfersProps) {
  const [allChordData, setAllChordData] = useState<Array<Array<Array<number>>>>(
    [],
  );

  useEffect(() => {
    fetch("matrices.json")
      .then((x) => x.json())
      .then((matrices) => setAllChordData(matrices));
  }, []);

  const [metricName, setMetricName] = useState<MetricName>("First transfer");

  return (
    <div className="rounded-md bg-white shadow-md">
      <h2 className="ml-4 pt-2">Weighted preferences</h2>

      <div className="flex items-center max-lg:flex-wrap">
        <div className="mx-4 flex flex-col gap-2">
          <ul>
            <li>
              <Explainer>
                The chord shows all preferences flows (except when{" "}
                <span className="italic">First transfer</span> is selected).
              </Explainer>
            </li>
            <li>
              <Explainer>
                The first transfer from the first choice to the second choice is
                weighted the highest. Later preferences are weighted less.
              </Explainer>
            </li>
            <li>
              <Explainer>Choose how to weight the later preferences:</Explainer>
            </li>
          </ul>

          <table className="text-left text-sm text-neutral-500">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th>
                  <abbr title="1st choice to 2nd choice">1 → 2</abbr>
                </th>
                <th>
                  <abbr title="2nd choice to 3rd choice">2 → 3</abbr>
                </th>
                <th>
                  <abbr title="3rd choice to 4th choice">3 → 4</abbr>
                </th>
                <th>
                  <abbr title="4th choice to 5th choice">4 → 5</abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(({ name, weights }) => (
                <tr
                  className="transition-all hover:bg-sky-100"
                  key={name}
                  onClick={() => setMetricName(name)}
                >
                  <td className="pt-1 pl-1">
                    <input
                      key={name}
                      type="radio"
                      id={name}
                      name="weighting-metric"
                      className={radioStyle}
                      checked={metricName === name}
                      onChange={() => setMetricName(name)}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <label key={name} htmlFor={name}>
                      {name}
                    </label>
                  </td>
                  {weights.map((weight, idx) => (
                    <td key={`${name}-weight-${idx}`}>{weight}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="text-neutral-300" />

          <table>
            <tbody>
              {metrics.map(({ name, description }) => (
                <tr key={name}>
                  <th className="pr-3 text-left whitespace-nowrap" scope="row">
                    <Explainer>{name}</Explainer>
                  </th>
                  <td>
                    <Explainer>{description}</Explainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="text-neutral-300 lg:hidden" />
        </div>

        <div className="mx-auto flex justify-center max-lg:mt-5">
          {cands.length > 0 && allChordData.length > 0 && (
            <Chord
              matrix={
                allChordData[
                  metrics.find((m) => m.name === metricName)?.dataIdx ?? 0
                ]
              }
              colors={Object.values(CANDIDATE_COLORS)}
              names={[...cands, "Exhausted"]}
            />
          )}
        </div>
      </div>

      <p className="relative right-0 bottom-0 my-2 pr-3 text-right">
        <Explainer>
          Each ribbon shows both the incoming and outgoing flow. The width of
          start arc is the outgoing flow.
        </Explainer>
      </p>
    </div>
  );
}
