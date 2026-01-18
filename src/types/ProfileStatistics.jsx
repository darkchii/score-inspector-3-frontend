import { GetRulesetNameFromId } from "../util/Helper";
import { ProfileRulesetStatistics } from "./ProfileRulesetStatistics";

export class ProfileStatistics {
    constructor(scores, beatmaps, packs, without_loved = false) {
        this.rulesets = {
            'total': new ProfileRulesetStatistics(beatmaps, packs, null, true, without_loved),
        };

        for (const score of scores) {
            const ruleset = GetRulesetNameFromId(score.ruleset_id);

            if (!this.rulesets[ruleset]) {
                this.rulesets[ruleset] = new ProfileRulesetStatistics(beatmaps, packs, ruleset, true, without_loved);
            }

            this.rulesets[ruleset].addScore(score);
            this.rulesets['total'].addScore(score);
        }

        for (const ruleset in this.rulesets) {
            this.rulesets[ruleset].calculate();
        }
    }

}