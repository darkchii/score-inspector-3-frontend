import { useProfile } from "../../providers/ProfileProvider";
import RulesetSelector from "../RulesetSelector";

function ProfileRulesetSelector() {
    const { activeRuleset, setActiveRuleset, availableRulesets } = useProfile();
    
    return (
        <RulesetSelector
            activeRuleset={activeRuleset}
            onChange={setActiveRuleset}
            availableRulesets={availableRulesets}
        />
    )
}

export default ProfileRulesetSelector;