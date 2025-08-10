import { Chord } from "./Chord";
import { ExternalLink } from "../ExternalLink";
import { Explainer } from "../Explainer";
import { CANDIDATE_COLORS, radioStyle } from "../core";
import { Frac } from "../math/Frac";
import { Pow } from "../math/Pow";
import {
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";

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
      <Frac numerator={1} denominator={1} />,
      <Frac numerator={1} denominator={2} />,
      <Frac numerator={1} denominator={3} />,
      <Frac numerator={1} denominator={4} />,
    ],
  },
  {
    name: "Geometric",
    dataIdx: 3,
    description: <>Weights are halved every transfer</>,
    weights: [
      <Frac numerator={1} denominator={1} />,
      <Frac numerator={1} denominator={2} />,
      <Frac numerator={1} denominator={4} />,
      <Frac numerator={1} denominator={8} />,
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
      <Pow base={1} power={-2} />,
      <Pow base={2} power={-2} />,
      <Pow base={3} power={-2} />,
      <Pow base={4} power={-2} />,
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

async function fetchWeightedMatrices(): Promise<Array<Array<Array<number>>>> {
  const x = await fetch("weighted_matrices.json");
  return x.json();
}

type WeightedTransfersProps = {
  cands: Array<string>;
};

export function WeightedTransfers(props: WeightedTransfersProps) {
  const [allChordData] = createResource<Array<Array<Array<number>>>>(
    fetchWeightedMatrices,
    {
      initialValue: [],
    },
  );

  const [metricName, setMetricName] =
    createSignal<MetricName>("First transfer");

  return (
    <section>
      <h2 class="ml-4 pt-2">Weighted preferences</h2>

      <div class="flex flex-col-reverse max-[72rem]:items-center min-[72rem]:flex-row">
        <div class="flex w-full max-w-[850px] flex-col items-center min-[850px]:max-[72rem]:flex-row">
          <div class="mx-auto flex w-[387px] flex-col">
            <ul class="[&_li]:my-3 [&_li]:leading-2">
              <li>
                <Explainer>
                  The chord shows all preferences flows (except when{" "}
                  <span class="italic">First transfer</span> is selected).
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

            <table class="w-full rounded-xl bg-white text-left text-sm whitespace-nowrap text-neutral-500 shadow-md dark:bg-neutral-800 dark:text-neutral-200 [&_td]:border-b-2 [&_td]:border-neutral-200/20 [&_td]:not-first:px-3 [&_th]:px-3">
              <thead>
                <tr class="[&_th]:pt-1 [&_th]:text-right">
                  <th />
                  <th />
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
                <For each={metrics}>
                  {({ name, weights }) => (
                    <tr
                      class="transition-all hover:bg-sky-100 dark:hover:bg-sky-700"
                      onClick={() => setMetricName(name)}
                    >
                      <td class="pt-1 pl-3">
                        <input
                          type="radio"
                          id={name}
                          name="weighting-metric"
                          class={radioStyle}
                          checked={metricName() === name}
                          onChange={() => setMetricName(name)}
                        />
                      </td>
                      <td class="py-2">
                        <label for={name}>{name}</label>
                      </td>
                      <For each={weights}>
                        {(weight) => <td class="text-right">{weight}</td>}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          <dl class="mx-auto mt-5 w-[387px]">
            <For each={metrics}>
              {({ name, description }) => (
                <>
                  <dt class="font-bold whitespace-nowrap">
                    <Explainer>{name}</Explainer>
                  </dt>
                  <dd class="ml-4">
                    <Explainer>{description}</Explainer>
                  </dd>
                </>
              )}
            </For>
          </dl>
        </div>

        <div class="mx-auto h-fit rounded-xl bg-white shadow-md max-[72rem]:mt-5 max-[72rem]:mb-3 dark:bg-neutral-800">
          <div class="flex justify-center">
            <Show when={allChordData.loading}>Cands loading</Show>
            <Switch>
              <Match when={allChordData.error}>Cands error</Match>
              <Match
                when={props.cands.length > 0 && allChordData()?.length > 0}
              >
                <Chord
                  matrix={
                    allChordData()[
                      metrics.find((m) => m.name === metricName())?.dataIdx ?? 0
                    ]
                  }
                  colors={Object.values(CANDIDATE_COLORS)}
                  names={[...props.cands, "Exhausted"]}
                />
              </Match>
            </Switch>
          </div>

          <p class="relative right-0 bottom-0 my-2 pr-3 text-right">
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
