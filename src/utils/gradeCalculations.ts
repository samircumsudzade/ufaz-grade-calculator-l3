import { UE, EC } from '../types/syllabus';

/**
 * Round safely at the end
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate EC grade (scaled integer math)
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
    // scale grade to avoid floating drift
    const scaled = Math.round(grade * 100000); // keep 5 decimals as int
    weightedSum += scaled * a.coef;
    totalWeight += a.coef;
  }

  if (totalWeight === 0) return null;
  return weightedSum / (totalWeight * 100000); // only divide once
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
    const scaled = Math.round((ec.grade as number) * 100000);
    weightedSum += scaled * ec.coef;
    totalWeight += ec.coef;
  }

  if (totalWeight === 0) return null;
  return weightedSum / (totalWeight * 100000);
}

/**
 * Calculate overall grade
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
    const scaled = Math.round((ue.grade as number) * 100000);
    weightedSum += scaled * ue.coef;
    totalWeight += ue.coef;
  }

  if (totalWeight === 0) return null;

  const finalGrade = weightedSum / (totalWeight * 100000);
  return roundTo(finalGrade, 5); // ✅ only round once here
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
