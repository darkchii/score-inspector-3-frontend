import { Avatar, Box, Container, Fade, Typography, useTheme } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import ProfileRulesetSelector from "./ProfileRulesetSelector";
import { getFlagIcon } from "../../Data/Textures/TextureDatabase";
import NumberFlow from "@number-flow/react";
import { getContrastColor } from "../../Misc/Helper";

const _profileHeaderImageRatio = 20 / 5; //Width / Height (2000x500)

function ProfileHeader() {
    const { userLive, activeRuleset, getRulesetUser } = useProfile();
    const theme = useTheme();

    if (!userLive) {
        return null;
    }

    return (
        <div>
            {/* the header should be 2000x500 (or adjusted proportionally), userLive.osuApi.cover_url is the background image, there will be stuff on top of it */}
            <Box sx={{
                width: '100%',
                height: `calc(100vw / ${_profileHeaderImageRatio})`,
                maxHeight: '300px',
                position: 'relative',
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${userLive.osuApi.cover_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                }} />

                {/* gradient to make bottom darker */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                    zIndex: 0,
                }} />

                <Box sx={{
                    zIndex: 1,
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                }}>
                    <Container sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}>
                        <Box className="profile-header-content">
                            <Avatar
                                src={userLive.osuApi.avatar_url}
                                alt={userLive.osuApi.username}
                                sx={{ width: 160, height: 160 }}
                                variant="rounded"
                            />

                            <Box sx={{ m: '12px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    {
                                        userLive.team &&
                                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: userLive.team.color || '#000000', p: 0.5, borderRadius: `${theme.shape.borderRadius}px` }}>
                                            <Typography variant="h4" sx={{ color: getContrastColor(userLive.team.color || '#000000') }} >{userLive.team.short_name}</Typography>
                                        </Box>
                                    }
                                    <Typography variant="h4" >{userLive.osuApi.username}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <img src={getFlagIcon(userLive.osuApi.country_code)} alt={userLive.osuApi.country_code} height={24} />
                                    <Typography variant="body1">{userLive.osuApi.country.name}</Typography>
                                </Box>
                                {/* <Typography variant="body1"><img src={getFlagIcon(userLive.osuApi.country_code)} alt={userLive.osuApi.country_code} /> {userLive.osuApi.country.name}</Typography> */}
                            </Box>

                            <Fade in={activeRuleset !== 'all'}>
                                <Box sx={{ m: '12px' }} >
                                    <Typography variant="h6">Rank</Typography>
                                    <Typography variant="h5">#<NumberFlow value={getRulesetUser(activeRuleset)?.global_rank > 0 ? getRulesetUser(activeRuleset)?.global_rank : null} fallback="N/A" /></Typography>
                                </Box>
                            </Fade>

                            <Box className="profile-header-actions">
                                <ProfileRulesetSelector />
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box >


        </div >
    );
}

export default ProfileHeader;