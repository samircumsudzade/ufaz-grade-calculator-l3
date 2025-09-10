import { UE, EC } from '../types/syllabus';

/**
 * Round safely to a specific number of decimals
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculate EC grade (weighted average of assessments)
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  const assessments = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const a of assessments) {
    const grade = a.grade ?? 0;
    weightedSum += grade * a.coef;
    totalWeight += a.coef;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/**
 * Calculate UE grade (weighted average of ECs)
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
  return weightedSum / totalWeight;
}

/**
 * Current overall grade (mid-progress)
 * - uses only graded UEs
 * - denominator = sum of graded UEs’ ECTS
 */
export function calculateOverallCurrentGrade(ues: UE[]): number | null {
  const gradedUEs = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, false),
      ects: ue.coef
    }))
    .filter(ue => ue.grade !== null) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const totalECTS = gradedUEs.reduce((sum, ue) => sum + ue.ects, 0);
  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  return roundTo(weightedSum / totalECTS, 5);
}

/**
 * Mid-progress projected grade (/20)
 * - uses weighted sum of graded UEs
 * - denominator = full ECTS (30)
 */
export function calculateOverallMidProgressProjectedGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const gradedUEs = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, treatEmptyAsZero),
      ects: ue.coef
    }))
    .filter(ue => ue.grade !== null) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  // Always divide by 30 (full total ECTS)
  const projectedGrade = weightedSum / 30;

  return roundTo(projectedGrade, 5);
}

/**
 * Overall projected grade (/20)
 * - assumes all UEs graded
 * - denominator = sum of all UEs’ ECTS
 */
export function calculateOverallProjectedGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, treatEmptyAsZero),
      ects: ue.coef
    }))
    .filter(ue => ue.grade !== null) as { grade: number; ects: number }[];

  if (uesWithGrades.length === 0) return null;

  const totalECTS = uesWithGrades.reduce((sum, ue) => sum + ue.ects, 0);
  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  return roundTo(weightedSum / totalECTS, 5);
}

/**
 * Final overall grade — same as projected when all grades entered
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  return calculateOverallProjectedGrade(ues, treatEmptyAsZero);
}

/**
 * Format grade for display: up to 5 decimals, removes trailing zeros
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
