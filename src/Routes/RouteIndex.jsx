import IndexTopPlayers from "../components/index/IndexTopPlayers";
import { Alert, Grid, Stack } from "@mui/material";
import { usePageTitle } from "../providers/TitleProvider";
import IndexLanding from "../components/index/IndexLanding";
import IndexScoreSubmissions from "../components/index/IndexScoreSubmissions";
import IndexDiscordWidget from "../components/index/IndexDiscordWidget";
import IndexDonation from "../components/index/IndexDonation";
import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";

function RouteIndex() {
    usePageTitle(null); //reset to default title
    const { getAlerts } = useApi();

    const [alerts, setAlerts] = useState([]);

    const [activeRuleset, setActiveRuleset] = useState('osu');
    const [isWorking, setIsWorking] = useState(0);

    const _setIsWorking = (val) => {
        if(val)
            setIsWorking(prev => prev + 1);
        else
            setIsWorking(prev => prev - 1);
    }

    useEffect(() => {
        (async () => {
            try {
                const data = await getAlerts();
                console.log("Fetched alerts:", data);
                setAlerts(data);
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        })();
    }, []);

    return (<>
        <Stack spacing={1} sx={{ width: '100%', boxSizing: 'border-box', padding: 1 }}>
            {alerts.map((alert, index) => (
                <Alert key={index} severity={alert.type} sx={{ width: '100%' }}>
                    <strong>{alert.title}</strong><br />
                    {alert.text}
                </Alert>
            ))}
            <Grid container spacing={2} sx={{
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <Grid item size={{ xs: 12, md: 9 }}>
                    <Stack spacing={1}>
                        <IndexLanding />
                        <IndexTopPlayers isWorking={isWorking > 0} setIsWorking={_setIsWorking} activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
                        <IndexScoreSubmissions isWorking={isWorking > 0} setIsWorking={_setIsWorking} activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
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