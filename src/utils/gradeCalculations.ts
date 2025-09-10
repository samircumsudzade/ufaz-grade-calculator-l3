import { UE, EC, Assessment } from '../types/syllabus';

/**
 * Fraction (rational) implemented with BigInt for exact arithmetic.
 * Keeps numerator/denominator reduced. All arithmetic is exact.
 */
class Fraction {
  num: bigint;
  den: bigint;

  constructor(num: bigint, den: bigint = 1n) {
    if (den === 0n) throw new Error('Denominator cannot be zero');
    // normalize sign to denominator positive
    if (den < 0n) { num = -num; den = -den; }
    const g = Fraction.gcd(num < 0n ? -num : num, den);
    this.num = num / g;
    this.den = den / g;
  }

  private static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  static fromNumber(value: number): Fraction {
    if (!Number.isFinite(value)) throw new Error('Invalid number');
    // use a fixed decimal capture to avoid scientific notation issues
    // 12 decimals is generous for typical grade inputs; adjust if needed
    const s = value.toFixed(12);
    const neg = s[0] === '-';
    const str = neg ? s.slice(1) : s;
    if (str.indexOf('.') === -1) {
      const n = BigInt(str) * (neg ? -1n : 1n);
      return new Fraction(n, 1n);
    }
    const [intPart, fracPart] = str.split('.');
    const decimals = fracPart.length;
    const numeratorStr = intPart + fracPart;
    let numerator = BigInt(numeratorStr);
    if (neg) numerator = -numerator;
    const denominator = 10n ** BigInt(decimals);
    return new Fraction(numerator, denominator);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }
  sub(other: Fraction): Fraction {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }
  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }
  div(other: Fraction): Fraction {
    if (other.num === 0n) throw new Error('Division by zero Fraction');
    return new Fraction(this.num * other.den, this.den * other.num);
  }
  isZero(): boolean {
    return this.num === 0n;
  }

  // Convert to JS number (may be inexact if fraction cannot be represented)
  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  // Round the exact fraction to `decimals` using integer rounding (half-away-from-zero).
  toRoundedNumber(decimals: number): number {
    const factor = 10n ** BigInt(decimals);
    const multiplied = this.num * factor;
    const quotient = multiplied / this.den; // truncated toward zero
    const remainder = multiplied % this.den;
    const absRemainder = remainder < 0n ? -remainder : remainder;
    const absDen = this.den < 0n ? -this.den : this.den;

    let rounded = quotient;
    // round half-away-from-zero: if absRemainder * 2 >= absDen then bump in sign direction
    if (absRemainder * 2n >= absDen) {
      rounded = (this.num >= 0n) === (this.den >= 0n) ? quotient + 1n : quotient - 1n;
    }
    return Number(rounded) / Number(factor);
  }

  toString(): string {
    if (this.den === 1n) return this.num.toString();
    return `${this.num.toString()}/${this.den.toString()}`;
  }
}

/* ---------- Fraction-based internal helpers ---------- */

function ecGradeFraction(ec: EC, treatEmptyAsZero: boolean = false): Fraction | null {
  const assessments: Assessment[] = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  let weightedSum = new Fraction(0n, 1n);
  let totalWeight = new Fraction(0n, 1n);

  for (const a of assessments) {
    const grade = (a.grade ?? 0); // when treatEmptyAsZero true, missing -> 0
    const gradeF = Fraction.fromNumber(grade);
    const coefF = Fraction.fromNumber(a.coef ?? 0);
    weightedSum = weightedSum.add(gradeF.mul(coefF));
    totalWeight = totalWeight.add(coefF);
  }

  if (totalWeight.isZero()) return null;
  return weightedSum.div(totalWeight);
}

function ueGradeFraction(ue: UE, treatEmptyAsZero: boolean = false): Fraction | null {
  // For each EC, get its fraction-grade (or 0 if treatEmptyAsZero)
  const pairs = ue.ecs.map(ec => {
    const g = ecGradeFraction(ec, treatEmptyAsZero);
    return { ec, gradeF: g ?? (treatEmptyAsZero ? new Fraction(0n, 1n) : null) };
  }).filter(p => p.gradeF !== null) as { ec: EC; gradeF: Fraction }[];

  if (pairs.length === 0) return null;

  let weightedSum = new Fraction(0n, 1n);
  let totalWeight = new Fraction(0n, 1n);

  for (const p of pairs) {
    const coefF = Fraction.fromNumber(p.ec.coef ?? 0);
    weightedSum = weightedSum.add(p.gradeF.mul(coefF));
    totalWeight = totalWeight.add(coefF);
  }

  if (totalWeight.isZero()) return null;
  return weightedSum.div(totalWeight);
}

/* ---------- Exported functions (public API) ---------- */

/**
 * Calculate EC grade as a number (no rounding here — returned as JS number).
 * If you need exact rational output, use ecGradeFraction above.
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  const f = ecGradeFraction(ec, treatEmptyAsZero);
  return f === null ? null : f.toNumber();
}

/**
 * Calculate UE grade as a number (no rounding here — returned as JS number).
 * calculateOverallGrade uses fraction arithmetic internally for exactness.
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero: boolean = false): number | null {
  const f = ueGradeFraction(ue, treatEmptyAsZero);
  return f === null ? null : f.toNumber();
}

/**
 * Calculate overall grade USING exact fraction math internally.
 * Only here we round the final projected/current grade to 5 decimal places.
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const pairs = ues.map(ue => ({
    ue,
    gradeF: ueGradeFraction(ue, treatEmptyAsZero) ?? (treatEmptyAsZero ? new Fraction(0n, 1n) : null)
  })).filter(p => p.gradeF !== null) as { ue: UE; gradeF: Fraction }[];

  if (pairs.length === 0) return null;

  let weightedSum = new Fraction(0n, 1n);
  let totalWeight = new Fraction(0n, 1n);

  for (const p of pairs) {
    const coefF = Fraction.fromNumber(p.ue.coef ?? 0);
    weightedSum = weightedSum.add(p.gradeF.mul(coefF));
    totalWeight = totalWeight.add(coefF);
  }

  if (totalWeight.isZero()) return null;

  const finalFrac = weightedSum.div(totalWeight);
  // ROUND only once here to 5 decimals
  return finalFrac.toRoundedNumber(5);
}

/**
 * Format grade for display: up to 5 decimals, trailing zeros removed.
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}