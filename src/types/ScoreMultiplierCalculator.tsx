import { GetMod } from "../util/ModHelper";
import type { IBeatmap, IFruitsScoreMultiplierCalculator, IManiaScoreMultiplierCalculator, IOsuScoreMultiplierCalculatorV1, IOsuScoreMultiplierCalculatorV2, IScore, IScoreMod, IScoreMultiplierCalculator, IScoreMultiplierContext, ITaikoScoreMultiplierCalculator } from "./types";

export class ScoreMultiplierCalculator implements IScoreMultiplierCalculator {
    context: IScoreMultiplierContext;
    combinationMultipliers: Map<string[], ((mods: IScoreMod[]) => number)>;
    singleMultipliers: Map<string, ((mod: IScoreMod) => number)>;

    constructor(score: IScore) {
        this.context = { beatmap: score.beatmap, score };
        this.combinationMultipliers = new Map<string[], ((mods: IScoreMod[]) => number)>();
        this.singleMultipliers = new Map<string, ((mod: IScoreMod) => number)>();
    }

    Single(acronym: string, hasMultiplier: number | ((mod: IScoreMod) => number)): void {
        if (typeof hasMultiplier === "number") {
            this.singleMultipliers.set(acronym, () => hasMultiplier);
        } else {
            this.singleMultipliers.set(acronym, hasMultiplier);
        }
    }

    Combination(acronyms: string[], hasMultiplier: number | ((mods: IScoreMod[]) => number)): void {
        if (typeof hasMultiplier === "number") {
            this.combinationMultipliers.set(acronyms, () => hasMultiplier);
        } else {
            this.combinationMultipliers.set(acronyms, hasMultiplier);
        }
    }

    Calculate(): [number, { [key: string]: number }] {
        let multiplier = 1.0;
        let multiplierBreakdown: { [key: string]: number } = {};

        if(this.context.score.mods.length === 0) {
            return [multiplier, multiplierBreakdown];
        }

        let remainingModTypes = new Set(this.context.score.mods.map(mod => mod.acronym));

        if(this.context.score.mods.length > 1){
            for(const [acronyms, multiplierFunc] of this.combinationMultipliers.entries()) {
                if(acronyms.every(acronym => this.context.score.mods.some(mod => mod.acronym === acronym))) {
                    let instances = acronyms.map(acronym => this.context.score.mods.filter(mod => mod.acronym === acronym).length);
                    multiplier *= multiplierFunc(this.context.score.mods);
                    remainingModTypes = new Set([...remainingModTypes].filter(acronym => !acronyms.includes(acronym)));
                    multiplierBreakdown[acronyms.join("+")] = multiplierFunc(this.context.score.mods);
                }
            }
        }

        for(const acronym of remainingModTypes) {
            if(this.singleMultipliers.has(acronym)) {
                const mod = this.context.score.mods.find(mod => mod.acronym === acronym);
                if(mod) {
                    multiplier *= this.singleMultipliers.get(acronym)!(mod);
                    multiplierBreakdown[acronym] = this.singleMultipliers.get(acronym)!(mod);
                }
            }
        }

        return [multiplier, multiplierBreakdown];
    }
}

export class OsuScoreMultiplierCalculatorV1 extends ScoreMultiplierCalculator implements IOsuScoreMultiplierCalculatorV1 {
    constructor(score: IScore) {
        super(score);

        // Diff Reduction
        this.Single("EZ", 0.5);
        this.Single("NF", 0.5);
        this.Single("HT", (mod: IScoreMod) => { return this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75) });
        this.Single("DC", (mod: IScoreMod) => { return this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75) });

        // Diff Increase
        this.Single("HR", (mod: IScoreMod) => { return !mod.settings ? 1.06 : 1.0 });
        this.Single("DT", (mod: IScoreMod) => { return this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5) });
        this.Single("NC", (mod: IScoreMod) => { return this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5) });
        this.Single("HD", (mod: IScoreMod) => { return !mod.settings ? 1.06 : 1.0 });
        this.Single("FL", (mod: IScoreMod) => { return !mod.settings ? 1.12 : 1.0 });
        this.Single("BL", (mod: IScoreMod) => { return !mod.settings ? 1.12 : 1.0 });

        // Conversion
        this.Single("TP", 0.1);
        this.Single("DA", 0.5);
        this.Single("CL", 0.96);

        // Automation
        this.Single("RX", 0.1);
        this.Single("AP", 0.1);
        this.Single("SO", 0.9);

        // Fun
        this.Single("WU", 0.5);
        this.Single("WD", 0.5);
        this.Single("MG", 0.5);
        this.Single("AS", 0.5);
        this.Single("SY", 0.8);
    }

    rateAdjustMultiplier(speedChange: number): number {
        let value = (speedChange * 10) / 10.0;

        value -= 1;

        if (speedChange >= 1) {
            return 1 + (value / 5);
        } else {
            return 0.6 + value;
        }
    }
}

