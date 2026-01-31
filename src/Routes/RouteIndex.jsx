import IndexTopPlayers from "../components/index/IndexTopPlayers";
import { Grid } from "@mui/material";

function RouteIndex() {
    return (<>
        {/* <IndexTopPlayers /> */}
        <Grid container spacing={2} sx={{
            padding: 2,
            width: '100%',
            boxSizing: 'border-box',
        }}>
            <Grid item size={{ xs: 12, md: 8 }}>
                <IndexTopPlayers />
            </Grid>
        </Grid>
    </>)
}

export default RouteIndex;