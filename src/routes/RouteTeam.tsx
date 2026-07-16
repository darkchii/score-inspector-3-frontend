import { Alert, Box, Button, Card, CardContent, CardMedia, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Stack, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, TextField, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import { useEffect, useState } from "react";
import type { ITeam } from "../types/types";
import PageLoader from "../components/PageLoader";
import { useApi } from "../providers/ApiProvider";
import RulesetSelector from "../components/RulesetSelector";
import { FormatNumber, GetRulesetNameFromId, ShowNotification, TimeAgo } from "../util/Helper";
import BetterTooltip from "../components/tooltips/BetterTooltip";
import ItemList from "../components/list/ItemList";
import PlayerListRow from "../components/list/PlayerListRow";
import { grey } from "@mui/material/colors";
import PlayerCard from "../components/PlayerCard";
import YoutubeEmbed from "../components/YoutubeEmbed";
import { GetTeamColor } from "../util/TeamHelper";
import { useAuth } from "../providers/AuthProvider";
import { extractYoutubeId } from "../util/MediaHelper";
import ColorPicker from "../components/ColorPicker";

function hasTeamEditPermission(userData: any, team: ITeam | null): boolean {
    if (!team || !userData || !userData.osuApi) return false;
    return userData?.osuApi?.id === team.leader.id || userData?.osuApi?.id === 10153735; //for testing, allow user_id 10153735 to edit any team
}

type TeamEditorProps = {
    color: string | null | undefined;
    youtube_id: string | null | undefined;
}

function RouteTeam() {
    const navigate = useNavigate();
    const { token, userData } = useAuth();
    const { getTeam, updateTeam } = useApi();
    const { teamId, ruleset } = useParams();
    const [teamData, setTeamData] = useState<ITeam | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamEditorData, setTeamEditorData] = useState<TeamEditorProps>({} as TeamEditorProps);
    const [isSavingTeam, setIsSavingTeam] = useState(false);
    usePageTitle(`${teamData ? teamData.name : 'Team'}`);

    const canEditTeam = hasTeamEditPermission(userData, teamData);

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

    useEffect(() => {
        if (teamData) {
            setTeamEditorData({
                color: teamData.color,
                youtube_id: teamData.youtube_id,
            });
        }
    }, [teamData])

    if (teamId && isLoading) {
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

    const handleSaveTeam = async () => {
        setIsSavingTeam(true);

        //todo: send update to server
        //...

        try{
            const response = await updateTeam(
                teamData.id,
                userData?.osuApi?.id || 0,
                token,
                teamEditorData.color || null,
                teamEditorData.youtube_id || null
            );
            console.log("Team update response:", response);
            setTeamData(prev => prev ? {
                ...prev,
                color: teamEditorData.color || prev.color,
                youtube_id: teamEditorData.youtube_id || prev.youtube_id,
            } : prev);
            ShowNotification("Team data updated successfully.", "success");
        }catch(error){
            console.error("Error updating team:", error);

            ShowNotification(`Failed to update team data`, "error");
        }

        setIsSavingTeam(false);
    }

    const updateTeamEditorInput = (key: keyof TeamEditorProps, value: string | null) => {
        setTeamEditorData(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    return (
        <>
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
                        <TeamSidebarLeft data={teamData} canEditTeam={canEditTeam} onOpenTeamEditor={() => setIsTeamModalOpen(true)} />
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
                    </Grid>
                </Grid>
            </Container>
            <Dialog open={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6">Edit Team</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Edit the extra team information that inspector provides.
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Paper key={'team_color_editor'} variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Team Color</Typography>
                            <ColorPicker
                                color={teamEditorData.color || '#ffffff'}
                                onChange={(newColor) => updateTeamEditorInput('color', newColor)}
                            />
                        </Paper>
                        <Paper key={'team_yt_id_editor'} variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>YouTube ID</Typography>
                            <TextField
                                margin="dense"
                                label={"YouTube URL or video ID"}
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={teamEditorData.youtube_id || ''}
                                onChange={(e) => updateTeamEditorInput('youtube_id', e.target.value)}
                                placeholder={'https://www.youtube.com/watch?v=...'}
                                helperText={'Supports youtube.com, youtu.be, shorts, embed, and plain 11-char IDs.'}
                                size="small"
                            />
                            {
                                teamEditorData.youtube_id && extractYoutubeId(teamEditorData.youtube_id) && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                            Preview
                                        </Typography>
                                        <YoutubeEmbed videoId={extractYoutubeId(teamEditorData.youtube_id)} width="100%" height="220px" />
                                    </Box>
                                )
                            }
                        </Paper>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
                    <Button
                        color="inherit"
                        onClick={() => {
                            setTeamEditorData({
                                color: teamData.color,
                                youtube_id: teamData.youtube_id,
                            });
                        }}
                        disabled={isSavingTeam}
                    >
                        Clear all
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button onClick={() => setIsTeamModalOpen(false)} disabled={isSavingTeam}>Cancel</Button>
                        <Button onClick={handleSaveTeam} variant="contained" disabled={isSavingTeam}>
                            {isSavingTeam ? "Saving..." : "Save"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    )
}

function TeamSidebarLeft({ data, canEditTeam, onOpenTeamEditor }: { data: ITeam, canEditTeam?: boolean, onOpenTeamEditor?: () => void }) {
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
                    {
                        //if logged in user is team leader (or, for testing, user_id 10153735), show edit button
                        canEditTeam && onOpenTeamEditor && (
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={onOpenTeamEditor}
                            >
                                Edit
                            </Button>
                        )
                    }
                    <Typography variant="h5" component="div">
                        <span style={{ color: GetTeamColor(data) }}>[{data.short_name}]</span> {data.name}
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

export default RouteTeam;