import MathHelper from "../../util/MathHelper";

export class DiffUtils {
    static Erf(x: number): number {
        if (x == 0) {
            return 0;
        }

        if (x == Infinity) {
            return 1;
        }

        if (x == -Infinity) {
            return -1;
        }

        if (isNaN(x)) {
            return NaN;
        }

        let t = 1.0 / (1.0 + 0.3275911 * Math.abs(x));
        let tau = t * (0.254829592
            + t * (-0.284496736
                + t * (1.421413741
                    + t * (-1.453152027
                        + t * 1.061405429))));

        let erf = 1.0 - tau * Math.exp(-x * x);

        return x >= 0 ? erf : -erf;
    }

    static ErfInv(x: number): number {
        if (x <= -1) {
            return -Infinity;
        }

        if (x >= 1) {
            return Infinity;
        }

        if (x === 0) {
            return 0;
        }

        const a = 0.147;
        let sgn = Math.sign(x);
        x = Math.abs(x);

        let ln = Math.log(1 - x * x);
        let t1 = 2 / (Math.PI * a) + ln / 2;
        let t2 = ln / a;
        let baseApprox = Math.sqrt(t1 * t1 - t2) - t1;

        let c = x >= 0.85 ? Math.pow((x - 0.85) / 0.293, 8) : 0;
        let erfInv = sgn * (Math.sqrt(baseApprox) + c);

        return erfInv;
    }

    static ReverseLerp(x: number, start: number, end: number): number {
        return MathHelper.clamp((x - start) / (end - start), 0, 1);
    }

    static Smoothstep(x: number, start: number, end: number): number {
        x = MathHelper.clamp((x - start) / (end - start), 0, 1);
        return x * x * (3 - 2 * x);
    }

    static Logistic(x: number, midPointOffset: number, multiplier: number, maxValue: number = 1): number {
        return maxValue / (1 + Math.exp(multiplier * (midPointOffset - x)));
    }
}