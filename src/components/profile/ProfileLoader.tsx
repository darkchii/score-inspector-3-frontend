import { Avatar, Box, Card, CircularProgress, Collapse, Divider, Grid, Grow, LinearProgress, List, ListItem, ListItemText, Skeleton, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import { TransitionGroup } from "react-transition-group";
import { green, orange, red } from "@mui/material/colors";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

function ProfileLoader() {
    //This is the display shown while the profile is loading, showing details of whats going on
    const { userLive, scoresLive, errorMessage, fetchLog, isFinished } = useProfile();

    return (<>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Grow in={true} timeout={500}>
                <Card sx={{
                    p: 2,
                    m: 2,
                    width: '650px',
                    //minWidth mobile 100%
                    '@media (max-width:650px)': {
                        minWidth: '100%',
                    }
                }}>
                    <Box>
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <Box sx={{ width: '150px', height: '150px' }}>
                                {
                                    userLive?.osuAlternative?.user_id ? <Avatar
                                        variant="circular"
                                        sx={{ width: '100%', height: '100%' }}
                                        src={`https://a.ppy.sh/${userLive.osuAlternative.user_id}`}
                                    /> : <Skeleton variant="circular" width={'100%'} height={'100%'} />
                                }
                            </Box>
                            <Box>
                                <Typography variant="h6">{userLive?.osuAlternative?.username || 'Loading user'}</Typography>
                            </Box>
                            {/* Progress user */}
                            {
                                errorMessage ?
                                    //big red error icon (same size as circular progress)
                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <ErrorIcon sx={{ color: red[500], fontSize: 80 }} />
                                        <Typography sx={{ color: red[500] }}>{errorMessage}</Typography>
                                    </Box>

                                    : (isFinished ?
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <CheckCircleIcon sx={{ color: green[500], fontSize: 80 }} />
                                        </Box>
                                        :
                                        <CircularProgress
                                            variant="indeterminate"
                                            size={80}
                                        />)
                            }
                            <Divider />
                            {
                                fetchLog.length > 0 &&
                                <Box sx={{ width: '100%' }}>
                                    <List dense>
                                        <TransitionGroup>
                                            {fetchLog.map((log, index) => (
                                                <Collapse key={index}>
                                                    <ListItem>
                                                        {/* <ListItemText primary={log} /> */}
                                                        {/* format log to show working/finished using icon/circularprogress */}
                                                        <ListItemText primary={
                                                            log.startsWith("%working%") ?
                                                                (errorMessage ?
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <ErrorIcon sx={{ color: red[500] }} />
                                                                        <span>{log.replace("%working% ", "")}</span>
                                                                    </Box>
                                                                    :
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <CircularProgress size={16} />
                                                                        <span>{log.replace("%working% ", "")}</span>
                                                                    </Box>)
                                                                : log.startsWith("%finished%") ?
                                                                    (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: green[500] }}>
                                                                        <CheckCircleIcon fontSize="small" />
                                                                        <span>{log.replace("%finished% ", "")}</span>
                                                                    </Box>)
                                                                : log.startsWith("%warning%") ?
                                                                    (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: orange[700] }}>
                                                                        <WarningIcon fontSize="small" />
                                                                        <span>{log.replace("%warning% ", "")}</span>
                                                                    </Box>)
                                                                    : log
                                                        } />
                                                    </ListItem>
                                                </Collapse>
                                            ))}
                                        </TransitionGroup>
                                    </List>
                                </Box>
                            }
                        </Box>
                    </Box>
                </Card>
            </Grow>
        </Box>
    </>)
}

export default ProfileLoader;