export class OsuScoreMultiplierCalculatorV2 extends ScoreMultiplierCalculator implements IOsuScoreMultiplierCalculatorV2 {
    constructor(score: IScore) {
        super(score);

        // Diff Reduction
        this.Single("EZ", (mod: IScoreMod) => { return this.easyMultiplier(mod) });
        this.Single("NF", 0.5);
        this.Single("HT", (mod: IScoreMod) => { return this.halfTimeMultiplier(mod.settings?.speed_change ?? 0.75) });
        this.Single("DC", (mod: IScoreMod) => { return this.halfTimeMultiplier(mod.settings?.speed_change ?? 0.75) });

        // Diff Increase
        this.Single("HR", 1.09);
        this.Single("DT", (mod: IScoreMod) => { return this.doubleTimeMultiplier(mod.settings?.speed_change ?? 1.5) });
        this.Single("NC", (mod: IScoreMod) => { return this.doubleTimeMultiplier(mod.settings?.speed_change ?? 1.5) });

        const blinds_multiplier = 1.24;

        this.Combination(["HD", "BL"], blinds_multiplier);

        this.Combination(["HD", "WG"], (mods: IScoreMod[]) => this.hiddenMultiplier(GetMod(mods, "HD"), true));
        this.Combination(["HD", "GR"], (mods: IScoreMod[]) => this.hiddenMultiplier(GetMod(mods, "HD"), true));
        this.Combination(["HD", "DF"], (mods: IScoreMod[]) => this.hiddenMultiplier(GetMod(mods, "HD"), true) * this.deflateMultiplier(GetMod(mods, "DF")));
        this.Combination(["HD", "RP"], (mods: IScoreMod[]) => this.hiddenMultiplier(GetMod(mods, "HD"), true));
        this.Combination(["HD", "DP"], (mods: IScoreMod[]) => this.hiddenMultiplier(GetMod(mods, "HD"), true));

        this.Single("HD", (mod: IScoreMod) => this.hiddenMultiplier(mod, false));

        this.Combination(["TC", "BL"], blinds_multiplier);
        this.Single("TC", 1.02);

        this.Combination(["FL", "FR"], (mods: IScoreMod[]) => (1 + (this.flashlightMultiplier(GetMod(mods, "FL")) - 1) * 0.5));
        this.Single("FL", (mod: IScoreMod) => this.flashlightMultiplier(mod));

        this.Single("BL", blinds_multiplier);

        // Conversion
        this.Single("TP", 0.1);
        this.Single("DA", (mod: IScoreMod) => this.difficultyAdjustMultiplier(mod, this.context.beatmap));
        this.Single("CL", (mod: IScoreMod) => { return (mod.settings?.classic_note_lock ?? true) ? 0.985 : 0.96 });
        this.Single("RD", 0.7);

        // Automation
        this.Single("RX", 0.1);
        this.Single("AP", 0.1);
        this.Single("SO", 0.95);

        // Fun
        this.Single("DF", (mod: IScoreMod) => this.deflateMultiplier(mod));
        this.Single("WU", (mod: IScoreMod) => this.timeRampMultiplier(mod));
        this.Single("WD", (mod: IScoreMod) => this.timeRampMultiplier(mod));
        this.Single("AD", 0.7);
        this.Single("MG", (mod: IScoreMod) => 0.7 - ((mod.settings?.attraction_strength ?? 0.5) * 0.6));
        this.Single("AS", 0.1);
        this.Single("SY", 0.99);
    }

    easyMultiplier(mod: IScoreMod): number {
        let value = 0.8 - Math.max(0, 0.1 * ((mod.settings?.retries ?? 2) - 2));
        return Math.max(0.4, value);
    }

    halfTimeMultiplier(speedChange: number): number {
        return (speedChange * 20) / 20 * 1.4 - 0.5;
    }

    doubleTimeMultiplier(speedChange: number): number {
        let value = (speedChange * 10) / 10.0;

        let penalty = value != 1.5 && value != 0.0 ? 0.01 : 0.0;

        return (value - 1) * 0.46 + 1 - penalty;
    }

