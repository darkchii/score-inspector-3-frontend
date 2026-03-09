import { IPerformanceCalculator, IScore } from "../types";

class PerformanceCalculator implements IPerformanceCalculator {
    totalPerformance: number;
    
    constructor(score: IScore, overrides: any = null) {
        // Base implementation
    }
}

export default PerformanceCalculator;