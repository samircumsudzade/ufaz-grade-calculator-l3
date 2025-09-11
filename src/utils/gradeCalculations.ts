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
 * Missing grades are treated as 0
 */
export function calculateECGrade(ec: EC): number {
  // Always treat missing grades as 0
  const assessments = ec.assessments.map(a => ({ ...a, grade: a.grade ?? 0 }));

  const totalCoef = assessments.reduce((sum, a) => sum + a.coef, 0);
  if (totalCoef === 0) return 0;

  const weightedSum = assessments.reduce((sum, a) => sum + a.grade * a.coef, 0);
  
  // Return exact calculation without rounding
  return weightedSum / totalCoef;
}

/**
 * Calculate UE grade as weighted average of EC grades using EC coefficients
 * UE coefficient is ignored here - only EC coefficients matter for internal UE calculation
 * Missing grades are treated as 0
 */
export function calculateUEGrade(ue: UE): number {
  const ecs = ue.ecs.map(ec => ({
    grade: calculateECGrade(ec),
    coef: ec.coef,
  }));

  const totalCoef = ecs.reduce((sum, ec) => sum + ec.coef, 0);
  if (totalCoef === 0) return 0;

  const weightedSum = ecs.reduce((sum, ec) => sum + ec.grade * ec.coef, 0);

  // Return exact calculation without rounding
  return weightedSum / totalCoef;
}

/**
 * Calculate overall grade weighted by ECTS
 * Missing grades are treated as 0
 */
export function calculateOverallGrade(ues: UE[]): number {
  const totalECTS = ues.reduce((sum, ue) => sum + ue.ects, 0);
  if (totalECTS === 0) return 0;

  let weightedSum = 0;

  for (const ue of ues) {
    const ueGrade = calculateUEGrade(ue);
    weightedSum += ueGrade * ue.ects;
  }

  // Round only at the end
  return roundTo(weightedSum / totalECTS, 5);
}

/**
 * Calculate remaining ECTS from incomplete UEs
 */
export function calculateRemainingECTS(ues: UE[]): number {
  const completedUEs = ues.filter(ue => 
    ue.ecs.every(ec => 
      ec.assessments.every(a => a.grade !== undefined && a.grade !== null)
    )
  );
  const completedECTS = completedUEs.reduce((sum, ue) => sum + ue.ects, 0);
  const totalECTS = ues.reduce((sum, ue) => sum + ue.ects, 0);
  return totalECTS - completedECTS;
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number): string {
  return grade.toString();
}