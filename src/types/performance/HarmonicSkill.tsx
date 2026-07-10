export class HarmonicSkill {
    static DifficultyToPerformance(difficulty: number): number {
        return 4.0 * Math.pow(difficulty, 3);
    }
}