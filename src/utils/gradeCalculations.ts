export function calculateOverallMidProgressProjectedGrade(ues: UE[], totalECTS = 30): number | null {
  if (ues.length === 0) return null;

  // Only include UEs with at least one graded EC
  const gradedUEs = ues
    .map(ue => ({
      grade: calculateUEGrade(ue, false),
      ects: ue.coef
    }))
    .filter(ue => ue.grade !== null) as { grade: number, ects: number }[];

  if (gradedUEs.length === 0) return null;

  // Correct projected sum: sum(grade * ects) for graded UEs only
  const weightedSum = gradedUEs.reduce((sum, ue) => sum + ue.grade * ue.ects, 0);

  // Scale by total system ECTS (not by each UE's ECTS divided by totalECTS inside the loop!)
  const projected = weightedSum / totalECTS;

  return roundTo(projected, 5);
}