import {
  hierarchy,
  partition,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { CANDIDATE_COLORS, type Coordinate, type Tree } from "./core";
import { useEffect, useRef, useState } from "react";
import { IcicleHoverInfo } from "./IcicleHoverInfo";

function rectWidth(d: HierarchyRectangularNode<Tree>) {
  return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

const width = 1000;
const height = 400;
const offsetY = -130;

export function Icicle() {
  const [treeData, setTreeData] = useState<Tree | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [allCoords, setAllCoords] = useState<Array<Coordinate>>();
  const [hoverInfo, setHoverInfo] = useState<Coordinate | null>(null);

  useEffect(() => {
    fetch("tree.json")
      .then((x) => x.json())
      .then((tree) => setTreeData(tree));
  }, []);

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

      const coords: Array<Coordinate> = [];
      partitions.descendants().forEach((d) => {
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

        const coord = {
          x: d.x0,
          y: d.y0,
          width: rectWidth(d),
          height: d.y1 - d.y0 - 1,
          color,
          ancestors,
          value: d.value ?? 0,
        };

        ctx.beginPath();
        ctx.rect(coord.x, coord.y, coord.width, coord.height);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        coords.push(coord);
      });

      setAllCoords(coords);
    }

    return () => {
      if (canvas != null) {
        const ctx = canvas.getContext("2d")!;
        ctx.reset();
      }
    };
  }, [treeData, canvasRef]);

  return (
    <section>
      <h2 className="ml-4 pt-2">All preferences</h2>

      <div className="mx-4">
        <p>
          The first level is the first choice. Lower levels are the voter's
          later choices. This chart shows every preference from every voter.
        </p>

        <div className="overflow-y-auto max-lg:h-[50px]">
          <IcicleHoverInfo coord={hoverInfo} />
        </div>

        <canvas
          ref={canvasRef}
          width={width * 2}
          height={height * 1.8}
          style={{ height: `${height}px` }}
          className="mx-auto w-full max-w-max rounded-xl bg-white pt-1 pl-3 shadow-md"
          onMouseMove={(evt) => {
            const canvas = canvasRef.current;
            if (allCoords == null || canvas == null) {
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
            for (const coord of allCoords) {
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
                setHoverInfo(coord);
                return;
              }
            }
            setHoverInfo(null);
          }}
        />
      </div>
    </section>
  );
}
