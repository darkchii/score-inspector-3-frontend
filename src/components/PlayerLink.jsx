import { Avatar, Box, Typography, useTheme } from "@mui/material";
import { cloneElement, useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router";

function PlayerLink({ data, size = 24 }) {
    const theme = useTheme();
    const { user } = useAuth();
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [team, setTeam] = useState(null);
    const [isSelf, setIsSelf] = useState(false);
    const [isValid, setIsValid] = useState(true);
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

        if (api_user) {
            const _username = api_user.username || api_user.name || "Unknown";
            const _id = api_user.id || api_user.user_id || null;

            setUsername(_username);
            setId(_id);
            setIsSelf(user && _id && (String(user.id) === String(_id)));
        }
    }, [data]);

    return (
        //chip but our own elements
        <Box
            onClick={() => {
                if (id) {
                    navigate(`/user/${id}`);
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
                {/* {
                    props.team && <>
                        <span style={{ color: props.team.color, fontWeight: 'bold' }}>[{props.team.short_name}] </span>
                    </>
                } */}
                {username}
            </Typography>
        </Box>
    )
}

export default PlayerLink;