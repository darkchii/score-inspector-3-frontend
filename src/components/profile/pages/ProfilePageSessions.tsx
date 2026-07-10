import { Alert, Box, Divider, Grid, List, ListItemButton, ListItemText, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, Typography, useTheme } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import { TextureDatabase } from "../../../assets/textures/TextureDatabase";
import NumberFlow from "@number-flow/react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormatDuration, FormatNumber, FormatNumberWithPrecision } from "../../../util/Helper";
import ProfileDailyChart from "./daily/ProfileDailyChart";
import ItemList from "../../list/ItemList";
import ScoreListRow from "../../list/ScoreListRow";
import type { ISession } from "../../../types/types";

type SessionSortField = 'start' | 'duration' | 'score_count' | 'cumulative_pp' | 'cumulative_implied_total_score' | 'cumulative_lazer_score';

type SessionSortFieldDefinition<K extends SessionSortField = SessionSortField> = {
    label: string;
    field: K;
    format?: (value: ISession[K]) => string;
}

const createSessionSortFieldDefinition = <K extends SessionSortField>(definition: SessionSortFieldDefinition<K>): SessionSortFieldDefinition<K> => definition;

const SESSION_SORT_FIELDS = [
    createSessionSortFieldDefinition({ label: 'Date', field: 'start', format: (value) => value.toLocaleString() }),
    createSessionSortFieldDefinition({ label: 'Duration', field: 'duration', format: (value) => String(FormatDuration(value)) }),
    createSessionSortFieldDefinition({ label: 'Scores', field: 'score_count', format: (value) => FormatNumber(value) }),
    createSessionSortFieldDefinition({ label: 'Performance', field: 'cumulative_pp', format: (value) => FormatNumberWithPrecision(value, 2) + ' pp' }),
    createSessionSortFieldDefinition({ label: 'Score', field: 'cumulative_implied_total_score', format: (value) => FormatNumber(value) }),
    createSessionSortFieldDefinition({ label: 'Lazer Score', field: 'cumulative_lazer_score', format: (value) => FormatNumber(value) }),
];

const isSessionSortField = (field: string): field is SessionSortField => SESSION_SORT_FIELDS.some(sortField => sortField.field === field);

function SessionDisplay({ session }: { session: ISession | null }) {
    const theme = useTheme();

    if (!session) return <Alert severity="info">No session selected.</Alert>;

    return (
        <Box>
            <Box sx={{ flex: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeXH} alt="XH" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.XH || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeX} alt="X" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.X || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeSH} alt="SH" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.SH || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeS} alt="S" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.S || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeA} alt="A" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.A || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeB} alt="B" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.B || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeC} alt="C" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.C || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeD} alt="D" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.D || 0} /></Typography>
                </Box>
            </Box>
            <Paper elevation={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', p: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">{session.start.toLocaleString()}</Typography>
                    <ArrowForwardIosIcon />
                    <Typography><NumberFlow value={Math.floor(session.duration / 60)} /> minutes</Typography>
                    <ArrowForwardIosIcon />
                    <Typography variant="h6">{session.end.toLocaleString()}</Typography>
                </Box>
            </Paper>
            <Paper elevation={1} sx={{ mt: 2 }}>
                <TableContainer>
                    <Table size='small' sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                        },
                    }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                                <TableCell><>{FormatDuration(session.duration)}</></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Scores</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.score_count} /></TableCell>
                            </TableRow>
                            {/* Empty row for spacing */}
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.cumulative_implied_total_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.average_implied_total_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.max_implied_total_score} /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Standardised Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.cumulative_lazer_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Standardised Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.average_lazer_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Standardised Score</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 0 }} value={session.max_lazer_score} /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.cumulative_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.average_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.max_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Breaks Taken</TableCell>
                                <TableCell><NumberFlow value={session.break_count} /></TableCell>
                            </TableRow>
                            {
                                session.break_count > 0 ? (
                                    <>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Total Break Time</TableCell>
                                            <TableCell><>{FormatDuration(session.total_break_time || 0)}</></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Average Break Time</TableCell>
                                            <TableCell><>{FormatDuration(session.average_break_time || 0)}</></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Longest Break Time</TableCell>
                                            <TableCell><>{FormatDuration(session.longest_break_time || 0)}</></TableCell>
                                        </TableRow></>
                                ) : null
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Divider sx={{ my: 2 }} />
            <ProfileDailyChart
                sessions={{ sessions: [session] }}
                scores={session.scores}
                dateStart={session.start.toISOString().split('T')[0]}
                dateEnd={null}
                displayStartEnd={false}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Scores</Typography>
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {
                    session.scores.length === 0 ? (
                        <Alert severity="info">No scores available for this session.</Alert>
                    ) : (
                        <ItemList
                            truncate
                            items={session.scores}
                            ItemListRowType={ScoreListRow}
                        />
                    )
                }
            </Box>
        </Box >
    );
}

