import type { ChordSubgroup } from "d3-chord";
import type { TextAnchor } from "./core";

export type ChordInfo = {
  degrees: number;
  coord1: readonly [number, number];
  coord2: readonly [number, number];
};

/**
 * a chord consists of a source and target place, both denoted by its angle.
 * in both the source and target itself have an arc width.
 * so the source have a start and end angle. the same goes for the target.
 *
 * this function calculates the rotation needed for a linear gradient
 * to fit exactly the direction between this chord from source to target.
 * when rotation is 0, the gradient is left to right.
 * the center of rotation is at the center of the chord.
 *
 * gradient transform's rotation accepts only degrees with no units.
 * radians didn't work. so this function will convert the final answers
 * to degrees.
 *
 * doesn't handle the case where the source and target is the same -
 * shouldn't happen here anyway
 *
 * how it works:
 * 1. from the start and end angle, find the middle angle. there is now one
 * "representative" angle for the source and target both.
 * 2. these angles are actually bearings. convert to mathematical angles.
 * 3. use dot product, determinant, and atan2 to find the *clockwise* angle
 * from source to target
 *
 * also returns the calculated coordinates based on the radius. note that
 * the y coordinate have positive values on the top, which is the inverse
 * of svg y coordinates
 */
export function compute_chord_info(
  source: ChordSubgroup,
  target: ChordSubgroup,
  radius: number,
): ChordInfo {
  const mid_bearing1 = (source.startAngle + source.endAngle) / 2;
  const mid_bearing2 = (target.startAngle + target.endAngle) / 2;

  // to construct the vectors, get the coordinates first.
  const coord1 = bearing_to_coord(source.startAngle, source.endAngle, radius);
  const coord2 = bearing_to_coord(target.startAngle, target.endAngle, radius);

  if (mid_bearing1 === mid_bearing2) {
    return { degrees: mid_bearing1, coord1, coord2 };
    // throw new Error("not supported");
  }

  const left_coord = [coord1[0] + 10, coord1[1]] as const;

  // let's have the two vectors point away from point b1 (coord1)
  const vec1 = [left_coord[0] - coord1[0], left_coord[1] - coord1[1]];
  const vec2 = [coord2[0] - coord1[0], coord2[1] - coord1[1]];

  const dot = dot_product(vec1, vec2);
  // if we use the cosine rule, it will always return the smaller (interior)
  // angle. but that is not clockwise. we need a clockwise angle,
  // so we use the determinant and atan2 to see if it's clockwise.
  // https://stackoverflow.com/questions/14066933/direct-way-of-computing-the-clockwise-angle-between-two-vectors
  const det = determinant(vec1, vec2);
  let theta = Math.atan2(det, dot);
  if (theta < 0) {
    // anticlockwise angle, find the other clockwise angle
    theta = 2 * Math.PI + theta;
  }

  const degrees = (theta / (2 * Math.PI)) * 360;
  return { degrees, coord1, coord2 };
}

/**
 * bearings are clockwise angles starting from the top.
 * "angles" are anticlockwise angles starting from the right.
 * all units are in radians.
 */
function bearing_to_angle(bearing: number): number {
  const quarter_circle = Math.PI / 2; // 90 degrees
  if (bearing < quarter_circle) {
    // bearings from 0 to 90 corresponds to angles from 90 to 0
    return -bearing + quarter_circle;
  } else if (bearing === quarter_circle) {
    // bearing of 90 is at the rightmost
    return 0;
  } else {
    // in degrees, this formula is -bearing + 450.
    return -bearing + 2.5 * Math.PI;
  }
}

function dot_product(as: Array<number>, bs: Array<number>): number {
  return as.map((a, i) => a * bs[i]).reduce((a, b) => a + b, 0);
}

function determinant(as: Array<number>, bs: Array<number>): number {
  return bs[0] * as[1] - bs[1] * as[0];
}

const middle_padding = Math.PI * 0.1; // 10% of the half-circle = 20% of the circle

export function bearing_to_anchor(
  startAngle: number,
  endAngle: number,
): TextAnchor {
  const mid_bearing = (startAngle + endAngle) / 2;

  let anchor: TextAnchor = "middle";
  if (mid_bearing > middle_padding && mid_bearing < Math.PI - middle_padding) {
    anchor = "start";
  } else if (
    mid_bearing > Math.PI + middle_padding
    && mid_bearing < 2 * Math.PI - middle_padding
  ) {
    anchor = "end";
  }

  return anchor;
}

export function bearing_to_coord(
  startAngle: number,
  endAngle: number,
  radius: number,
): readonly [number, number] {
  const mid_bearing = (startAngle + endAngle) / 2;
  const angle = bearing_to_angle(mid_bearing);

  // to construct the vectors, get the coordinates first.
  // assume on unit circle. actual radius doesn't matter.
  return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
}
