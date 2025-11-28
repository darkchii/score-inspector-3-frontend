import { useParams } from "react-router";
import { useProfile } from "../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ProfileLoader from "../Components/Profile/ProfileLoader";
import ProfileHeader from "../Components/Profile/ProfileHeader";
import { Box } from "@mui/material";
import ProfileMain from "../Components/Profile/Pages/ProfileMain";

const pageComponents = {
    'main': { component: ProfileMain, title: 'Profile' },
};

function RouteProfile() {
    const { fetchFullProfile, errorMessage, activeRuleset, setActiveRuleset } = useProfile();
    const { userId, ruleset } = useParams();
    const [page, setPage] = useState('main');
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        (async () => {
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

    useEffect(() => {
        if(ruleset !== activeRuleset){
            setActiveRuleset(ruleset || 'all');
        }
    }, [ruleset]);

    if (isWorking) {
        return (<>
            <ProfileLoader />
        </>)
    }

    return (<>
        <Box>
            {/* header */}
            <ProfileHeader />

            {/* page selection */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2, justifyContent: 'center' }}>
                {Object.keys(pageComponents).map((key) => {
                    return (
                        <Box key={key}
                            sx={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: page === key ? '2px solid black' : 'none'
                            }}
                            onClick={() => setPage(key)}
                        >
                            {pageComponents[key].title}
                        </Box>
                    );
                })}
            </Box>

            {/* page */}
            {
                pageComponents[page] &&
                (() => {
                    const PageComponent = pageComponents[page].component;
                    return <PageComponent />;
                })()
            }
        </Box>
    </>)
}

export default RouteProfile;