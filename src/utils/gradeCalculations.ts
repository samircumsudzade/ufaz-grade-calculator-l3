import { UE, EC } from '../types/syllabus';

/**
 * Safe rounding to decimals
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculate EC grade based on assessment coefficients
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero = false): number | null {
  const assessments = treatEmptyAsZero
    ? ec.assessments
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (assessments.length === 0) return null;

  const totalCoef = assessments.reduce((sum, a) => sum + a.coef, 0);
  const weightedSum = assessments.reduce((sum, a) => sum + (a.grade ?? 0) * a.coef, 0);

  return totalCoef === 0 ? null : roundTo(weightedSum / totalCoef, 5);
}

/**
 * Calculate UE grade considering ECTS weights
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero = false): number | null {
  const ecs = ue.ecs
    .map(ec => ({
      grade: calculateECGrade(ec, treatEmptyAsZero),
      coef: ec.coef,
    }))
    .filter(ec => ec.grade !== null) as { grade: number; coef: number }[];

  if (ecs.length === 0) return null;

  const totalCoef = ecs.reduce((sum, ec) => sum + ec.coef, 0);
  const weightedSum = ecs.reduce((sum, ec) => sum + ec.grade * ec.coef, 0);

  return totalCoef === 0 ? null : roundTo(weightedSum / totalCoef, 5);
}

/**
 * Calculate current overall grade based on completed ECTS
 */
export function calculateOverallCurrentGrade(ues: UE[]): number | null {
  const gradedUEs = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, false),
      ects: ue.coef,
    }))
    .filter(ue => ue.grade !== null) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const totalECTS = gradedUEs.reduce((sum, ue) => sum + ue.ects, 0);
  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  return roundTo(weightedSum / totalECTS, 5);
}

/**
 * Calculate projected grade based on ECTS proportion
 */
export function calculateOverallMidProgressProjectedGrade(ues: UE[], totalECTS = 30): number | null {
  if (ues.length === 0) return null;

  let projectedSum = 0;
  let totalWeightedECTS = 0;

  for (const ue of ues) {
    const ueGrade = calculateUEGrade(ue, false);
    if (ueGrade === null) continue;

    // Calculate the proportion this UE contributes to the total
    const ueWeight = (ue.coef / totalECTS) * 20; // Scale to 20-point system
    projectedSum += ueGrade * (ue.coef / totalECTS);
    totalWeightedECTS += ue.coef / totalECTS;
  }

  if (totalWeightedECTS === 0) return null;

  // Scale the result to maintain the 20-point system
  return roundTo(projectedSum, 5);
}

/**
 * Calculate overall projected grade for all UEs
 */
export function calculateOverallProjectedGrade(ues: UE[], treatEmptyAsZero = false): number | null {
  const totalECTS = ues.reduce((sum, ue) => sum + ue.coef, 0);
  
  if (totalECTS === 0) return null;

  let projectedSum = 0;
  let availableECTS = 0;

  for (const ue of ues) {
    const ueGrade = calculateUEGrade(ue, treatEmptyAsZero);
    if (ueGrade === null && !treatEmptyAsZero) continue;

    const grade = ueGrade ?? 0;
    projectedSum += grade * (ue.coef / totalECTS);
    availableECTS += ue.coef;
  }

  if (availableECTS === 0) return null;

  return roundTo(projectedSum * (totalECTS / availableECTS), 5);
}

/**
 * Calculate final grade - same as projected when all grades are entered
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero = false): number | null {
  return calculateOverallProjectedGrade(ues, treatEmptyAsZero);
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}