    hiddenMultiplier(hiddenMod: IScoreMod, otherModsProvideTimingInfo: boolean): number {
        let value = 1.04;

        if (hiddenMod.settings?.only_fade_approach_circles) {
            value -= 0.02;
        }

        if (otherModsProvideTimingInfo) {
            value -= 0.02;
        }

        return value;
    }

    deflateMultiplier(deflateMod: IScoreMod): number {
        return 1.0 - Math.max(0, 0.02 * ((deflateMod.settings?.start_scale ?? 2) - 2))
    }

    flashlightMultiplier(flashlightMod: IScoreMod): number {
        let value = Math.max(1.02, Math.min(1.2, 1.2 - 0.2 * (flashlightMod.settings?.size_multiplier ?? 1) / 100));

        if(flashlightMod.settings?.combo_based_size) {
            value = 1 + (value - 1) / 5;
        }

        return value;
    }

    difficultyAdjustMultiplier(mod: IScoreMod, beatmap: IBeatmap): number {
        let selectedCircleSize = mod.settings?.circle_size ?? beatmap.cs;
        let selectedDrainRate = mod.settings?.drain_rate ?? beatmap.hp;
        let selectedOverallDifficulty = mod.settings?.overall_difficulty ?? beatmap.od;
        let selectedApproachRate = mod.settings?.approach_rate ?? beatmap.ar;

        let csDiff = Math.abs(selectedCircleSize - beatmap.cs);
        let hpDiff = Math.abs(selectedDrainRate - beatmap.hp);
        let odDiff = Math.abs(selectedOverallDifficulty - beatmap.od);
        let arDiff = Math.abs(selectedApproachRate - beatmap.ar);

        let csMultiplier = Math.max(0.1, 1.0 - csDiff * 0.5);
        let hpMultiplier = Math.max(0.1, 1.0 - hpDiff * 0.5);
        let odMultiplier = Math.max(0.1, 1.0 - odDiff * 0.5);
        let arMultiplier = Math.max(0.1, 1.0 - arDiff * 0.5);

        return Math.max(0.1, csMultiplier * hpMultiplier * odMultiplier * arMultiplier);
    }

    timeRampMultiplier(mod: IScoreMod): number {
        let minSpeed = Math.min(mod.settings?.initial_rate ?? 1.0, mod.settings?.final_rate ?? 1.0);
        let maxSpeed = Math.max(mod.settings?.initial_rate ?? 1.0, mod.settings?.final_rate ?? 1.0);

        let minSpeedMultiplier = minSpeed < 1.0 ? this.halfTimeMultiplier(minSpeed) : this.doubleTimeMultiplier(minSpeed);
        let maxSpeedMultiplier = maxSpeed < 1.0 ? this.halfTimeMultiplier(maxSpeed) : this.doubleTimeMultiplier(maxSpeed);

        return 0.8 * minSpeedMultiplier + 0.2 * maxSpeedMultiplier;
    }
}

export class TaikoScoreMultiplierCalculator extends ScoreMultiplierCalculator implements ITaikoScoreMultiplierCalculator {
    constructor(score: IScore) {
        super(score);

        // Diff Reduction
        this.Single("EZ", 0.5);
        this.Single("NF", 0.5);
        this.Single("HT", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));
        this.Single("DC", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));
        this.Single("SR", 0.6);

        // Diff Increase
        this.Single("HR", (mod: IScoreMod) => { return !mod.settings ? 1.06 : 1.0 });
        this.Single("DT", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5));
        this.Single("NC", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5));
        this.Single("HD", (mod: IScoreMod) => { return !mod.settings ? 1.06 : 1.0 });
        this.Single("FL", (mod: IScoreMod) => { return !mod.settings ? 1.12 : 1.0 });

        // Conversion
        this.Single("DA", 0.5);
        this.Single("CL", (mod: IScoreMod) => this.classicMultiplier(this.context.score));
        this.Single("CS", 0.9);

        // Automation
        this.Single("RX", 0.1);

        // Fun
        this.Single("WU", 0.5);
        this.Single("WD", 0.5);
        this.Single("AS", 0.5);
    }

    rateAdjustMultiplier(speedChange: number): number {
        let value = (speedChange * 10) / 10.0;

        value -= 1;

        if(speedChange >= 1) {
            return 1 + (value / 5);
        } else {
            return 0.6 + value;
        }
    }

    classicMultiplier(score?: IScore): number {
        if(score && (score.build_id ?? 0) < 30000017) { //?
            return 0.96;
        }
        return 1;
    }
}

