export type GreenScoreGrade = 'A+' | 'A' | 'B' | 'C';

// Exclusive upper bounds in grams per kilometre; tune grades here.
export const GREEN_SCORE_THRESHOLDS = [
  { below: 80, grade: 'A+' },
  { below: 130, grade: 'A' },
  { below: 190, grade: 'B' },
  { below: Infinity, grade: 'C' },
] as const;

export function getGreenScore(gPerKm: number): GreenScoreGrade {
  return GREEN_SCORE_THRESHOLDS.find(({ below }) => gPerKm < below)?.grade ?? 'C';
}
