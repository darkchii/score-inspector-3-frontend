class MathHelper {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(value1, value2, amount) {
        return value1 + (value2 - value1) * MathHelper.clamp(amount, 0, 1);
    }
}

export default MathHelper;