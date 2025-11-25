import { useParams } from "react-router";
import { useProfile } from "../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ProfileLoader from "../Components/Profile/ProfileLoader";

function RouteProfile() {
    const { fetchFullProfile } = useProfile();
    const { userId } = useParams();
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        (async () => {
            setIsWorking(true);
            try {
                await fetchFullProfile(userId);
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
        <p>Loading profile</p>
    </>)
}

export default RouteProfile;