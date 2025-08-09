import { Fragment, useEffect, useState } from "react";
import { Chord } from "./Chord";
import { ExternalLink } from "./ExternalLink";
import { Explainer } from "./Explainer";
import { CANDIDATE_COLORS, radioStyle } from "./core";
import { Frac } from "./math/Frac";
import { Pow } from "./math/Pow";

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
        . Candidates with many 2<sup>nd</sup> and 3<sup>rd</sup> place votes are
        exaggerated.
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
    weights: [
      <Frac numerator={1} denominator={1} key="h-1/1" />,
      <Frac numerator={1} denominator={2} key="h-1/2" />,
      <Frac numerator={1} denominator={3} key="h-1/3" />,
      <Frac numerator={1} denominator={4} key="h-1/4" />,
    ],
  },
  {
    name: "Geometric",
    dataIdx: 3,
    description: <>Weights are halved every transfer</>,
    weights: [
      <Frac numerator={1} denominator={1} key="g-1/1" />,
      <Frac numerator={1} denominator={2} key="g-1/2" />,
      <Frac numerator={1} denominator={4} key="g-1/4" />,
      <Frac numerator={1} denominator={8} key="g-1/8" />,
    ],
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
      <Pow base={1} power={-2} key="i-1" />,
      <Pow base={2} power={-2} key="i-2" />,
      <Pow base={3} power={-2} key="i-3" />,
      <Pow base={4} power={-2} key="i-4" />,
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
    fetch("weighted_matrices.json")
      .then((x) => x.json())
      .then((matrices) => setAllChordData(matrices));
  }, []);

  const [metricName, setMetricName] = useState<MetricName>("First transfer");

  return (
    <section>
      <h2 className="ml-4 pt-2">Weighted preferences</h2>

      <div className="flex flex-col-reverse items-center min-[72rem]:flex-row">
        <div className="flex w-full max-w-[850px] flex-col items-center min-[850px]:max-[72rem]:flex-row">
          <div className="mx-auto flex w-[387px] flex-col">
            <ul className="[&_li]:my-3 [&_li]:leading-2">
              <li>
                <Explainer>
                  The chord shows all preferences flows (except when{" "}
                  <span className="italic">First transfer</span> is selected).
                </Explainer>
              </li>
              <li>
                <Explainer>
                  The first transfer from the first choice to the second choice
                  is weighted the highest. Later preferences are weighted less.
                </Explainer>
              </li>
              <li>
                <Explainer>
                  Choose how to weight the later preferences:
                </Explainer>
              </li>
            </ul>

            <table className="w-full rounded-xl bg-white text-left text-sm whitespace-nowrap text-neutral-500 shadow-md [&_td]:border-b-2 [&_td]:border-neutral-200/20 [&_td]:not-first:px-3 [&_th]:px-3">
              <thead>
                <tr className="[&_th]:pt-1 [&_th]:text-right">
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
                    <td className="pt-1 pl-3">
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
                    <td className="py-2">
                      <label key={name} htmlFor={name}>
                        {name}
                      </label>
                    </td>
                    {weights.map((weight, idx) => (
                      <td key={`${name}-weight-${idx}`} className="text-right">
                        {weight}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mx-auto mt-5 w-[387px]">
            {metrics.map(({ name, description }) => (
              <Fragment key={name}>
                <dt className="font-bold whitespace-nowrap">
                  <Explainer>{name}</Explainer>
                </dt>
                <dd className="ml-4">
                  <Explainer>{description}</Explainer>
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>

        <div className="mx-auto rounded-xl bg-white shadow-md max-[72rem]:mt-5 max-[72rem]:mb-3">
          <div className="flex justify-center">
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

          <p className="relative right-0 bottom-0 my-2 pr-3 text-right">
            <Explainer>
              Each ribbon shows both the incoming and outgoing flow. The width
              of start arc is the outgoing flow.
            </Explainer>
          </p>
        </div>
      </div>
    </section>
  );
}
