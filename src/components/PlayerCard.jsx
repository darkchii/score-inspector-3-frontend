import { Avatar, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import playerCardStyles from '../styles/player-card.module.less';
import { getFlagIcon } from "../assets/textures/TextureDatabase";
import BetterTooltip from "./tooltips/BetterTooltip";
import { useNavigate } from "react-router";

function PlayerCard({ data, onClick = null }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [apiUser, setApiUser] = useState(null);
    const [id, setId] = useState(null);
    const [team, setTeam] = useState(null);
    const [isValid, setIsValid] = useState(true);

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
            console.log(api_user);
        }
    }, [data]);

    const handleClick = () => {
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
                                <img src={getFlagIcon(apiUser?.country_code)} alt={apiUser?.country_code} />
                            </BetterTooltip>
                        </div>
                        {
                            team ?
                                <span
                                    className={playerCardStyles['player-card__team-tag']}
                                    style={{ backgroundColor: team.color || '#888', borderRadius: theme.shape.borderRadius }}
                                >
                                    <BetterTooltip title={team.name || 'Team'}>
                                        {team.short_name || 'TEAM'}
                                    </BetterTooltip>
                                </span>
                                :
                                null
                        }
                        {username || "Unknown"}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerCard;