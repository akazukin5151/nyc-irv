import { chord, ribbon } from "d3-chord";
import { arc } from "d3-shape";
import {
  bearing_to_anchor,
  bearing_to_coord,
  compute_chord_info,
} from "./angles";
import { StyledText } from "./StyledText";
import { createSignal, For } from "solid-js";

type RibbonPath = {
  ribbonPath: string | null;
  title: string;
  rotation: number;
  sourceColor: string;
  targetColor: string;
  source_value: number;
  target_value: number;
  coord1: readonly [number, number];
  coord2: readonly [number, number];
};

type ChordProps = {
  matrix: Array<Array<number>>;
  colors: Array<string>;
  names: Array<string>;
};

export function Chord(props: ChordProps) {
  const [tooltipData, setTooltipData] = createSignal<number | null>(null);

  const width = 700;
  const height = 500;
  const outerRadius = Math.min(width, height) * 0.4;
  const innerRadius = outerRadius - 20;

  const calcChords = chord()
    .padAngle(20 / innerRadius)
    .sortSubgroups(descending);
  const calcRibbon = ribbon().radius(innerRadius);
  const calcArc = arc().innerRadius(innerRadius).outerRadius(outerRadius);

  const chords = () => calcChords(props.matrix);

  const ribbonPaths: () => Array<RibbonPath> = () =>
    chords().map((chord) => {
      const source = { ...chord.source, radius: innerRadius };
      const target = { ...chord.target, radius: innerRadius };
      const ribbonPath = calcRibbon({ source, target }) as unknown as
        | string
        | null;

      const source_name = props.names[chord.source.index];
      const target_name = props.names[chord.target.index];
      const source_value = chord.source.value;
      const target_value = chord.target.value;
      const title = `${source_value} ${source_name} → ${target_name}\n${target_value} ${target_name} → ${source_name}`;

      const { degrees, coord1, coord2 } = compute_chord_info(
        chord.source,
        chord.target,
        innerRadius - 30,
      );

      return {
        ribbonPath,
        title,
        rotation: degrees,
        sourceColor: props.colors[chord.source.index],
        targetColor: props.colors[chord.target.index],
        source_value,
        target_value,
        coord1,
        coord2,
      };
    });

  const arcData = () => {
    const ad = chords().map((chord) => {
      const arc = calcArc({
        innerRadius,
        outerRadius,
        startAngle: chord.source.startAngle,
        endAngle: chord.source.endAngle,
      });
      const color = props.colors[chord.source.index];
      return { arc, color };
    });

    ad.push(
      ...chords().map((chord) => {
        const arc = calcArc({
          innerRadius,
          outerRadius,
          startAngle: chord.target.startAngle,
          endAngle: chord.target.endAngle,
        });
        const color = props.colors[chord.target.index];
        return { arc, color };
      }),
    );

    return ad;
  };

  const candidateLabels = () =>
    chords().groups.map((group) => {
      const name = props.names[group.index].split(" ").pop();
      if (name === "Bartholomew" || name === "Prince") {
        // exclude very minor candidates with no space for label
        return null;
      }

      const anchor = bearing_to_anchor(group.startAngle, group.endAngle);

      // for some reason, Exhausted doesn't need a vertical offset
      const radius =
        outerRadius + (anchor === "middle" && name !== "Exhausted" ? 20 : 10);

      const coord = bearing_to_coord(group.startAngle, group.endAngle, radius);

      return (
        <text x={coord[0]} y={-coord[1]} text-anchor={anchor}>
          {name}
        </text>
      );
    });

  const offset = 40;
  const zoomedWidth = width - offset;
  const zoomedHeight = height - offset;
  const offsetX = -zoomedWidth / 2;
  const offsetY = -zoomedHeight / 2;
  const viewBox = `${offsetX},${offsetY},${zoomedWidth},${zoomedHeight}`;

  return (
    <div
      style={{
        width: `min(80vw, ${width}px)`,
        height: `min(80vh, ${height}px)`,
      }}
      class="max-w-full resize overflow-auto"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        class="dark:[&_text]:fill-white"
      >
        <defs>
          <For each={ribbonPaths()}>
            {({ rotation, sourceColor, targetColor }, idx) => (
              <linearGradient
                id={`grad-${idx()}`}
                gradientTransform={`rotate(${rotation}, 0.5, 0.5)`}
              >
                <stop offset="0%" stop-color={sourceColor} />
                <stop offset="100%" stop-color={targetColor} />
              </linearGradient>
            )}
          </For>
        </defs>
        <g>
          <For each={arcData()}>
            {({ arc, color }, idx) => (
              <path
                fill={color}
                d={arc ?? ""}
                onMouseOver={() => {
                  setTooltipData(idx());
                }}
                onMouseLeave={() => {
                  setTooltipData(null);
                }}
              />
            )}
          </For>
        </g>

        <g
          stroke-width="0.5"
          class="stroke-[#55555566] dark:stroke-neutral-300/66 [&_path]:[fill-opacity:0.7]"
        >
          <For each={ribbonPaths()}>
            {(
              { ribbonPath, title, source_value, target_value, coord1, coord2 },
              idx,
            ) => (
              <g class="group">
                <path
                  fill={`url(#grad-${idx()})`}
                  d={ribbonPath ?? ""}
                  opacity={
                    tooltipData() == null
                      ? 1
                      : tooltipData() !== idx()
                        ? 0.1
                        : 1
                  }
                  class="transition-opacity"
                  onMouseOver={() => {
                    setTooltipData(idx());
                  }}
                  onMouseLeave={() => {
                    setTooltipData(null);
                  }}
                >
                  <title>{title}</title>
                </path>
                <StyledText
                  idx={idx()}
                  x={coord1[0]}
                  y={-coord1[1]}
                  tooltipData={tooltipData()}
                  setTooltipData={setTooltipData}
                >
                  {source_value}
                </StyledText>
                <StyledText
                  idx={idx()}
                  x={coord2[0]}
                  y={-coord2[1]}
                  tooltipData={tooltipData()}
                  setTooltipData={setTooltipData}
                >
                  {target_value}
                </StyledText>
              </g>
            )}
          </For>
        </g>

        <g>{candidateLabels()}</g>
      </svg>
    </div>
  );
}

// https://github.com/d3/d3-array/blob/main/src/descending.js
function descending(a: unknown, b: unknown): number {
  return a == null || b == null
    ? NaN
    : b < a
      ? -1
      : b > a
        ? 1
        : b >= a
          ? 0
          : NaN;
}
