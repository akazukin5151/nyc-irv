import { chord, ribbon } from "d3-chord";
import { arc } from "d3-shape";
import { chord_to_gradient_rotation } from "./angles";

type ChordProps = {
  matrix: Array<Array<number>>;
  colors: Array<string>;
  names: Array<string>;
};

export function Chord({ matrix, colors, names }: ChordProps) {
  const width = 900;
  const height = 500;
  const outerRadius = Math.min(width, height) * 0.4;
  const innerRadius = outerRadius - 20;

  const calcChords = chord()
    .padAngle(20 / innerRadius)
    .sortSubgroups(descending);

  const chords = calcChords(matrix);
  // TODO: for each angle, find the angle between start and end.
  // this is the angle to place the text label

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

    return {
      ribbonPath,
      title,
      rotation: chord_to_gradient_rotation(chord.source, chord.target),
      sourceColor: colors[chord.source.index],
      targetColor: colors[chord.target.index],
    };
  });

  const calcArc = arc().innerRadius(innerRadius).outerRadius(outerRadius);

  const arcData = chords.map((chord) => {
    // TODO: tooltips. d3 example have only one arc for each group.
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

  return (
    <>
      <svg width={width} height={height} viewBox="-350,-200,700,400">
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
            <path fill={color} d={arc ?? ""} key={idx}></path>
          ))}
        </g>

        <g fillOpacity="0.7" stroke="#55555566" strokeWidth="0.5">
          {ribbonPaths.map(({ ribbonPath, title }, idx) => (
            <path fill={`url(#grad-${idx})`} d={ribbonPath ?? ""} key={idx}>
              <title>{title}</title>
            </path>
          ))}
        </g>
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
