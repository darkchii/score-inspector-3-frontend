import { alpha, AppBar, Box, Button, Collapse, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, Stack, styled, Toolbar, Tooltip, Typography, useTheme } from "@mui/material";
import type { MenuProps } from "@mui/material";
import Config from "../data/Config.json";
import { Link } from "react-router";
import React, { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from "../providers/SearchProvider";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import GroupsIcon from '@mui/icons-material/Groups';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import HeaderUser from "./header/HeaderUser";
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const HeaderButtonMenu = styled((props: MenuProps) => (
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
    const { openSearch } = useSearch();
    const theme = useTheme();

    //dropdown data
    const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [anchorElDropdown, setAnchorElDropdown] = useState<HTMLElement | null>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
    const [openMobileGroups, setOpenMobileGroups] = useState<{ [key: number]: boolean }>({});


    const HEADER_NAV_ITEMS: { label: string, icon: React.ReactNode, to?: string, href?: string, onClick?: () => void, dropdown?: { label: string, to?: string, href?: string, icon?: React.ReactNode, onClick?: () => void }[] }[] = [
        {
            label: 'Search',
            icon: <SearchIcon />,
            onClick: () => { openSearch(); }
        },
        {
            label: 'People',
            icon: <PersonIcon />,
            to: '/people',
            dropdown: [
                {
                    label: 'Completionists',
                    to: '/completionists',
                    icon: <MilitaryTechIcon />
                }
            ]
        },
        {
            label: 'Leaderboards',
            icon: <LeaderboardIcon />,
            to: '/leaderboards',
            dropdown: [
                {
                    label: 'Score Rank History',
                    to: '/scorerank/',
                    icon: <HistoryIcon />
                }
            ]
        },
        {
            label: 'Tools',
            icon: <BuildIcon />,
            to: '/tools',
        },
        {
            label: 'Wiki',
            icon: <InfoIcon />,
            href: Config.WIKI_URL
        }
    ];

    const handleHeaderMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
        setActiveDropdownIndex(index);
        setShowDropdown(true);
        setAnchorElDropdown(event.currentTarget);
    };

    const handleHeaderMenuClose = () => {
        setActiveDropdownIndex(null);
        setShowDropdown(false);
        setAnchorElDropdown(null);
    };

    const toggleMobileDrawer = (open: boolean) => {
        setMobileDrawerOpen(open);
    };

    const toggleMobileGroup = (index: number) => {
        setOpenMobileGroups((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const closeMobileDrawerAndRun = (item: any) => {
        toggleMobileDrawer(false);
        if (item.onClick) {
            item.onClick();
        }
    };

    return <React.Fragment>
        <HeaderButtonMenu
            anchorEl={anchorElDropdown}
            open={showDropdown}
            onClose={handleHeaderMenuClose}
        >
            {
                activeDropdownIndex !== null && HEADER_NAV_ITEMS[activeDropdownIndex].dropdown?.map((item: any, index: number) => (
                    <Button
                        key={index}
                        component={item.to ? Link : 'button'}
                        to={item.to || item.href || '#'}
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
                    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' }, flexGrow: 1 }}>
                        <Stack direction={'row'} spacing={2}>
                            {
                                HEADER_NAV_ITEMS.map((item: any, index: number) => {
                                    return (
                                        <Stack key={index} direction={'row'}>
                                            <Tooltip title={item.tooltip || ''}>
                                                <>
                                                    <Button
                                                        size='small'
                                                        component={item.to ? Link : (item.href ? 'a' : 'button')}
                                                        to={item.to || '#'}
                                                        href={item.href || null}
                                                        onClick={item.onClick}
                                                        startIcon={item.icon || null}
                                                        disabled={!item.onClick && !item.to && !item.href}
                                                        target={item.href ? "_blank" : undefined}
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
                                                </>
                                            </Tooltip>
                                        </Stack>
                                    )
                                })
                            }
                        </Stack>
                    </Box>
                    <Box sx={{ display: { xs: 'block', sm: 'block', md: 'block', lg: 'none' }, ml: 'auto', mr: 1 }}>
                        <IconButton
                            color="inherit"
                            aria-label="open navigation"
                            onClick={() => toggleMobileDrawer(true)}
                            size="large"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <HeaderUser />
                    </Box>
                </Toolbar>
            </Box>
        </AppBar>
        <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => toggleMobileDrawer(false)}
            sx={{ display: { xs: 'block', sm: 'block', md: 'block', lg: 'none' } }}
        >
            <Box sx={{ width: 300 }} role="presentation">
                <Box sx={{ px: 2, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6">{Config.WEBSITE_NAME}</Typography>
                </Box>
                <List>
                    {HEADER_NAV_ITEMS.map((item, index) => {
                        const hasDropdown = item.dropdown && item.dropdown.length > 0;
                        const isOpen = !!openMobileGroups[index];

                        if (hasDropdown) {
                            return (
                                <React.Fragment key={index}>
                                    <ListItemButton
                                        component={item.to ? Link : (item.href ? 'a' : 'button')}
                                        to={item.to || '#'}
                                        href={item.href || undefined}
                                        target={item.href ? "_blank" : undefined}
                                        onClick={(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => {
                                            if (!item.to && !item.href && !item.onClick) {
                                                e.preventDefault();
                                            }
                                            closeMobileDrawerAndRun(item);
                                        }}
                                    >
                                        <ListItemIcon>{item.icon || null}</ListItemIcon>
                                        <ListItemText primary={item.label} />
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleMobileGroup(index);
                                            }}
                                        >
                                            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </ListItemButton>
                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.dropdown?.map((dropdownItem: any, dropdownIndex: number) => (
                                                <ListItemButton
                                                    key={`${index}-${dropdownIndex}`}
                                                    sx={{ pl: 4 }}
                                                    component={dropdownItem.to ? Link : (dropdownItem.href ? 'a' : 'button')}
                                                    to={dropdownItem.to || '#'}
                                                    href={dropdownItem.href || undefined}
                                                    target={dropdownItem.href ? "_blank" : undefined}
                                                    onClick={() => closeMobileDrawerAndRun(dropdownItem)}
                                                >
                                                    <ListItemIcon>{dropdownItem.icon || null}</ListItemIcon>
                                                    <ListItemText primary={dropdownItem.label} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                </React.Fragment>
                            );
                        }

                        return (
                            <ListItemButton
                                key={index}
                                component={item.to ? Link : (item.href ? 'a' : 'button')}
                                to={item.to || '#'}
                                href={item.href || undefined}
                                target={item.href ? "_blank" : undefined}
                                onClick={(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => {
                                    if (!item.to && !item.href && !item.onClick) {
                                        e.preventDefault();
                                    }
                                    closeMobileDrawerAndRun(item);
                                }}
                            >
                                <ListItemIcon>{item.icon || null}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    </React.Fragment>;
}

export default Header;