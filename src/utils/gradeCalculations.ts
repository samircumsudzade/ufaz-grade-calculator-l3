import { UE, EC } from '../types/syllabus';

/**
 * Helper: round only at the end, with specified decimals
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculate EC grade
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
  return weightedSum / totalWeight; // no rounding here
}

/**
 * Calculate UE grade
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
  return weightedSum / totalWeight; // no rounding here
}

/**
 * Calculate overall grade
 */
export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  // For projected grade, we need to handle UEs differently
  if (treatEmptyAsZero) {
    // For projected grade: include all UEs, treating missing grades as 10/20
    const uesWithGrades = ues.map(ue => {
      let ueGrade = calculateUEGrade(ue, false); // Don't treat empty as zero at UE level
      if (ueGrade === null) {
        ueGrade = 10; // Assume 10/20 for missing UEs in projection
      }
      return {
        grade: ueGrade,
        coef: ue.coef
      };
    });
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const ue of uesWithGrades) {
      weightedSum += ue.grade * ue.coef;
      totalWeight += ue.coef;
    }
    
    if (totalWeight === 0) return null;
    const finalGrade = weightedSum / totalWeight;
    return Math.round(finalGrade * 100000) / 100000;
  } else {
    // For current grade: only include UEs with actual grades
    const uesWithGrades = ues
      .map(ue => ({
        grade: calculateUEGrade(ue, false),
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
    return Math.round(finalGrade * 100000) / 100000;
  }
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString(); // removes trailing zeros
}