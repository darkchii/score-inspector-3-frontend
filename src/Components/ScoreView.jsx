import { Box, Grid, Stack, Typography } from '@mui/material';
import modalStyles from '../Style/modal.module.less';

function ScoreView({ score }) {

    console.log(modalStyles);
    return (
        <div className={modalStyles.modal__content}>
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    crossOrigin='anonymous'
                    className={modalStyles.modal__content__background}
                    style={{
                        zIndex: -2,
                        backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/fullsize.jpg)`,
                    }} />
                <div
                    className={modalStyles.modal__content__background}
                    style={{
                        zIndex: -1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }} />
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Grid container spacing={2} sx={{ padding: 2 }}>
                        <Grid item size={{ xs: 12, md: 3 }}>
                            {/* Left side content */}
                            <h2>Score by {score.user.username}</h2>
                        </Grid>
                        <Grid item size={{ xs: 12, md: 6 }}>
                            <Stack direction="column" spacing={1} sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    fontFamily: 'Torus !important',

                                    //they should stack on top of each other
                                    flexDirection: 'column',
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{score.beatmap.title}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{score.beatmap.artist}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item size={{ xs: 12, md: 6 }}>
                            {/* Full width content */}
                            <p>PP: {score.pp.toLocaleString()}</p>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </div>
    )
}

export default ScoreView;