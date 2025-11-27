import { useParams } from "react-router";
import { useProfile } from "../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ProfileLoader from "../Components/Profile/ProfileLoader";
import ProfileHeader from "../Components/Profile/ProfileHeader";

function RouteProfile() {
    const { fetchFullProfile } = useProfile();
    const { userId } = useParams();
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        (async () => {
            setIsWorking(true);
            try {
                await fetchFullProfile(userId);
                //brief wait to show the completion
                await new Promise(resolve => setTimeout(resolve, 500));
                setIsWorking(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        })();
    }, [userId]);

    if(isWorking){
        return (<>
            <ProfileLoader />
        </>)
    }

    return (<>
        <ProfileHeader />
    </>)
}

export default RouteProfile;