import { format, getCandColor, type Coordinate } from "../core";

type IcicleHoverInfoProps = {
  coord: Coordinate | null;
};

const defaultMessage = "Hover over a bar to see its ranking and frequency";

// a floating tooltip would be bad for performance
export function IcicleHoverInfo({ coord }: IcicleHoverInfoProps) {
  if (coord == null) {
    return defaultMessage;
  }

  const underlined = coord.ancestors.map((cand) => (
    <span
      key={cand}
      className="underline decoration-3"
      style={{ textDecorationColor: getCandColor(cand) }}
    >
      {cand}
    </span>
  ));

  if (
    underlined.length < 5
    && coord.ancestors[coord.ancestors.length - 1] !== "Exhausted"
  ) {
    underlined.push(<span>(All)</span>);
  }

  const joined = underlined.reduce((a, b) => (
    <span>
      {a} &gt; {b}
    </span>
  ));

  return (
    <output>
      {format(coord.value)} voters ranked {joined}
    </output>
  );
}
