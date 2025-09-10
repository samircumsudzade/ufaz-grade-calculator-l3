import { UE, EC } from '../types/syllabus';

/**
 * Calculate EC grade
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  const assessments = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  const totalWeight = assessments.reduce((sum, a) => sum + a.coef, 0);
  if (totalWeight === 0) return null;

  const weightedSum = assessments.reduce((sum, a) => sum + ((a.grade ?? 0) * a.coef), 0);

  return weightedSum / totalWeight;
}

/**
 * Calculate UE grade
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero: boolean = false): number | null {
  const ecsWithGrades = ue.ecs
    .map(ec => ({
      ...ec,
      calculatedGrade: calculateECGrade(ec, treatEmptyAsZero) ?? (treatEmptyAsZero ? 0 : null)
    }))
    .filter(ec => ec.calculatedGrade !== null);

  if (ecsWithGrades.length === 0) return null;

  const totalWeight = ecsWithGrades.reduce((sum, ec) => sum + ec.coef, 0);
  if (totalWeight === 0) return null;

  const weightedSum = ecsWithGrades.reduce((sum, ec) => sum + (ec.calculatedGrade! * ec.coef), 0);

  return weightedSum / totalWeight;
}

/**
 * Calculate overall grade (final precision applied here only)
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => ({
      ...ue,
      calculatedGrade: calculateUEGrade(ue, treatEmptyAsZero) ?? (treatEmptyAsZero ? 0 : null)
    }))
    .filter(ue => ue.calculatedGrade !== null);

  if (uesWithGrades.length === 0) return null;

  const totalWeight = uesWithGrades.reduce((sum, ue) => sum + ue.coef, 0);
  if (totalWeight === 0) return null;

  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade! * ue.coef), 0);
  const finalGrade = weightedSum / totalWeight;

  // ✅ Only round at the very end to 5 decimal places
  return Math.round(finalGrade * 100000) / 100000;
}

/**
 * Format grade for display (up to 5 decimals, no trailing zeros)
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
