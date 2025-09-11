import { UE, EC } from '../types/syllabus';

/**
 * Safe rounding to decimals - only used at the very end
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculate EC grade based on assessment coefficients
 * This is the weighted average of assessments within an EC
 */
export function calculateECGrade(ec: EC, treatEmptyAsZero = false): number | null {
  const validAssessments = treatEmptyAsZero
    ? ec.assessments.map(a => ({ ...a, grade: a.grade ?? 0 }))
    : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);

  if (validAssessments.length === 0) return null;

  const totalCoef = validAssessments.reduce((sum, a) => sum + a.coef, 0);
  if (totalCoef === 0) return null;

  const weightedSum = validAssessments.reduce((sum, a) => sum + (a.grade ?? 0) * a.coef, 0);
  
  // Return exact calculation without rounding
  return weightedSum / totalCoef;
}

/**
 * Calculate UE grade as weighted average of EC grades using EC coefficients
 * UE coefficient is ignored here - only EC coefficients matter for internal UE calculation
 */
export function calculateUEGrade(ue: UE, treatEmptyAsZero = false): number | null {
  const validECs = ue.ecs
    .map(ec => ({
      grade: calculateECGrade(ec, treatEmptyAsZero),
      coef: ec.coef,
    }))
    .filter(ec => ec.grade !== null) as { grade: number; coef: number }[];

  if (validECs.length === 0) return null;

  const totalCoef = validECs.reduce((sum, ec) => sum + ec.coef, 0);
  if (totalCoef === 0) return null;

  const weightedSum = validECs.reduce((sum, ec) => sum + ec.grade * ec.coef, 0);

  // Return exact calculation without rounding
  return weightedSum / totalCoef;
}

/**
 * Calculate current grade based only on completed UEs, weighted by their ECTS
 * This shows the actual grade for completed work only
 */
export function calculateOverallCurrentGrade(ues: UE[]): number | null {
  const completedUEs = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, false),
      ects: ue.ects, // Use ECTS, not coefficient
    }))
    .filter(ue => ue.grade !== null) as { grade: number; ects: number }[];

  if (completedUEs.length === 0) return null;

  const totalCompletedECTS = completedUEs.reduce((sum, ue) => sum + ue.ects, 0);
  if (totalCompletedECTS === 0) return null;

  const weightedSum = completedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  // Round only at the end
  return roundTo(weightedSum / totalCompletedECTS, 5);
}

/**
 * Calculate projected grade for mid-progress
 * Each UE is scaled by its ECTS proportion relative to total ECTS
 * UE coefficients are completely ignored
 */
export function calculateOverallMidProgressProjectedGrade(ues: UE[]): number | null {
  const totalECTS = ues.reduce((sum, ue) => sum + ue.ects, 0);
  if (totalECTS === 0) return null;

  let projectedSum = 0;
  let hasAnyGrades = false;

  for (const ue of ues) {
    const ueGrade = calculateUEGrade(ue, false);
    if (ueGrade === null) continue;

    hasAnyGrades = true;
    // Scale by ECTS proportion only
    const ectsWeight = ue.ects / totalECTS;
    projectedSum += ueGrade * ectsWeight;
  }

  if (!hasAnyGrades) return null;

  // Round only at the end
  return roundTo(projectedSum, 5);
}

/**
 * Calculate final grade when all UEs are completed
 * Uses ECTS weighting for final calculation
 */
export function calculateOverallFinalGrade(ues: UE[]): number | null {
  const totalECTS = ues.reduce((sum, ue) => sum + ue.ects, 0);
  if (totalECTS === 0) return null;

  let finalSum = 0;
  let completedECTS = 0;

  for (const ue of ues) {
    const ueGrade = calculateUEGrade(ue, true); // Treat empty as zero for final calculation
    if (ueGrade === null) continue;

    finalSum += ueGrade * ue.ects;
    completedECTS += ue.ects;
  }

  if (completedECTS === 0) return null;

  // Round only at the end
  return roundTo(finalSum / totalECTS, 5);
}

/**
 * Main function to calculate overall grade
 * For mid-progress: returns projected grade
 * For complete: returns final grade
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero = false): number | null {
  if (treatEmptyAsZero) {
    return calculateOverallFinalGrade(ues);
  } else {
    return calculateOverallMidProgressProjectedGrade(ues);
  }
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return '0';
  return grade.toString();
}