import { UE, EC, Assessment } from '../types/syllabus';

export function calculateECGrade(ec: EC, treatEmptyAsZero: boolean = false): number | null {
  if (treatEmptyAsZero) {
    const totalWeight = ec.assessments.reduce((sum, a) => sum + a.coef, 0);
    const weightedSum = ec.assessments.reduce((sum, a) => sum + ((a.grade ?? 0) * a.coef), 0);
    return weightedSum / totalWeight;
  } else {
    const validAssessments = ec.assessments.filter(a => a.grade !== undefined && a.grade !== null);
    if (validAssessments.length === 0) return null;
    const totalWeight = validAssessments.reduce((sum, a) => sum + a.coef, 0);
    const weightedSum = validAssessments.reduce((sum, a) => sum + (a.grade! * a.coef), 0);
    return weightedSum / totalWeight;
  }
}

export function calculateUEGrade(ue: UE, treatEmptyAsZero: boolean = false): number | null {
  if (treatEmptyAsZero) {
    const ecsWithGrades = ue.ecs.map(ec => ({
      ...ec,
      calculatedGrade: calculateECGrade(ec, true) ?? 0
    }));
    const totalWeight = ecsWithGrades.reduce((sum, ec) => sum + ec.coef, 0);
    const weightedSum = ecsWithGrades.reduce((sum, ec) => sum + (ec.calculatedGrade * ec.coef), 0);
    return weightedSum / totalWeight;
  } else {
    const ecsWithGrades = ue.ecs.map(ec => ({
      ...ec,
      calculatedGrade: calculateECGrade(ec, false)
    })).filter(ec => ec.calculatedGrade !== null);
    if (ecsWithGrades.length === 0) return null;
    const totalWeight = ecsWithGrades.reduce((sum, ec) => sum + ec.coef, 0);
    const weightedSum = ecsWithGrades.reduce((sum, ec) => sum + (ec.calculatedGrade! * ec.coef), 0);
    return weightedSum / totalWeight;
  }
}

export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  if (treatEmptyAsZero) {
    const uesWithGrades = ues.map(ue => ({
      ...ue,
      calculatedGrade: calculateUEGrade(ue, true) ?? 0
    }));
    const totalWeight = uesWithGrades.reduce((sum, ue) => sum + ue.coef, 0);
    const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade * ue.coef), 0);
    return weightedSum / totalWeight;
  } else {
    const uesWithGrades = ues.map(ue => ({
      ...ue,
      calculatedGrade: calculateUEGrade(ue, false)
    })).filter(ue => ue.calculatedGrade !== null);
    if (uesWithGrades.length === 0) return null;
    const totalWeight = uesWithGrades.reduce((sum, ue) => sum + ue.coef, 0);
    const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade! * ue.coef), 0);
    return weightedSum / totalWeight;
  }
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  return grade.toFixed(2);
}