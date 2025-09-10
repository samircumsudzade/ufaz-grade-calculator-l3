import { UE, EC } from '../types/syllabus';

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Calculate EC grade (weighted by EC coefs)
export function calculateECGrade(ec: EC, treatEmptyAsZero = false): number | null {
  const assessments = treatEmptyAsZero ? ec.assessments : ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);
  if (assessments.length === 0) return null;

  const totalCoef = assessments.reduce((sum, a) => sum + a.coef, 0);
  const weightedSum = assessments.reduce((sum, a) => sum + (a.grade ?? 0) * a.coef, 0);

  return totalCoef === 0 ? null : weightedSum / totalCoef;
}

// Calculate UE grade (weighted average of ECs)
export function calculateUEGrade(ue: UE, treatEmptyAsZero = false): number | null {
  const ecs = ue.ecs.map(ec => ({ grade: calculateECGrade(ec, treatEmptyAsZero), coef: ec.coef })).filter(ec => ec.grade !== null) as { grade: number, coef: number }[];
  if (ecs.length === 0) return null;

  const totalCoef = ecs.reduce((sum, ec) => sum + ec.coef, 0);
  const weightedSum = ecs.reduce((sum, ec) => sum + ec.grade * ec.coef, 0);

  return totalCoef === 0 ? null : weightedSum / totalCoef;
}

// Current grade (mid-progress) weighted by ECTS only
export function calculateOverallCurrentGrade(ues: UE[]): number | null {
  const gradedUEs = ues.map(ue => ({ grade: calculateUEGrade(ue, false), ects: ue.coef })).filter(ue => ue.grade !== null) as { grade: number, ects: number }[];
  if (gradedUEs.length === 0) return null;

  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);
  const totalECTS = gradedUEs.reduce((sum, ue) => sum + ue.ects, 0);

  return roundTo(weightedSum / totalECTS, 5);
}

// Mid-progress projected grade (/20) using only ECTS
export function calculateOverallMidProgressProjectedGrade(ues: UE[], totalECTS = 30, treatEmptyAsZero = false): number | null {
  let projectedSum = 0;

  for (const ue of ues) {
    const ecs = treatEmptyAsZero ? ue.ecs : ue.ecs.filter(ec => ec.grade !== undefined && ec.grade !== null);
    if (ecs.length === 0) continue;

    const totalECsCoef = ue.ecs.reduce((sum, ec) => sum + ec.coef, 0);
    if (totalECsCoef === 0) continue;

    const ueWeightedSum = ecs.reduce((sum, ec) => sum + (ec.grade ?? 0) * ec.coef, 0);
    const ueGrade = ueWeightedSum / totalECsCoef;

    // Only multiply by ECTS of the unit, ignore UE coef
    projectedSum += ueGrade * ue.coef / totalECTS;
  }

  return roundTo(projectedSum, 5);
}

// Final / projected grade weighted by ECTS
export function calculateOverallProjectedGrade(ues: UE[], treatEmptyAsZero = false): number | null {
  const uesWithGrades = ues.map(ue => ({ grade: calculateUEGrade(ue, treatEmptyAsZero), ects: ue.coef })).filter(ue => ue.grade !== null) as { grade: number, ects: number }[];
  if (uesWithGrades.length === 0) return null;

  const totalECTS = uesWithGrades.reduce((sum, ue) => sum + ue.ects, 0);
  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  return roundTo(weightedSum / totalECTS, 5);
}

export function calculateOverallGrade(ues: UE[], treatEmptyAsZero = false): number | null {
  return calculateOverallProjectedGrade(ues, treatEmptyAsZero);
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return parseFloat(grade.toFixed(5)).toString();
}
