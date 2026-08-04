class MathHelper {
    static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(value1: number, value2: number, amount: number): number {
        return value1 + (value2 - value1) * MathHelper.clamp(amount, 0, 1);
    }
}

export default MathHelper;