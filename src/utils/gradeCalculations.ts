import { UE, EC } from '../types/syllabus';

/**
 * Calculate EC grade based on assessments
 * For current grade: only use filled assessments
 * For projected grade: assume 10/20 for missing assessments
 */
export function calculateECGrade(ec: EC, useProjection: boolean = false): number | null {
  if (useProjection) {
    // For projection: use all assessments, assume 10/20 for missing ones
    let weightedSum = 0;
    let totalWeight = 0;

    for (const assessment of ec.assessments) {
      const grade = assessment.grade !== undefined ? assessment.grade : 10;
      weightedSum += grade * assessment.coef;
      totalWeight += assessment.coef;
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  } else {
    // For current grade: only use assessments with actual grades
    const filledAssessments = ec.assessments.filter(a => a.grade !== undefined);
    
    if (filledAssessments.length === 0) return null;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const assessment of filledAssessments) {
      weightedSum += assessment.grade! * assessment.coef;
      totalWeight += assessment.coef;
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  }
}

/**
 * Calculate UE grade based on ECs
 * For current grade: only use ECs with grades
 * For projected grade: assume 10/20 for ECs without grades
 */
export function calculateUEGrade(ue: UE, useProjection: boolean = false): number | null {
  if (useProjection) {
    // For projection: use all ECs, calculate projected grade for each
    let weightedSum = 0;
    let totalWeight = 0;

    for (const ec of ue.ecs) {
      let ecGrade = calculateECGrade(ec, false); // Try to get current grade first
      if (ecGrade === null) {
        ecGrade = calculateECGrade(ec, true); // If no current grade, use projection
      }
      if (ecGrade === null) {
        ecGrade = 10; // Fallback to 10/20 if still null
      }

      weightedSum += ecGrade * ec.coef;
      totalWeight += ec.coef;
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  } else {
    // For current grade: only use ECs with actual grades
    const ecsWithGrades = ue.ecs
      .map(ec => ({
        grade: calculateECGrade(ec, false),
        coef: ec.coef
      }))
      .filter(ec => ec.grade !== null);

    if (ecsWithGrades.length === 0) return null;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const ec of ecsWithGrades) {
      weightedSum += ec.grade! * ec.coef;
      totalWeight += ec.coef;
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  }
}

/**
 * Calculate overall semester grade
 * For current grade: only use UEs with grades
 * For projected grade: use all UEs with projection
 */
export function calculateOverallGrade(ues: UE[], useProjection: boolean = false): number | null {
  if (useProjection) {
    // For projection: use all UEs
    let weightedSum = 0;
    let totalWeight = 0;

    for (const ue of ues) {
      let ueGrade = calculateUEGrade(ue, false); // Try current grade first
      if (ueGrade === null) {
        ueGrade = calculateUEGrade(ue, true); // If no current grade, use projection
      }
      if (ueGrade === null) {
        ueGrade = 10; // Fallback to 10/20
      }

      weightedSum += ueGrade * ue.coef;
      totalWeight += ue.coef;
    }

    if (totalWeight === 0) return null;
    
    const finalGrade = weightedSum / totalWeight;
    // Round final result to 5 decimal places
    return Math.round(finalGrade * 100000) / 100000;
  } else {
    // For current grade: only use UEs with actual grades
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
      weightedSum += ue.grade! * ue.coef;
      totalWeight += ue.coef;
    }

    if (totalWeight === 0) return null;

    const finalGrade = weightedSum / totalWeight;
    // Round final result to 5 decimal places
    return Math.round(finalGrade * 100000) / 100000;
  }
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number | null): string {
  if (grade === null) return 'N/A';
  
  // Convert to string and remove trailing zeros
  const formatted = grade.toFixed(5);
  return parseFloat(formatted).toString();
}