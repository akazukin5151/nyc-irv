type FracProps = {
  numerator: number;
  denominator: number;
};

export function Frac({ numerator, denominator }: FracProps) {
  return (
    <math>
      <mfrac>
        <mn>{numerator}</mn>
        <mn>{denominator}</mn>
      </mfrac>
    </math>
  );
}
