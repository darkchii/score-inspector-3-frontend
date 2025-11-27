import { useProfile } from "../../Providers/ProfileProvider";

function ProfileRulesetSelector() {
    const { activeRuleset, setActiveRuleset } = useProfile();
    
    return null;
}

export default ProfileRulesetSelector;