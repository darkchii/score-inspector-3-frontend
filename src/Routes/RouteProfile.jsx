import { useParams } from "react-router";
import { useProfile } from "../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ProfileLoader from "../Components/Profile/ProfileLoader";
import ProfileHeader from "../Components/Profile/ProfileHeader";

function RouteProfile() {
    const { fetchFullProfile, errorMessage, activeRuleset, setActiveRuleset } = useProfile();
    const { userId, ruleset } = useParams();
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        (async () => {
            setActiveRuleset(ruleset || 'all');
            setIsWorking(true);
            try {
                await fetchFullProfile(userId);
                //brief wait to show the completion
                if (!errorMessage) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setIsWorking(false);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        })();
    }, [userId]);

    useEffect(() => {
        //change url without reloading
        window.history.replaceState(null, null, `/user/${userId}/${activeRuleset || 'all'}`);
    }, [activeRuleset]);

    if (isWorking) {
        return (<>
            <ProfileLoader />
        </>)
    }

    return (<>
        <ProfileHeader />
    </>)
}

export default RouteProfile;