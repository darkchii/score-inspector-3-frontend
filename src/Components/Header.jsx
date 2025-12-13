import { alpha, AppBar, Avatar, Box, Button, IconButton, InputBase, Menu, styled, Toolbar, Typography, useTheme } from "@mui/material";
import Config from "../Data/Config";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import { GetOsuAuthUrl } from "../util/ApiHelper";
import LoadingButton from "./LoadingButton";
import DebouncedTextField from "./DebouncedTextField";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    transition: 'background-color 0.3s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
        transition: 'background-color 0.3s ease',
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

function Header() {
    const [showMenu, setShowMenu] = useState(null);
    const { user, loading } = useAuth();
    const theme = useTheme();

    return <AppBar position="static">
        <Box sx={{ pl: 2, pr: 2 }}>
            <Toolbar disableGutters>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant='h6'
                        noWrap
                        component={Link}
                        to={`/`}
                        sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                        }}>{Config.WEBSITE_NAME}</Typography>
                    <Typography
                        variant='subtitle2'
                        sx={{
                            color: theme.palette.primary.light,
                            mr: 2,
                            fontStyle: 'italic',
                        }}>v3</Typography>
                </Box>
                {/* <StyledInputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                    /> */}
                <div style={{margin: '5px'}}>
                    <DebouncedTextField label="Search..." variant="standard" onDebouncedChange={(value) => console.log(value)} />
                </div>
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
                            <LoadingButton loading={loading} component={Link} to={GetOsuAuthUrl()} variant="outlined" color="inherit" sx={{ mr: 2 }}>
                                Login with osu!
                            </LoadingButton>
                        </>
                    }
                </Box>
            </Toolbar>
        </Box>
    </AppBar>
}

export default Header;