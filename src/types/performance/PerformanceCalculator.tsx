import type { IPerformanceCalculator, IScore } from "../types";

class PerformanceCalculator implements IPerformanceCalculator {
    totalPerformance: number = 0;
    
    constructor(score: IScore, overrides: any = null) {
        // Base implementation
    }
}

export default PerformanceCalculator;