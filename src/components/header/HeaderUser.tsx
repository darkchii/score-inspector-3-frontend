import { Avatar, Box, IconButton, Menu, Stack } from "@mui/material";
import LoadingButton from "../LoadingButton";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { GetOsuAuthUrl } from "../../util/ApiHelper";
import { Link } from "react-router";
import PlayerLink from "../PlayerLink";

function HeaderUser() {
    const [showMenu, setShowMenu] = useState<null | HTMLElement>(null);
    const { user, userData, loading, logout } = useAuth();

    useEffect(() => {
        console.log("User changed:", userData);
    }, [userData]);

    if (!user || !userData) {
        return (
            <LoadingButton loading={loading} component={Link} to={GetOsuAuthUrl()} variant="outlined" color="inherit" sx={{ mr: 2 }}>
                Login with osu!
            </LoadingButton>
        )
    }

    return (
        <>
            <IconButton onClick={(e) => setShowMenu(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar alt={userData.osuApi.username} src={`https://a.ppy.sh/${user.id}`} />
            </IconButton>
            <Menu
                id="menu-appbar"
                sx={{ mt: '45px', pt: 0 }}
                keepMounted
                anchorEl={showMenu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(showMenu)}
                onClose={() => setShowMenu(null)}
            >
                <Box sx={{ width: '20em' }}>
                    <Stack spacing={1} sx={{ p: 2 }}>
                        {/* big avatar with username underneath, centered */}
                        <Stack spacing={1} sx={{ alignItems: 'center' }}>
                            <Avatar alt={userData.osuApi.username} src={`https://a.ppy.sh/${user.id}`} sx={{ width: 64, height: 64 }} />
                            {/* <Box>{userData.osuApi.username}</Box> */}
                            <Box><PlayerLink data={userData} noTooltip/></Box>
                        </Stack>
                        {/* buttons (own profile, osu profile, logout) */}
                        <Stack spacing={1}>
                            <LoadingButton fullWidth component={Link} to={`/user/${user.id}`} variant="outlined" color="primary" onClick={() => setShowMenu(null)}>
                                Profile
                            </LoadingButton>
                            <LoadingButton fullWidth href={`https://osu.ppy.sh/users/${user.id}`} target="_blank" variant="outlined" color="primary">
                                osu! Profile
                            </LoadingButton>
                            <LoadingButton fullWidth variant="outlined" color="secondary" onClick={() => { logout(); setShowMenu(null); }}>
                                Logout
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </Box>
            </Menu>
        </>
    )
}

export default HeaderUser;