const _sessionsPerPage = 10;
function ProfilePageSessions() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [displaySessionData, setDisplaySessionData] = useState<ISession | null>(null);

    const [sessionCount, setSessionCount] = useState(0);
    const [sessionSelectorPage, setSessionSelectorPage] = useState(0);
    const [sessionArray, setSessionArray] = useState<ISession[] | null>(null);
    const [sessionSorting, setSessionSorting] = useState<SessionSortField>('start');
    const [sessionSortingDirection, setSessionSortingDirection] = useState<'asc' | 'desc'>('desc');

    //use session_sort_fields, expanding to add asc and desc options
    const ADJUSTED_SORT_FIELDS = SESSION_SORT_FIELDS.flatMap(field => ([
        { label: field.label, field: field.field, direction: 'desc' },
        { label: field.label, field: field.field, direction: 'asc' },
    ]));

    const getSession = () => {
        if (!selectedSessionId) return null;
        return getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.getById(selectedSessionId);
    };

    const onSessionSortChange = (field: SessionSortField, direction: 'asc' | 'desc', sessions: ISession[] | null = null) => {
        if (!sessionArray && !sessions) return;
        const sortedSessions: ISession[] = [...(sessions || sessionArray || [])];
        sortedSessions.sort((a: ISession, b: ISession) => {
            if (direction === 'asc') {
                if (a[field as keyof ISession] < b[field as keyof ISession]) return -1;
                if (a[field as keyof ISession] > b[field as keyof ISession]) return 1;
                return 0;
            } else {
                if (a[field as keyof ISession] > b[field as keyof ISession]) return -1;
                if (a[field as keyof ISession] < b[field as keyof ISession]) return 1;
                return 0;
            }
        });
        setSessionSorting(field);
        setSessionSortingDirection(direction);
        setSessionArray(sortedSessions);
    }

    const getSessionSecondaryText = (session: ISession): string => {
        const selectedSortField = SESSION_SORT_FIELDS.find(field => field.field === sessionSorting);
        if (!selectedSortField) return '';

        switch (selectedSortField.field) {
            case 'start':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.start) : String(session.start)}`;
            case 'duration':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.duration) : String(session.duration)}`;
            case 'score_count':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.score_count) : String(session.score_count)}`;
            case 'cumulative_pp':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.cumulative_pp) : String(session.cumulative_pp)}`;
            case 'cumulative_implied_total_score':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.cumulative_implied_total_score) : String(session.cumulative_implied_total_score)}`;
            case 'cumulative_lazer_score':
                return `${selectedSortField.label}: ${selectedSortField.format ? selectedSortField.format(session.cumulative_lazer_score) : String(session.cumulative_lazer_score)}`;
        }
    }

    useEffect(() => {
        const sessions = getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.get();
        const count = sessions?.length || 0;
        setSessionCount(count);
        setSelectedSessionId(null);
        setSessionSelectorPage(0);
        onSessionSortChange('start', 'desc', sessions || []);
    }, [getRulesetStatistics, activeRuleset]);

    useEffect(() => {
        setDisplaySessionData(getSession());
    }, [selectedSessionId]);

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            <Grid container spacing={2}>
                {/* Session listing sidebar*/}
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        <Box sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
                            {sessionCount === 0 ? (
                                <Typography>No sessions available.</Typography>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                                        {/* sorting control (dropdown menu, each field gets two options: ascending and descending) */}
                                        <Typography>Sort by:</Typography>
                                        <Select
                                            sx={{
                                                flexGrow: 1,
                                            }}
                                            size="small"
                                            value={`${sessionSorting}-${sessionSortingDirection}`}
                                            onChange={(e) => {
                                                const [field, order] = e.target.value.split('-');
                                                if (!isSessionSortField(field)) return;
                                                onSessionSortChange(field, order as 'asc' | 'desc');
                                            }}
                                        >
                                            {ADJUSTED_SORT_FIELDS.map((option) => (
                                                <MenuItem
                                                    key={`${option.field}-${option.direction}`}
                                                    value={`${option.field}-${option.direction}`}
                                                >
                                                    {option.label} {option.direction === 'desc' ? '↓' : '↑'}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <Pagination
                                            count={Math.ceil(sessionCount / _sessionsPerPage)}
                                            page={sessionSelectorPage + 1}
                                            onChange={(event, value) => setSessionSelectorPage(value - 1)}
                                            color="primary"
                                        />
                                    </Box>
                                    <List>
                                        {sessionArray?.slice(sessionSelectorPage * _sessionsPerPage, (sessionSelectorPage + 1) * _sessionsPerPage).map((session) => (
                                            <ListItemButton
                                                key={session.id}
                                                selected={selectedSessionId === session.id}
                                                onClick={() => setSelectedSessionId(session.id)}
                                            >
                                                <ListItemText
                                                    primary={`${session.start.toLocaleString()}`}
                                                    // secondary={`Duration: ${FormatDuration(session.duration)}, Scores: ${session.score_count}`} />
                                                    secondary={getSessionSecondaryText(session)} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
                {/* Session viewer */}
                <Grid size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        {
                            (!selectedSessionId || displaySessionData === undefined) ? (
                                <Alert severity="info">Please select a session to view details.</Alert>
                            ) : (
                                <SessionDisplay session={displaySessionData} />
                            )
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageSessions;