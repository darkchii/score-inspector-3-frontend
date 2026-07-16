import { Avatar, Box, Button, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import Config from "../../data/Config.json";
import type { IActivityLog } from "../../types/types";
import { useState, useEffect, type JSX } from "react";
import { useApi } from "../../providers/ApiProvider";
import BetterTooltip from "../tooltips/BetterTooltip";
import { TimeAgo } from "../../util/Helper";
import { Link } from "react-router";
import PlayerLink from "../PlayerLink";

function IndexLogs() {
    const theme = useTheme();
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const { getRecentActivityLogs } = useApi();

    useEffect(() => {
        (async () => {
            try {
                const data = await getRecentActivityLogs();
                console.log("Fetched recent activity logs:", data);
                setLogs(data);
            } catch (error) {
                console.error("Error fetching recent activity logs:", error);
            }
        })();
    }, [])

    return (
        <Paper sx={{ padding: 1, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Logs
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
            <Stack spacing={1}>
                {logs.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">No recent activities</Typography>
                ) : (
                    logs.map((log, index) => {
                        //switch on log.data.type, as each type has its own way to display the data
                        let output: JSX.Element;

                        //quick inline Link component to adopt MUI theme on React Router Link
                        const RLink = (props: { to: string, children: React.ReactNode }) => (
                            //use primary color
                            <Link to={props.to} style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                                {props.children}
                            </Link>
                        );

                        const userLink = log.data.user ? <PlayerLink data={log.data.user} /> : <strong>{log.data.user_id}</strong>;

                        switch (log.data.type) {
                            case 'UPDATE_BEATMAPSET_MEDIA':
                                output = (
                                    <>
                                        <Box sx={{ display: 'flex' }}>{TimeAgo(log.created_at)} &nbsp;{userLink}</Box>
                                        Updated media on <strong><RLink to={`/beatmapsets/${log.data.beatmapset_id}`}>{log.data.beatmapset_artist} - {log.data.beatmapset_title}</RLink></strong>
                                    </>
                                );
                                break;
                            case 'UPDATE_TEAM_DATA':
                                output = (
                                    <>
                                        <Box sx={{ display: 'flex' }}>{TimeAgo(log.created_at)} &nbsp;{userLink}</Box>
                                        Updated team data for <strong><RLink to={`/teams/${log.data.team_id}`}>{log.data.team_name}</RLink></strong>
                                    </>
                                );
                                break;
                            default:
                                output = (
                                    <>Missing formatter for log type: {log.data.type}</>
                                );
                                break;
                        }
                        return (
                            <Box key={index} sx={{
                                //fontSize
                                fontSize: '0.875rem',
                            }}>
                                {output}
                                {/* if not last index, add a divider */}
                                {index !== logs.length - 1 && <Divider sx={{ marginY: 1 }} />}
                            </Box>
                        );
                    })
                )}
            </Stack>
        </Paper>
    )
}

export default IndexLogs;