import {
  hierarchy,
  partition,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { CANDIDATE_COLORS, getCandColor, type Tree } from "./core";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Coords = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  ancestors: Array<string>;
  value: number;
};

function rectWidth(d: HierarchyRectangularNode<Tree>) {
  return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

const width = 1000;
const height = 500;
const offsetY = -160;
const defaultTooltip = "Hover over a bar to see its ranking and frequency";

type IcicleProps = {
  treeData: Tree | null;
};

export function Icicle({ treeData }: IcicleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coords, setCoords] = useState<Array<Coords>>();
  // despite the name, our tooltip doesn't float for performance reasons
  const [tooltip, setTooltip] = useState<ReactNode>(defaultTooltip);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (treeData != null && canvas != null) {
      const ctx = canvas.getContext("2d")!;
      ctx.translate(0, offsetY);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const root = hierarchy(treeData)
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value! - a.value!);

      // have to make the width shorter, otherwise it would overflow
      const computePartition = partition<Tree>().size([width * 0.8, height]);

      const partitions = computePartition(root);

      const d = partitions.descendants();

      const coords: Array<Coords> = [];
      d.forEach((d, _idx) => {
        if (d.depth === 6) {
          return;
        }

        const name = d.data.name;
        if (name === "Root") {
          return;
        }
        const cand = name.split(" ").pop() as keyof typeof CANDIDATE_COLORS;
        const color = CANDIDATE_COLORS[cand];

        const ancestors = d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .slice(1);
        ctx.beginPath();
        ctx.rect(d.x0, d.y0, rectWidth(d), d.y1 - d.y0 - 1);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        coords.push({
          x: d.x0,
          y: d.y0,
          width: rectWidth(d),
          height: d.y1 - d.y0 - 1,
          color,
          ancestors,
          value: d.value ?? 0,
        });
      });

      setCoords(coords);
    }

    return () => {
      if (canvas != null) {
        const ctx = canvas.getContext("2d")!;
        ctx.reset();
      }
    };
  }, [treeData, canvasRef]);

  return (
    <div className="rounded-md bg-white shadow-md">
      <h2 className="ml-4 pt-2">All preferences</h2>

      <div className="ml-4">
        <p>
          The first level is the first choice. Lower levels are the voter's
          later choices. This chart shows every preference from every voter.
        </p>

        {tooltip != null && <p>{tooltip}</p>}

        <canvas
          ref={canvasRef}
          width={width * 2}
          height={height * 2}
          style={{ width: `${width}px`, height: `${height}px` }}
          onMouseMove={(evt) => {
            const canvas = canvasRef.current;
            if (coords == null || canvas == null) {
              return;
            }

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mousePos = {
              x: ((evt.clientX - rect.left) * scaleX) / window.devicePixelRatio,
              y:
                ((evt.clientY - rect.top) * scaleY - offsetY)
                / window.devicePixelRatio,
            };

            // check which rectangle it is intersecting with
            for (const coord of coords) {
              const minX = coord.x;
              const maxX = minX + coord.width;
              const minY = coord.y;
              const maxY = minY + coord.height;
              if (
                mousePos.x >= minX
                && mousePos.x <= maxX
                && mousePos.y >= minY
                && mousePos.y <= maxY
              ) {
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

                const tooltip = (
                  <span>
                    {coord.value} voters ranked {joined}
                  </span>
                );
                setTooltip(tooltip);
                return;
              }
            }
            setTooltip(defaultTooltip);
          }}
        />
      </div>
    </div>
  );
}
