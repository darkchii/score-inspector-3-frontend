import IndexTopPlayers from "../components/index/IndexTopPlayers";
import { Grid, Stack } from "@mui/material";
import { usePageTitle } from "../providers/TitleProvider";
import IndexLanding from "../components/index/IndexLanding";
import IndexScoreSubmissions from "../components/index/IndexScoreSubmissions";

function RouteIndex() {
    usePageTitle(null); //reset to default title

    return (<>
        {/* <IndexTopPlayers /> */}
        <Stack spacing={1} sx={{ width: '100%', boxSizing: 'border-box', padding: 1 }}>
            <IndexLanding />
            <Grid container spacing={2} sx={{
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <Grid item size={{ xs: 12, md: 9 }}>
                    <Stack spacing={1}>
                        <IndexTopPlayers />
                        <IndexScoreSubmissions />
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    </>)
}

export default RouteIndex;