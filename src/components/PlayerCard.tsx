import { Avatar, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import playerCardStyles from '../styles/player-card.module.less';
import { getFlagIcon } from "../assets/textures/TextureDatabase";
import BetterTooltip from "./tooltips/BetterTooltip";
import { useNavigate } from "react-router";
import { GetIconFromLabel } from "../util/Helper";

function PlayerCard({ data, onClick = null }: {
    data: any,
    onClick?: ((user: any) => void) | null
}) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [username, setUsername] = useState<string | null>(null);
    const [apiUser, setApiUser] = useState<any | null>(null);
    const [osuAltUser, setOsuAltUser] = useState<any | null>(null);
    const [id, setId] = useState<number | null>(null);
    const [team, setTeam] = useState<any | null>(null);
    const [roles, setRoles] = useState<any[] | null>(null);
    const [isValid, setIsValid] = useState<boolean>(true);

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

        if(data.osuAlternative){
            setOsuAltUser(data.osuAlternative);
        }

        if (data.team) {
            team_data = data.team;
        }

        if (api_user) {
            const _username = api_user.username || api_user.name || "Unknown";
            const _id = api_user.id || api_user.user_id || null;

            setUsername(_username);
            setApiUser(api_user);
            setId(_id);
            setTeam(team_data);
            setRoles(data.roles || null);
            console.log(api_user);
        }
    }, [data]);

    const handleClick = () => {
        if(!osuAltUser){
            //navigate to osu! profile if we don't have any data for this user
            window.open(`https://osu.ppy.sh/users/${id}`, '_blank');
            return;
        }

        navigate(`/user/${id}`);

        if (onClick) {
            onClick(apiUser);
        }
    }

    return (
        <div className={playerCardStyles['player-card']} >
            <div className={playerCardStyles['player-card__background']} style={{
                backgroundImage: `url(${apiUser?.cover?.url || ''})`,
                borderRadius: theme.shape.borderRadius,
            }} />
            <div
                className={playerCardStyles['player-card__content']}
                style={{
                    borderRadius: theme.shape.borderRadius,
                }}
                onClick={handleClick}
            >
                {/* <p>{username || "Unknown"}</p> */}
                <Avatar
                    src={apiUser?.avatar_url || ''}
                    alt={username || 'Avatar'}
                    sx={{
                        height: '100%',
                        width: 'auto',
                    }}
                    variant="rounded"
                />
                <div className={playerCardStyles['player-card__info']}>
                    <div className={playerCardStyles['player-card__username']}>
                        {/* country flag img */}
                        <div className={playerCardStyles['player-card__flag']}>
                            <BetterTooltip title={apiUser?.country?.name || 'Unknown Country'}>
                                <img src={getFlagIcon(apiUser?.country_code) || ''} alt={apiUser?.country_code} />
                            </BetterTooltip>
                        </div>
                        {
                            team ?
                                <span
                                    className={playerCardStyles['player-card__team-tag']}
                                    style={{ backgroundColor: team?.color || '#888', borderRadius: theme.shape.borderRadius }}
                                >
                                    <BetterTooltip title={team?.name || 'Team'}>
                                        {team?.short_name || 'TEAM'}
                                    </BetterTooltip>
                                </span>
                                :
                                null
                        }
                        {username || "Unknown"}
                        {/* if not osuAltUser, show a little warning sign */}
                        {
                            !osuAltUser ?
                                <BetterTooltip title="osu!alternative does not have any data for this player.">
                                    <span style={{ color: theme.palette.warning.main, marginLeft: 4 }}>⚠️</span>
                                </BetterTooltip>
                                :
                                null
                        }
                    </div>
                    <div className={playerCardStyles['player-card__roles']}>
                        {
                            roles ?
                                roles.map((role: any, index: number) => {
                                    if (!role.is_visible) return null;
                                    return (
                                        <span
                                            key={index}
                                            className={playerCardStyles['player-card__role']}
                                        >
                                            <span
                                                className={playerCardStyles['player-card__role__icon']}
                                                style={{color: `${role.color}`}}
                                            >
                                                <BetterTooltip title={role.title}>
                                                    {GetIconFromLabel(role.icon) || role.title}
                                                </BetterTooltip>
                                            </span>
                                        </span>
                                    );
                                })
                                :
                                null
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerCard;