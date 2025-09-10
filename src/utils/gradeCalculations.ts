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
  const TOTAL_ECTS = 30; // Total ECTS for the semester
  
  if (treatEmptyAsZero) {
    // For projected grade: use actual grades where available, assume 10/20 for missing UEs
    const uesWithGrades = ues.map(ue => {
      const ueGrade = calculateUEGrade(ue, false); // Don't treat empty as zero at UE level
      return {
        ...ue,
        calculatedGrade: ueGrade !== null ? ueGrade : 10 // Assume 10/20 for UEs with no data
      };
    });
    
    // Calculate weighted sum based on ECTS
    const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade * ue.ects), 0);
    const finalGrade = (weightedSum / TOTAL_ECTS);
    
    // Round to 5 decimal places
    return Math.round(finalGrade * 100000) / 100000;
  } else {
    // For current grade: only use UEs that have actual data
    const uesWithGrades = ues.map(ue => ({
      ...ue,
      calculatedGrade: calculateUEGrade(ue, false)
    })).filter(ue => ue.calculatedGrade !== null);
    
    if (uesWithGrades.length === 0) return null;
    
    // Calculate weighted sum based on ECTS
    const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade! * ue.ects), 0);
    const totalEcts = uesWithGrades.reduce((sum, ue) => sum + ue.ects, 0);
    const finalGrade = (weightedSum / totalEcts);
    
    // Round to 5 decimal places
    return Math.round(finalGrade * 100000) / 100000;
  }
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  // Show up to 5 decimal places but remove trailing zeros
  return parseFloat(grade.toFixed(5)).toString();
}