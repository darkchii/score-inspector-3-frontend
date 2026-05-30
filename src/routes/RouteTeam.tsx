import { Alert, Box, Card, CardContent, CardMedia, Container, Divider, Grid, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import { useEffect, useState } from "react";
import type { ITeam } from "../types/types";
import PageLoader from "../components/PageLoader";
import { useApi } from "../providers/ApiProvider";
import RulesetSelector from "../components/RulesetSelector";
import { FormatNumber, GetRulesetNameFromId, TimeAgo } from "../util/Helper";
import BetterTooltip from "../components/tooltips/BetterTooltip";
import ItemList from "../components/list/ItemList";
import PlayerListRow from "../components/list/PlayerListRow";
import { grey } from "@mui/material/colors";
import PlayerCard from "../components/PlayerCard";
import YoutubeEmbed from "../components/YoutubeEmbed";
import { GetTeamColor } from "../util/TeamHelper";

function RouteTeam() {
    const navigate = useNavigate();
    const { getTeam } = useApi();
    const { teamId, ruleset } = useParams();
    const [teamData, setTeamData] = useState<ITeam | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    usePageTitle(`${teamData ? teamData.name : 'Team'}`);

    useEffect(() => {
        if (teamId) {
            setIsLoading(true);
            (async () => {
                try {
                    const data = await getTeam(teamId, ruleset ? ruleset : null);
                    setTeamData(data);
                    console.log(data);
                } catch (error) {
                    console.error("Error fetching team data:", error);
                    setError("Failed to load team data.");
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [teamId, ruleset])

    if (teamId && !teamData && !error && !isLoading) {
        return <PageLoader />
    }

    if (error || !teamData) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "20vh",
            }}>
                <Alert severity="error">{error || "Failed to load team data."}</Alert>
            </Box>
        )
    }

    return (
        <Container maxWidth="xl" sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 1.4,
                        width: '100%'
                    }}>
                        <RulesetSelector
                            activeRuleset={ruleset ?? (teamData.statistics?.ruleset_id ? GetRulesetNameFromId(teamData.statistics.ruleset_id) : 'osu')}
                            onChange={(newRuleset) => {
                                navigate(`/team/${teamId}/${newRuleset}`);
                            }}
                            showCombined={false}
                        />
                    </Box>
                    <TeamSidebarLeft data={teamData} />
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                    {/* cover image */}
                    <Box sx={{
                        width: "100%",
                        height: "200px",
                        backgroundImage: `url(${teamData.cover_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: 2,
                        mb: 2,
                    }} />
                    <Grid container spacing={2}>
                        {teamData.members?.map((user: any, index: number) => (
                            <Grid size={{ xs: 12, md: 3 }} key={index}>
                                <PlayerCard data={user} />
                            </Grid>
                        ))}
                    </Grid>
                    {/* <ItemList
                        showIndex={false}
                        items={teamData.members ? teamData.members : []}
                        isCompact={false}
                        truncate={false}
                        ItemListRowType={PlayerListRow}
                        secondaryFieldColor={grey[500]}
                    /> */}
                </Grid>
            </Grid>
        </Container>
    )
}

function TeamSidebarLeft({ data }: { data: ITeam }) {
    return (
        <Card sx={{ position: 'relative' }}>
            <CardMedia
                component="img"
                image={data.flag_url || ''}
                sx={{
                    aspectRatio: '20 / 10',
                    objectFit: 'cover',
                    width: '100%',
                }}
            />
            <CardContent>
                <Box>
                    <Typography variant="h5" component="div">
                        <span style={{color: GetTeamColor(data)}}>[{data.short_name}]</span> {data.name}
                    </Typography>
                    {
                        data.created_at && (
                            <BetterTooltip title={new Date(data.created_at).toLocaleString()}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created {TimeAgo(new Date(data.created_at))}
                                </Typography>
                            </BetterTooltip>
                        )
                    }
                    <Divider sx={{ marginY: 1 }} />
                    <TableContainer>
                        <Table size="small" sx={{
                            [`& .${tableCellClasses.root}`]: {
                                borderBottom: "none",
                                color: 'white !important',
                                padding: '2px'
                            },
                            [`& .${tableRowClasses.root}`]: {
                                borderBottom: "none",
                            },
                        }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell align="right">{data.statistics?.rank ? FormatNumber(data.statistics.rank) : 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Performance</TableCell>
                                    <TableCell align="right">{data.statistics?.performance ? FormatNumber(data.statistics.performance) : 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Playcount</TableCell>
                                    <TableCell align="right">{data.statistics?.play_count ? FormatNumber(data.statistics.play_count) : 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Ranked Score</TableCell>
                                    <TableCell align="right">{data.statistics?.ranked_score ? FormatNumber(data.statistics.ranked_score) : 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Members</TableCell>
                                    <TableCell align="right">{data.members ? data.members.length : 'N/A'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider sx={{ marginY: 1 }} />
                    {
                        data.youtube_id && (
                            <YoutubeEmbed videoId={data.youtube_id} width={"100%"} height={"200px"} />
                        )
                    }
                </Box>
            </CardContent>
        </Card>
    )
}

function TeamSidebarRight({ data }: { data: ITeam }) {
    return (
        <></>
    )
}

export default RouteTeam;