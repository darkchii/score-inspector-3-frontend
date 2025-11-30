import { Box, Container, Divider, Grid, Paper } from "@mui/material";
import ProfileGrades from "../ProfileGrades";
import ProfileHighlightCollection from "../ProfileHighlightCollection";
import ProfileRecentActivity from "../ProfileRecentActivity";

function ProfilePageMain() {
    return (
        <>
            <ProfileGrades />
            <Box sx={{ m: 1 }}>
                <ProfileHighlightCollection />
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>

                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 8 }}>
                        <Paper elevation={3} sx={{ padding: 2, height: '100%' }}>
                            <ProfileRecentActivity />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default ProfilePageMain;