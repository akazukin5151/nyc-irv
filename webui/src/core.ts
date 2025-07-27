import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

export const NAMED_COLORS = {
  red: "rgba(255, 99, 132, 1)",
  orange: "rgba(255, 159, 64, 1)",
  yellow: "rgba(255, 205, 86, 1)",
  green: "rgba(75, 192, 192, 1)",
  blue: "rgba(54, 162, 235, 1)",
  purple: "rgba(153, 102, 255, 1)",
  grey: "rgba(201, 203, 207, 1)",
};

export const CHART_COLORS = Object.values(NAMED_COLORS);
