import IndexTopPlayers from "../components/index/IndexTopPlayers";
import { Alert, AlertTitle, Grid, Stack } from "@mui/material";
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

    const [alerts, setAlerts] = useState<any[]>([]);

    const [activeRuleset, setActiveRuleset] = useState('osu');
    const [isWorking, setIsWorking] = useState(0);

    const _setIsWorking = (val: boolean) => {
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
                <Alert key={index} variant='outlined' severity={alert.type} sx={{ 
                    position: 'relative',
                }}>
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.text}
                    <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {new Date(alert.created_at).toLocaleString()}
                    </div>
                </Alert>
            ))}
            <Grid container spacing={2} sx={{
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <Grid size={{ xs: 12, md: 9 }}>
                        <Stack spacing={1}>
                            <IndexLanding />
                            <IndexTopPlayers isWorking={isWorking > 0} setIsWorking={_setIsWorking} activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
                            <IndexScoreSubmissions isWorking={isWorking > 0} setIsWorking={_setIsWorking} activeRuleset={activeRuleset} setActiveRuleset={setActiveRuleset} />
                        </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
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