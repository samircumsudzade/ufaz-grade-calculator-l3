function preciseRound(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateOverallGrade(ues: UE[], treatEmptyAsZero: boolean = false): number | null {
  const uesWithGrades = ues
    .map(ue => ({
      ...ue,
      calculatedGrade: calculateUEGrade(ue, treatEmptyAsZero) ?? (treatEmptyAsZero ? 0 : null)
    }))
    .filter(ue => ue.calculatedGrade !== null);

  if (uesWithGrades.length === 0) return null;

  const totalWeight = uesWithGrades.reduce((sum, ue) => sum + ue.coef, 0);
  if (totalWeight === 0) return null;

  const weightedSum = uesWithGrades.reduce((sum, ue) => sum + (ue.calculatedGrade! * ue.coef), 0);
  const finalGrade = weightedSum / totalWeight;

  // ✅ Use precise rounding to 5 decimals
  return preciseRound(finalGrade, 5);
}
