import { UE, EC } from '../types/syllabus';

/**
 * Round safely at the end
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate EC grade (still out of 20 here, but weighted by coef directly)
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  const assessments = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const a of assessments) {
    const grade = a.grade ?? 0; // always /20
    weightedSum += grade * a.coef;
    totalWeight += a.coef;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight; // still /20
}

/**
 * Calculate UE grade (still /20)
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero: boolean = false): number | null {
  const ecsWithGrades = ue.ecs
    .map(ec => ({
      grade: calculateECGrade(ec, treatEmptyAsZero),
      coef: ec.coef
    }))
    .filter(ec => ec.grade !== null);

  if (ecsWithGrades.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const ec of ecsWithGrades) {
    weightedSum += (ec.grade as number) * ec.coef;
    totalWeight += ec.coef;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight; // still /20
}

/**
 * Calculate overall projected grade
 * - Step 1: compute weighted average (out of 20) but using coef/ECTS weights
 * - Step 2: normalize to /30
 * - Step 3: scale final result to /20
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, treatEmptyAsZero),
      coef: ue.coef // this is ECTS
    }))
    .filter(ue => ue.grade !== null);

  if (uesWithGrades.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const ue of uesWithGrades) {
    weightedSum += (ue.grade as number) * ue.coef; // grade (/20) × ECTS
    totalWeight += ue.coef; // total ECTS
  }

  if (totalWeight === 0) return null;

  // Step 1: average on /20 scale
  const avg20 = weightedSum / totalWeight;

  // Step 2: normalize ECTS to 30 and then project to /20
  // Equivalent to: (sum(grade*ECTS) / 30)
  const projected = (weightedSum / 30);

  return roundTo(projected, 5);
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
