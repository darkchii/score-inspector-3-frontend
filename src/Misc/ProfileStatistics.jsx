import { GetRulesetNameFromId } from "./Helper";
import { ProfileRulesetStatistics } from "./ProfileRulesetStatistics";

export class ProfileStatistics {
    constructor(scores, beatmaps) {
        this.rulesets = {
            'total': new ProfileRulesetStatistics(beatmaps),
        };

        for (const score of scores) {
            const ruleset = GetRulesetNameFromId(score.ruleset_id);

            if (!this.rulesets[ruleset]) {
                this.rulesets[ruleset] = new ProfileRulesetStatistics(beatmaps, ruleset);
            }

            this.rulesets[ruleset].addScore(score);
            this.rulesets['total'].addScore(score);
        }

        for (const ruleset in this.rulesets) {
            this.rulesets[ruleset].calculate();
        }
    }

}