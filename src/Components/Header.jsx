import { AppBar, Avatar, Box, Button, IconButton, Menu, Toolbar, Typography } from "@mui/material";
import Config from "../Data/Config";
import { Link } from "react-router";
import { useAuth } from "../Providers/AuthProvider";
import { useState } from "react";
import { GetOsuAuthUrl } from "../Misc/ApiHelper";

function Header() {
    const [showMenu, setShowMenu] = useState(null);
    const { user } = useAuth();

    return <AppBar position="static">
        <Box sx={{ pl: 2, pr: 2 }}>
            <Toolbar disableGutters>
                <Typography variant='h6' noWrap component={Link} to={`/`} sx={{
                    mr: 2,
                    color: 'inherit',
                    textDecoration: 'none',
                }}>{Config.WEBSITE_NAME}</Typography>
                <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', flexGrow: 1 } }}>
                </Box>
                <Box sx={{ flexGrow: 0 }}>
                    {
                        user ? <>
                            <IconButton onClick={(e) => setShowMenu(e.currentTarget)} sx={{ p: 0 }}>
                                <Avatar alt={user.username} src={`https://a.ppy.sh/${user.id}`} />
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
                                <Box sx={{ width: '25em' }}>
                                    {/* <HeaderAccountDropdown open={Boolean(showMenu)} onClose={() => setShowMenu(null)} /> */}
                                </Box>
                            </Menu>
                        </> : <>
                            <Button component={Link} to={GetOsuAuthUrl()} variant="outlined" color="inherit" sx={{ mr: 2 }}>
                                Login with osu!
                            </Button>
                        </>
                    }
                </Box>
            </Toolbar>
        </Box>
    </AppBar>
}

export default Header;