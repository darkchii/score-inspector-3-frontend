import IndexTopPlayers from "../components/index/IndexTopPlayers";
import { Grid, Stack } from "@mui/material";
import { usePageTitle } from "../providers/TitleProvider";
import IndexLanding from "../components/index/IndexLanding";
import IndexScoreSubmissions from "../components/index/IndexScoreSubmissions";
import IndexDiscordWidget from "../components/index/IndexDiscordWidget";
import IndexDonation from "../components/index/IndexDonation";
import { useState } from "react";

function RouteIndex() {
    usePageTitle(null); //reset to default title

    const [activeRuleset, setActiveRuleset] = useState('osu');

    return (<>
        <Stack spacing={0} sx={{ width: '100%', boxSizing: 'border-box', padding: 1 }}>
            <Grid container spacing={2} sx={{
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <Grid item size={{ xs: 12, md: 9 }}>
                    <Stack spacing={1}>
                        <IndexLanding />
                        <IndexTopPlayers activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
                        <IndexScoreSubmissions activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
                    </Stack>
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <Stack spacing={1}>
                        <IndexDonation />
                        <IndexDiscordWidget />
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    </>)
}

export default RouteIndex;