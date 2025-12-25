import { alpha, AppBar, Avatar, Box, Button, IconButton, InputBase, Menu, Stack, styled, Toolbar, Tooltip, Typography, useTheme } from "@mui/material";
import Config from "../Data/Config";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import React, { useState } from "react";
import { GetOsuAuthUrl } from "../util/ApiHelper";
import LoadingButton from "./LoadingButton";
import DebouncedTextField from "./DebouncedTextField";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from "../providers/SearchProvider";

const HeaderButtonMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    >
        {props.children}
    </Menu>
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));

function Header() {
    const [showMenu, setShowMenu] = useState(null);
    const { user, loading } = useAuth();
    const { openSearch } = useSearch();
    const theme = useTheme();

    //dropdown data
    const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [anchorElDropdown, setAnchorElDropdown] = useState(null);

    const HEADER_NAV_ITEMS = [
        {
            label: 'Search',
            icon: <SearchIcon />,
            onClick: () => { openSearch(); }
        },
        {
            label: 'People',
            icon: <PersonIcon />,
            dropdown: [
                {
                    label: 'Completionists',
                    to: '/completionists',
                    icon: <MilitaryTechIcon />
                }
            ]
        }
    ];

    const handleHeaderMenuOpen = (event, index) => {
        setActiveDropdownIndex(index);
        setShowDropdown(true);
        setAnchorElDropdown(event.currentTarget);
    };

    const handleHeaderMenuClose = () => {
        setActiveDropdownIndex(null);
        setShowDropdown(false);
        setAnchorElDropdown(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    return <React.Fragment>
        <HeaderButtonMenu
            anchorEl={anchorElDropdown}
            open={showDropdown}
            onClose={handleHeaderMenuClose}
        >
            {
                activeDropdownIndex !== null && HEADER_NAV_ITEMS[activeDropdownIndex].dropdown.map((item, index) => (
                    <Button
                        key={index}
                        component={item.to ? Link : 'button'}
                        to={item.to || '#'}
                        startIcon={item.icon || null}
                        onClick={() => {
                            handleHeaderMenuClose();
                            if (item.onClick) {
                                item.onClick();
                            }
                        }}
                        sx={{
                            textAlign: 'left',
                            width: '100%',
                            color: 'inherit',
                            textDecoration: 'none',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            }
                        }}
                    >
                        {item.label}
                    </Button>
                ))
            }
        </HeaderButtonMenu>
        <AppBar position="static">
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
                    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', flexGrow: 1 } }}>
                        <Stack direction={'row'} spacing={2}>
                            {
                                HEADER_NAV_ITEMS.map((item, index) => {
                                    return (
                                        <Stack key={index} direction={'row'}>
                                            <Tooltip title={item.tooltip || ''}>
                                                <Button
                                                    size='small'
                                                    component={item.to ? Link : 'button'}
                                                    to={item.to || '#'}
                                                    onClick={item.onClick}
                                                    startIcon={item.icon || null}
                                                >
                                                    {item.label || ''}
                                                </Button>
                                                {
                                                    item.dropdown && item.dropdown.length > 0 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleHeaderMenuOpen(e, index)}
                                                            sx={{ ml: -0.5 }}
                                                        >
                                                            <KeyboardArrowDownIcon fontSize="small" />
                                                        </IconButton>
                                                    )
                                                }
                                            </Tooltip>
                                        </Stack>
                                    )
                                })
                            }
                        </Stack>
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
    </React.Fragment>;
}

export default Header;