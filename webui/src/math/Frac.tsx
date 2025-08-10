type FracProps = {
  numerator: number;
  denominator: number;
};

export function Frac(props: FracProps) {
  return (
    <math>
      <mfrac>
        <mn>{props.numerator}</mn>
        <mn>{props.denominator}</mn>
      </mfrac>
    </math>
  );
}
