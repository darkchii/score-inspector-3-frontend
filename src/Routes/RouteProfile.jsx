import { useParams } from "react-router";
import { useProfile } from "../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ProfileLoader from "../Components/Profile/ProfileLoader";
import ProfileHeader from "../Components/Profile/ProfileHeader";
import { Box, Collapse, Fade, Tab, Tabs, useTheme } from "@mui/material";
import ProfilePageMain from "../Components/Profile/Pages/ProfilePageMain";
import ProfilePageSessions from "../Components/Profile/Pages/ProfilePageSessions";
import ProfilePageScores from "../Components/Profile/Pages/ProfilePageScores";
import ProfilePagePacks from "../Components/Profile/Pages/ProfilePagePacks";
import NumberFlow from "@number-flow/react";
import ProfilePageCharts from "../Components/Profile/Pages/ProfilePageCharts";

const pageComponents = {
    'main': { component: ProfilePageMain, title: 'Overview' },
    'sessions': { component: ProfilePageSessions, title: 'Sessions' },
    'scores': { component: ProfilePageScores, title: 'Scores' },
    'charts': { component: ProfilePageCharts, title: 'Charts' },
    'packs': { component: ProfilePagePacks, title: 'Packs' },
};

function RouteProfile() {
    const { fetchFullProfile, errorMessage, activeRuleset, setActiveRuleset, userLive, getRulesetStatistics } = useProfile();
    const { userId, ruleset, page } = useParams();
    const [activePage, setPage] = useState('main');
    const [isWorking, setIsWorking] = useState(false);
    const theme = useTheme();

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
        window.history.replaceState(null, null, `/user/${userId}/${activeRuleset || 'all'}/${activePage || 'main'}`);

        console.log({ activeRuleset, activePage });
    }, [activeRuleset, activePage]);

    useEffect(() => {
        if (ruleset !== activeRuleset) {
            setActiveRuleset(ruleset || 'all');
        }
    }, [ruleset]);

    useEffect(() => {
        if (page !== activePage) {
            setPage(page || 'main');
        }
    }, [page]);

    if (isWorking) {
        return (<>
            <ProfileLoader />
        </>)
    }

    return (<>
        <Box>
            {
                userLive?.is_sync === false &&
                <Box sx={{ width: '100%', p: 1, bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText, textAlign: 'center' }}>
                    <strong>Warning:</strong> User is not yet synced. Data may be incomplete or outdated.
                </Box>
            }

            {
                getRulesetStatistics(activeRuleset)?.scores_set?.missing_difficulty > 0 &&
                <Box sx={{ width: '100%', p: 1, bgcolor: theme.palette.warning.main, color: theme.palette.warning.contrastText, textAlign: 'center' }}>
                    <strong>Warning:</strong> <NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.missing_difficulty} /> scores have no or outdated difficulty attributes. They will likely show incorrect data. They will be processed soon.
                </Box>
            }

            {/* header */}
            <ProfileHeader />

            {/* page selection */}
            <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                <Tabs aria-label='profile-page-tabs' value={activePage} textColor="primary" indicatorColor="primary">
                    {Object.keys(pageComponents).map((key) => {
                        return (
                            <Tab
                                key={`profile-page-tab-${key}`}
                                label={pageComponents[key].title}
                                value={key}
                                onClick={() => setPage(key)}
                            />
                        );
                    })}
                </Tabs>
            </Box>

            {
                Object.keys(pageComponents).map((key) => {
                    return (
                        <Collapse key={key} in={activePage === key} unmountOnExit>
                            <Box>
                                {(() => {
                                    const PageComponent = pageComponents[key].component;
                                    return <PageComponent />;
                                })()}
                            </Box>
                        </Collapse>
                    )
                })
            }
        </Box>
    </>)
}

export default RouteProfile;