import { Show } from "solid-js";
import { format, getCandColor, type Coordinate } from "../core";

type IcicleHoverInfoProps = {
  coord: Coordinate | null;
};

const defaultMessage = "Hover over a bar to see its ranking and frequency";

// a floating tooltip would be bad for performance
export function IcicleHoverInfo(props: IcicleHoverInfoProps) {
  return (
    <Show when={props.coord != null} fallback={defaultMessage}>
      <IcicleHoverInfoInner coord={props.coord!} />
    </Show>
  );
}

type IcicleHoverInfoInnerProps = {
  coord: Coordinate;
};

function IcicleHoverInfoInner(props: IcicleHoverInfoInnerProps) {
  const underlined = () => {
    const underlined_ = props.coord.ancestors.map((cand) => (
      <span
        class="underline decoration-3"
        style={{ "text-decoration-color": getCandColor(cand) }}
      >
        {cand}
      </span>
    ));

    if (
      underlined_.length < 5
      && props.coord.ancestors[props.coord.ancestors.length - 1] !== "Exhausted"
    ) {
      underlined_.push(<span>(All)</span>);
    }

    return underlined_;
  };

  const joined = () =>
    underlined().reduce((a, b) => (
      <span>
        {a} &gt; {b}
      </span>
    ));

  return (
    <output>
      {format(props.coord.value)} voters ranked {joined()}
    </output>
  );
}
