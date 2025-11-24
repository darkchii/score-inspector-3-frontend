import { Avatar, Box, Card, Grid, Skeleton, Typography } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";

function ProfileLoader() {
    //This is the display shown while the profile is loading, showing details of whats going on
    const { userLive } = useProfile();

    return (<>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Card sx={{
                p: 2,
                m: 2,
                width: '650px',
                height: '350px',
                //minWidth mobile 100%
                '@media (max-width:650px)': {
                    minWidth: '100%',
                }
            }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    <Grid item size={4}>
                        {/* center vertically and horizontally */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Box sx={{width:'150px', height:'150px'}}>
                                {
                                    userLive?.user_id ? <Avatar
                                        variant="rounded"
                                        sx={{ width: '100%', height: '100%' }}
                                        src={`https://a.ppy.sh/${userLive.user_id}`}
                                    /> : <Skeleton variant="rectangular" width={'100%'} height={'100%'} />
                                }
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item size={8}>
                        <Typography variant="h5">Loading {userLive?.username || 'user data'}...</Typography>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    </>)
}

export default ProfileLoader;