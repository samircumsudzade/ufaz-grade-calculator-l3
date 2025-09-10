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

  const weightedSum = assessments.reduce((sum, a) => sum + (a.grade ?? 0) * a.coef, 0);
  const totalCoef = assessments.reduce((sum, a) => sum + a.coef, 0);

  return totalCoef === 0 ? null : weightedSum / totalCoef;
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
    .filter(ec => ec.grade !== null) as { grade: number; coef: number }[];

  if (ecsWithGrades.length === 0) return null;

  const weightedSum = ecsWithGrades.reduce((sum, ec) => sum + ec.grade * ec.coef, 0);
  const totalCoef = ecsWithGrades.reduce((sum, ec) => sum + ec.coef, 0);

  return totalCoef === 0 ? null : weightedSum / totalCoef;
}

/**
 * Mid-progress projected grade (/20)
 * - weighted sum of graded UEs
 * - denominator = total system ECTS (30)
 */
export function calculateOverallMidProgressProjectedGrade(ues: UE[], totalECTS = 30, treatEmptyAsZero: boolean = false): number | null {
  const gradedUEs = ues
    .map(ue => {
      const grade = calculateUEGrade(ue, treatEmptyAsZero);
      return grade !== null ? { grade, ects: ue.coef } : null;
    })
    .filter(Boolean) as { grade: number; ects: number }[];

  if (gradedUEs.length === 0) return null;

  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  return roundTo(weightedSum / (totalECTS * 100000), 5);
}

/**
 * Overall projected grade (/20) — assumes all grades entered
 */
export function calculateOverallProjectedGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => {
      const grade = calculateUEGrade(ue, treatEmptyAsZero);
      return grade !== null ? { grade, ects: ue.coef } : null;
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
