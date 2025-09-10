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
 * Preserves precision using integers
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  const assessments = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  const factor = 100000; // precision factor
  let weightedSum = 0;
  let totalCoef = 0;

  for (const a of assessments) {
    const grade = a.grade ?? 0;
    weightedSum += Math.round(grade * factor) * a.coef;
    totalCoef += a.coef;
  }

  return weightedSum / totalCoef / factor;
}

/**
 * Calculate UE grade (weighted average of ECs)
 * Preserves precision using integers
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero: boolean = false): number | null {
  const ecsWithGrades = ue.ecs
    .map(ec => ({
      grade: calculateECGrade(ec, treatEmptyAsZero),
      coef: ec.coef
    }))
    .filter(ec => ec.grade !== null) as { grade: number; coef: number }[];

  if (ecsWithGrades.length === 0) return null;

  const factor = 100000; // precision factor
  let weightedSum = 0;
  let totalCoef = 0;

  for (const ec of ecsWithGrades) {
    weightedSum += Math.round(ec.grade * factor) * ec.coef;
    totalCoef += ec.coef;
  }

  return weightedSum / totalCoef / factor;
}

/**
 * Current overall grade (mid-progress)
 * - only graded UEs
 * - denominator = sum of graded UEs’ ECTS
 */
export function calculateOverallCurrentGrade(ues: UE[]): number | null {
  const gradedUEs = ues
    .map(ue => {
      const grade = calculateUEGrade(ue, false);
      return grade !== null ? { grade: Math.round(grade * 100000), ects: ue.coef } : null;
    })
    .filter(Boolean) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);
  const totalECTS = gradedUEs.reduce((sum, ue) => sum + ue.ects, 0);

  return roundTo(weightedSum / totalECTS / 100000, 5);
}

/**
 * Mid-progress projected grade (/20)
 * - weighted sum of graded UEs
 * - denominator = total system ECTS (30)
 */
export function calculateOverallMidProgressProjectedGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const gradedUEs = ues
    .map(ue => {
      const grade = calculateUEGrade(ue, treatEmptyAsZero);
      return grade !== null ? { grade: Math.round(grade * 100000), ects: ue.coef } : null;
    })
    .filter(Boolean) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  // Always divide by full system ECTS (30)
  return roundTo(weightedSum / (30 * 100000), 5);
}

/**
 * Overall projected grade (/20) — assumes all grades entered
 */
export function calculateOverallProjectedGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => {
      const grade = calculateUEGrade(ue, treatEmptyAsZero);
      return grade !== null ? { grade: Math.round(grade * 100000), ects: ue.coef } : null;
    })
    .filter(Boolean) as { grade: number; ects: number }[];

  if (uesWithGrades.length === 0) return null;

  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);
  const totalECTS = uesWithGrades.reduce((sum, ue) => sum + ue.ects, 0);

  return roundTo(weightedSum / (totalECTS * 100000), 5);
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
