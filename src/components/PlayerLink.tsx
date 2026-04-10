import { Avatar, Box, Typography, useTheme } from "@mui/material";
import { cloneElement, useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router";
import BetterTooltip from "./tooltips/BetterTooltip";
import * as Muicon from "@mui/icons-material";
import PlayerTooltip from "./tooltips/PlayerTooltip";
import { getFlagIcon } from "../assets/textures/TextureDatabase";

function GetRoleIcon({ role, size = 16 }: {
    role: any,
    size?: number,
}) {
    const Icon = Muicon[(role.icon ?? 'QuestionMark') as keyof typeof Muicon];
    return <Icon sx={{ color: `${role.color}`, fontSize: size }} />;
}

function PlayerLink({ data, size = 24, hideCountry = false, noTooltip = false, ...props }: {
    data: any,
    size?: number,
    hideCountry?: boolean,
    noTooltip?: boolean,
} & React.HTMLAttributes<HTMLDivElement>) {
    const theme = useTheme();
    const { user } = useAuth();
    const [username, setUsername] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [team, setTeam] = useState<any | null>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [isSelf, setIsSelf] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [hasAltData, setHasAltData] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        //we can received different data structures, so we need to look in several places
        let api_user = null;
        let team_data = null;
        if (data?.user) {
            api_user = data.user;
        } else if (data?.api_user) {
            api_user = data.api_user;
        } else if (data?.osuApi) {
            api_user = data.osuApi;
        } else {
            setIsValid(false);
            return;
        }

        if (data?.osuAlternative) {
            setHasAltData(true);
        }

        if (api_user) {
            const _username = api_user.username || api_user.name || "Unknown";
            const _id = api_user.id || api_user.user_id || null;

            setUsername(_username);
            setId(_id);
            setIsSelf(user && _id && (String(user.id) === String(_id)));
        }

        if (data?.team) {
            team_data = data.team;
        }
        setTeam(team_data);

        if (data?.roles) {
            setRoles(data.roles);
        }
    }, [data]);

    return (
        <PlayerTooltip data={data} {...props}>
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
                    //borderradius based on size
                    borderRadius: `${size / 2}px`,
                    bgcolor: `${isSelf ? theme.palette.primary.main : '#ffffff'}22`,
                    textDecoration: 'none',
                    color: '#fff',
                    // p: 0.1,
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
                    backdropFilter: 'blur(4px)',
                }}>
                <Avatar
                    src={`https://a.ppy.sh/${id}`}
                    alt={username || 'Avatar'}
                    sx={{ width: size, height: size, mr: 0.5 }}
                />
                {
                    !hideCountry && data?.osuApi?.country_code && (
                        <img src={getFlagIcon(data?.osuApi?.country_code) || ''} alt={data?.osuApi?.country_code}
                            style={{
                                width: size,
                                height: 'auto',
                                borderRadius: '2px',
                                marginRight: 4,
                            }}
                        />
                    )
                }
                <Typography variant="body2" sx={{ fontWeight: isSelf ? 'bold' : 'normal' }}>
                    {
                        team && <>
                            <span style={{ color: team.color, fontWeight: 'bold' }}>[{team.short_name}] </span>
                        </>
                    }
                    {
                        username !== null ? <>{username}</> : <span style={{ fontStyle: 'italic' }}>Unknown</span>
                    }
                </Typography>
                {
                    !hasAltData && !noTooltip && (
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
                    roles?.length > 0 && !noTooltip && roles.map((role, index) => {
                        if (!role.is_visible) return null;
                        return (
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
                        )
                    })
                }
            </Box>
        </PlayerTooltip>
    )
}

export default PlayerLink;