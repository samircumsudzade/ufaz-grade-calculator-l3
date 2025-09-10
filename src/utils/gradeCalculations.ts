import { UE, EC } from '../types/syllabus';

/**
 * Round safely at the end
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
 * Calculate overall current grade (/20)
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, treatEmptyAsZero),
      coef: ue.coef
    }))
    .filter(ue => ue.grade !== null);

  if (uesWithGrades.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const ue of uesWithGrades) {
    weightedSum += (ue.grade as number) * ue.coef;
    totalWeight += ue.coef;
  }

  if (totalWeight === 0) return null;
  const finalGrade = weightedSum / totalWeight;
  return roundTo(finalGrade, 5);
}

/**
 * Calculate overall projected grade (/20), correctly weighted by total ECTS
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
  if (totalECTS === 0) return null;

  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  const projectedGrade = weightedSum / totalECTS;
  return roundTo(projectedGrade, 5);
}

/**
 * Format grade for display: up to 5 decimals, no trailing zeros
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
