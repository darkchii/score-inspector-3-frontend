import { Avatar, Box, Button, Container, Fade, Typography, useTheme } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import ProfileRulesetSelector from "./ProfileRulesetSelector";
import { getFlagIcon } from "../../assets/textures/TextureDatabase";
import NumberFlow from "@number-flow/react";
import { getContrastColor, ShowNotification } from "../../util/Helper";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useAuth } from "../../providers/AuthProvider";
import BetterTooltip from "../tooltips/BetterTooltip";
import { useApi } from "../../providers/ApiProvider";
import { useState } from "react";

const _profileHeaderImageRatio = 20 / 5; //Width / Height (2000x500)

function ProfileHeader() {
    const { user, userData, token, canGiveReputationTo, setReputationAbility } = useAuth();
    const { userLive, activeRuleset, getRulesetUser } = useProfile();
    const { postReputation } = useApi();
    const [isWorkingReputation, setIsWorkingReputation] = useState(false);
    const theme = useTheme();

    if (!userLive) {
        return null;
    }

    const giveReputation = async () => {
        if (!user || !userData) return;
        
        setIsWorkingReputation(true);
        try {
            const response = await postReputation('user', userLive.osuApi.id, user.id, token);
            console.log("Reputation response:", response);
            ShowNotification("Reputation given successfully!", "success");
            setReputationAbility('user', false);
        }catch(error) {
            console.error("Error giving reputation:", error);
            ShowNotification("An error occurred while giving reputation. Please try again later.", "error");
        }finally {
            setIsWorkingReputation(false);
        }
    }

    return (
        <div>
            {/* the header should be 2000x500 (or adjusted proportionally), userLive.osuApi.cover_url is the background image, there will be stuff on top of it */}
            <Box sx={{
                width: '100%',
                height: `calc(100vw / ${_profileHeaderImageRatio})`,
                // maxHeight: '300px',
                maxHeight: { xs: '200px', md: '300px' },
                position: 'relative',
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${userLive.osuApi.cover?.url || ''})`,
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
                            <div>
                                <Avatar
                                    src={userLive.osuApi.avatar_url}
                                    alt={userLive.osuApi.username}
                                    // sx={{ width: 160, height: 160 }}
                                    //160 on desktop, 80 on mobile
                                    sx={{
                                        width: { xs: 80, md: 140 },
                                        height: { xs: 80, md: 140 },
                                    }}
                                    variant="rounded"
                                />
                                {
                                    user && userData && userLive.osuApi.id !== userData.osuApi.id &&
                                    <BetterTooltip title={
                                        userLive.osuApi.id === userData.osuApi.id ?
                                            'You cannot give reputation to yourself.' :
                                            (canGiveReputationTo('user') ?
                                                'Give reputation to this user.' :
                                                'You have already given reputation to a user in the last 24 hours.')
                                    }>
                                        <span> {/* span so tooltip renders on disabled button */}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: 0.5 }}
                                                fullWidth
                                                startIcon={<ThumbUpIcon />}
                                                disabled={userLive.osuApi.id === userData.osuApi.id || !canGiveReputationTo('user')}
                                                onClick={giveReputation}
                                                loading={isWorkingReputation}
                                            >
                                                {
                                                    userLive.osuApi.id === userData.osuApi.id ?
                                                        'This is you!' :
                                                        '+rep'
                                                }
                                            </Button>
                                        </span>
                                    </BetterTooltip>
                                }
                            </div>

                            <Box sx={{ m: '12px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    {
                                        userLive.team &&
                                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: userLive.team.color || '#000000', p: 0.5, borderRadius: `${theme.shape.borderRadius}px` }}>
                                            <Typography
                                                sx={{
                                                    color: getContrastColor(userLive.team?.color || '#000000'),
                                                    fontSize: { xs: '1.2rem', md: '2rem' },
                                                }}
                                            >{userLive.team?.short_name}</Typography>
                                        </Box>
                                    }
                                    <Typography
                                        sx={{ fontSize: { xs: '1.2rem', md: '2rem' } }}
                                    >{userLive.osuApi.username}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <img
                                        src={getFlagIcon(userLive.osuApi.country_code) || ''}
                                        alt={userLive.osuApi.country_code}
                                        height={24}
                                    />
                                    <Typography
                                        sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                                    >{userLive.osuApi.country.name}</Typography>
                                </Box>
                                {/* <Typography variant="body1"><img src={getFlagIcon(userLive.osuApi.country_code)} alt={userLive.osuApi.country_code} /> {userLive.osuApi.country.name}</Typography> */}
                            </Box>

                            <Fade in={activeRuleset !== 'all'}>
                                <Box sx={{ m: '12px' }} >
                                    <Typography variant="h6">Rank</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>#<NumberFlow value={getRulesetUser(activeRuleset)?.global_rank > 0 ? getRulesetUser(activeRuleset)?.global_rank : null} /></Typography>
                                </Box>
                            </Fade>

                            <Box className="profile-header-actions" sx={{
                                display: { xs: 'none', md: 'flex' },
                            }}>
                                <ProfileRulesetSelector />
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box >
            {/* if mobile, show ProfileRulesetSelector here */}
            <Box className="profile-header-actions" sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center' }}>
                <ProfileRulesetSelector />
            </Box>
        </div>
    );
}

export default ProfileHeader;