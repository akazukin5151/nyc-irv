import { chord, ribbon } from "d3-chord";
import { arc } from "d3-shape";
import {
  bearing_to_anchor,
  bearing_to_coord,
  compute_chord_info,
} from "./angles";
import { StyledText } from "./StyledText";
import { useState } from "react";

type ChordProps = {
  matrix: Array<Array<number>>;
  colors: Array<string>;
  names: Array<string>;
};

export function Chord({ matrix, colors, names }: ChordProps) {
  const [tooltipData, setTooltipData] = useState<number | null>(null);

  const width = 900;
  const height = 500;
  const outerRadius = Math.min(width, height) * 0.4;
  const innerRadius = outerRadius - 20;

  const calcChords = chord()
    .padAngle(20 / innerRadius)
    .sortSubgroups(descending);

  const chords = calcChords(matrix);

  const calcRibbon = ribbon().radius(innerRadius);
  const ribbonPaths = chords.map((chord) => {
    const source = { ...chord.source, radius: innerRadius };
    const target = { ...chord.target, radius: innerRadius };
    const ribbonPath = calcRibbon({ source, target }) as unknown as
      | string
      | null;

    const source_name = names[chord.source.index];
    const target_name = names[chord.target.index];
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
      sourceColor: colors[chord.source.index],
      targetColor: colors[chord.target.index],
      source_value,
      target_value,
      coord1,
      coord2,
    };
  });

  const calcArc = arc().innerRadius(innerRadius).outerRadius(outerRadius);

  const arcData = chords.map((chord) => {
    const arc = calcArc({
      innerRadius,
      outerRadius,
      startAngle: chord.source.startAngle,
      endAngle: chord.source.endAngle,
    });
    const color = colors[chord.source.index];
    return { arc, color };
  });

  arcData.push(
    ...chords.map((chord) => {
      const arc = calcArc({
        innerRadius,
        outerRadius,
        startAngle: chord.target.startAngle,
        endAngle: chord.target.endAngle,
      });
      const color = colors[chord.target.index];
      return { arc, color };
    }),
  );

  const candidateLabels = chords.groups.map((group) => {
    const name = names[group.index].split(" ").pop();
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
      <text x={coord[0]} y={-coord[1]} textAnchor={anchor} key={name}>
        {name}
      </text>
    );
  });

  const offset = 90;
  const zoomedWidth = width - offset;
  const zoomedHeight = height - offset;
  const offsetX = -zoomedWidth / 2;
  const offsetY = -zoomedHeight / 2;
  const viewBox = `${offsetX},${offsetY},${zoomedWidth},${zoomedHeight}`;

  return (
    <>
      <svg width={width} height={height} viewBox={viewBox}>
        <defs>
          {ribbonPaths.map(({ rotation, sourceColor, targetColor }, idx) => (
            <linearGradient
              id={`grad-${idx}`}
              gradientTransform={`rotate(${rotation}, 0.5, 0.5)`}
              key={idx}
            >
              <stop offset="0%" stopColor={sourceColor}></stop>
              <stop offset="100%" stopColor={targetColor}></stop>
            </linearGradient>
          ))}
        </defs>
        <g>
          {arcData.map(({ arc, color }, idx) => (
            <path
              fill={color}
              d={arc ?? ""}
              key={idx}
              onMouseOver={() => {
                setTooltipData(idx);
              }}
              onMouseLeave={() => {
                setTooltipData(null);
              }}
            ></path>
          ))}
        </g>

        <g fillOpacity="0.7" stroke="#55555566" strokeWidth="0.5">
          {ribbonPaths.map(
            (
              { ribbonPath, title, source_value, target_value, coord1, coord2 },
              idx,
            ) => (
              <g className="group" key={idx}>
                <path
                  fill={`url(#grad-${idx})`}
                  d={ribbonPath ?? ""}
                  opacity={
                    tooltipData == null ? 1 : tooltipData !== idx ? 0.1 : 1
                  }
                  className="transition-opacity"
                  onMouseOver={() => {
                    setTooltipData(idx);
                  }}
                  onMouseLeave={() => {
                    setTooltipData(null);
                  }}
                >
                  <title>{title}</title>
                </path>
                <StyledText
                  idx={idx}
                  x={coord1[0]}
                  y={-coord1[1]}
                  tooltipData={tooltipData}
                  setTooltipData={setTooltipData}
                >
                  {source_value}
                </StyledText>
                <StyledText
                  idx={idx}
                  x={coord2[0]}
                  y={-coord2[1]}
                  tooltipData={tooltipData}
                  setTooltipData={setTooltipData}
                >
                  {target_value}
                </StyledText>
              </g>
            ),
          )}
        </g>

        <g>{candidateLabels}</g>
      </svg>
    </>
  );
}

// https://github.com/d3/d3-array/blob/main/src/descending.js
function descending(a: any, b: any): number {
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
