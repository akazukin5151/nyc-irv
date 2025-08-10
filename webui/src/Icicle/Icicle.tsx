import {
  hierarchy,
  partition,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { CANDIDATE_COLORS, type Coordinate, type Tree } from "../core";
import { IcicleHoverInfo } from "./IcicleHoverInfo";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";

async function fetchTreeData(): Promise<Tree> {
  const x = await fetch("tree.json");
  return x.json();
}

function rectWidth(d: HierarchyRectangularNode<Tree>) {
  return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

const width = 1000;
const height = 400;
const offsetY = -130;

export function Icicle() {
  const [treeData] = createResource<Tree>(fetchTreeData);

  let canvasRef!: HTMLCanvasElement;
  const [allCoords, setAllCoords] = createSignal<Array<Coordinate>>([]);
  const [hoverInfo, setHoverInfo] = createSignal<Coordinate | null>(null);

  createEffect(() => {
    if (
      !treeData.loading
      && !treeData.error
      && treeData() != null
      && canvasRef != null
    ) {
      const ctx = canvasRef.getContext("2d")!;
      ctx.translate(0, offsetY);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const root = hierarchy(treeData()!)
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

    onCleanup(() => {
      const ctx = canvasRef.getContext("2d")!;
      ctx.reset();
    });
  });

  return (
    <section>
      <h2 class="ml-4 pt-2">All preferences</h2>

      <div class="mx-4 dark:text-white">
        <p>
          The first level is the first choice. Lower levels are the voter's
          later choices. This chart shows every preference from every voter.
        </p>

        <div class="overflow-y-auto max-lg:h-[50px]">
          <IcicleHoverInfo coord={hoverInfo()} />
        </div>

        <canvas
          ref={canvasRef}
          width={width * 2}
          height={height * 1.8}
          style={{ height: `${height}px` }}
          class="mx-auto w-full max-w-max rounded-xl bg-white pt-1 pl-3 shadow-md dark:bg-neutral-800"
          onMouseMove={(evt) => {
            const rect = canvasRef.getBoundingClientRect();
            const scaleX = canvasRef.width / rect.width;
            const scaleY = canvasRef.height / rect.height;
            const mousePos = {
              x: ((evt.clientX - rect.left) * scaleX) / window.devicePixelRatio,
              y:
                ((evt.clientY - rect.top) * scaleY - offsetY)
                / window.devicePixelRatio,
            };

            // check which rectangle it is intersecting with
            for (const coord of allCoords()) {
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
