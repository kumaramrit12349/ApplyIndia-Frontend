function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Renders a marking value as a simple fraction when it cleanly is one (e.g. 0.3333 -> "1/3"), otherwise falls back to the plain number. */
export function formatMarkFraction(value: number, maxDenominator = 20): string {
  if (value === 0) return "0";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (Number.isInteger(abs)) return `${sign}${abs}`;
  for (let denominator = 2; denominator <= maxDenominator; denominator++) {
    const numerator = abs * denominator;
    if (Math.abs(numerator - Math.round(numerator)) < 0.002) {
      const roundedNum = Math.round(numerator);
      const g = gcd(roundedNum, denominator);
      return `${sign}${roundedNum / g}/${denominator / g}`;
    }
  }
  return `${sign}${abs}`;
}
