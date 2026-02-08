import { Avatar, Box, Typography, useTheme } from "@mui/material";
import { cloneElement, useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router";
import BetterTooltip from "./tooltips/BetterTooltip";
import * as Muicon from "@mui/icons-material";

function GetRoleIcon({ role, size = 16 }) {
    const Icon = Muicon[role.icon ?? 'QuestionMark'];
    return <Icon sx={{ color: `${role.color}`, fontSize: size }} />;
}

function PlayerLink({ data, size = 24 }) {
    const theme = useTheme();
    const { user } = useAuth();
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [team, setTeam] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isSelf, setIsSelf] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [hasAltData, setHasAltData] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        //we can received different data structures, so we need to look in several places
        let api_user = null;
        let team_data = null;
        if (data.user) {
            api_user = data.user;
        } else if (data.api_user) {
            api_user = data.api_user;
        } else if (data.osuApi) {
            api_user = data.osuApi;
        } else {
            setIsValid(false);
            return;
        }

        if (data.osuAlternative) {
            setHasAltData(true);
        }

        if (api_user) {
            const _username = api_user.username || api_user.name || "Unknown";
            const _id = api_user.id || api_user.user_id || null;

            setUsername(_username);
            setId(_id);
            setIsSelf(user && _id && (String(user.id) === String(_id)));
        }

        if (data.team) {
            team_data = data.team;
        }
        setTeam(team_data);

        if (data.roles) {
            setRoles(data.roles);
        }
    }, [data]);

    return (
        <Box
            onClick={() => {
                if (id) {
                    if (hasAltData) {
                        navigate(`/user/${id}`);
                    } else {
                        window.open(`https://osu.ppy.sh/users/${id}`, '_blank');
                    }
                }
            }}
            sx={{
                display: 'flex',
                borderRadius: '1em',
                bgcolor: `${isSelf ? theme.palette.primary.main : '#ffffff'}22`,
                textDecoration: 'none',
                color: '#fff',
                p: 0.1,
                pr: 1,
                width: 'fit-content',
                alignItems: 'center',
                justifyContent: 'center',
                //hover effect
                '&:hover': {
                    bgcolor: `${isSelf ? theme.palette.primary.main : '#ffffff'}44`,
                    cursor: 'pointer',
                    //animate
                    transition: 'background-color 0.2s',
                },
                transition: 'background-color 0.2s',
            }}>
            <Avatar
                src={`https://a.ppy.sh/${id}`}
                alt={username}
                sx={{ width: size, height: size, mr: 0.5 }}
            />
            <Typography variant="body2" sx={{ fontWeight: isSelf ? 'bold' : 'normal' }}>
                {
                    team && <>
                        <span style={{ color: team.color, fontWeight: 'bold' }}>[{team.short_name}] </span>
                    </>
                }
                {username}
            </Typography>
            {
                !hasAltData && (
                    <BetterTooltip title="osu!alternative does not have any data for this player.">
                        <Avatar
                            sx={{
                                width: size * 0.9,
                                height: size * 0.9,
                                ml: 0.3,
                                display: 'inline-flex',
                                bgcolor: 'transparent',
                            }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <GetRoleIcon role={{ icon: 'Warning', color: theme.palette.warning.main }} size={size * 0.9} />
                            </Box>
                        </Avatar>
                    </BetterTooltip>
                )
            }
            {
                roles?.length > 0 && roles.map((role, index) => (
                    <BetterTooltip title={role.title}>
                        <Avatar
                            key={index}
                            sx={{
                                width: size * 0.9,
                                height: size * 0.9,
                                ml: 0.3,
                                display: 'inline-flex',
                                bgcolor: 'transparent',
                            }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <GetRoleIcon role={role} size={size * 0.9} />
                            </Box>
                        </Avatar>
                    </BetterTooltip>
                ))
            }
        </Box>
    )
}

export default PlayerLink;