export class FruitsScoreMultiplierCalculator extends ScoreMultiplierCalculator implements IFruitsScoreMultiplierCalculator {
    constructor(score: IScore) {
        super(score);

        // Diff Reduction
        this.Single("EZ", 0.5);
        this.Single("NF", 0.5);
        this.Single("HT", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));
        this.Single("DC", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));

        // Diff Increase
        this.Single("HR", (mod: IScoreMod) => { return !mod.settings ? 1.12 : 1.0 });
        this.Single("DT", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5));
        this.Single("NC", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 1.5));
        this.Single("HD", (mod: IScoreMod) => { return !mod.settings ? 1.06 : 1.0 });
        this.Single("FL", (mod: IScoreMod) => { return !mod.settings ? 1.12 : 1.0 });

        // Conversion
        this.Single("DA", 0.5);
        this.Single("CL", (mod: IScoreMod) => this.classicMultiplier(this.context.score));

        // Automation
        this.Single("RX", 0.1);

        // Fun
        this.Single("WU", 0.5);
        this.Single("WD", 0.5);
        this.Single("AS", 0.8);
    }

    rateAdjustMultiplier(speedChange: number): number {
        let value = (speedChange * 10) / 10.0;

        value -= 1;

        if(speedChange >= 1) {
            return 1 + (value / 5);
        }
        else {
            return 0.6 + value;
        }
    }

    classicMultiplier(score?: IScore): number {
        if(score && (score.build_id ?? 0) < 30000017) { //?
            return 0.96;
        }

        return 1;
    }
}

export class ManiaScoreMultiplierCalculator extends ScoreMultiplierCalculator implements IManiaScoreMultiplierCalculator {
    constructor(score: IScore) {
        super(score);

        // Diff Reduction
        this.Single("EZ", 0.5);
        this.Single("NF", 0.5);
        this.Single("HT", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));
        this.Single("DC", (mod: IScoreMod) => this.rateAdjustMultiplier(mod.settings?.speed_change ?? 0.75));
        this.Single("NR", 0.5);

        // Diff Increase

        // Conversion
        this.Single("DA", 0.5);
        this.Single("CL", (mod: IScoreMod) => this.classicMultiplier(this.context.score));
        this.Single("CS", 0.9);
        this.Single("HO", 0.9);
        this.Single("1K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("2K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("3K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("4K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("5K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("6K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("7K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("8K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("9K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));
        this.Single("10K", (mod: IScoreMod) => this.keyModMultiplier(this.context.score));

        // Fun
        this.Single("WU", 0.5);
        this.Single("WD", 0.5);
        this.Single("AS", 0.5);
    }

    old_key_mod_multiplier = 1;
    new_key_mod_multiplier = 0.9;
    build_id_cutoff = 8084;
    keyModMultiplier(score?: IScore): number {
        if(!score){
            return this.new_key_mod_multiplier;
        }

        let clientVersion = score.build_id;

        //if 
        if(clientVersion) {
            if(clientVersion < this.build_id_cutoff) {
                return this.old_key_mod_multiplier;
            }

            return this.new_key_mod_multiplier;
        }

        //check if score.ended_at is < 2025-07-18
        if(score.ended_at) {
            let endedAt = new Date(score.ended_at);
            let cutoffDate = new Date("2025-07-18T00:00:00Z");

            if(endedAt < cutoffDate) {
                return this.old_key_mod_multiplier;
            }
        }

        return this.new_key_mod_multiplier;
    }

    rateAdjustMultiplier(speedChange: number): number {
        let value = (speedChange * 10) / 10.0;

        value -= 1;

        if(speedChange >= 1) {
            return 1 + (value / 5);
        } else {
            return 0.6 + value;
        }
    }

    classicMultiplier(score?: IScore): number {
        if(score && (score.build_id ?? 0) < 30000017) { //?
            return 0.96;
        }

        return 1;
    }
}

export function GetScoreMultiplierCalculator(score: IScore): IScoreMultiplierCalculator {
    switch(score.ruleset_id){
        case 0:
            if(!score.build_id) { //Stable scores get the old multiplier
                return new OsuScoreMultiplierCalculatorV1(score);
            }
            return new OsuScoreMultiplierCalculatorV2(score);
        case 1:
            return new TaikoScoreMultiplierCalculator(score);
        case 2:
            return new FruitsScoreMultiplierCalculator(score);
        case 3:
            return new ManiaScoreMultiplierCalculator(score);
        default:
            return new ScoreMultiplierCalculator(score);
    }
}