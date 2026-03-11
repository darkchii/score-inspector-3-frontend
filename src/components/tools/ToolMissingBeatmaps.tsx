import { Box, Button, Chip, CircularProgress, Collapse, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useApi } from "../../providers/ApiProvider";
import React, { useEffect, useState } from "react";
import { FormatNumber, GetRulesetPrettyNameFromId, GetStatusLabelFromInt, readFileAsync, ShowNotification } from "../../util/Helper";
import { Virtuoso } from "react-virtuoso";
import { DataGrid } from "@mui/x-data-grid";
import { OsuDb } from "../../types/database/OsuDb";

function ToolMissingBeatmaps() {
    const [allBeatmaps, setAllBeatmaps] = useState([]);
    const [sortedBeatmaps, setSortedBeatmaps] = useState<any>([]);
    const [beatmapStats, setBeatmapStats] = useState({});
    const [isDownloading, setIsDownloading] = useState(false);
    const [isWorking, setIsWorking] = useState(false);

    const { getBeatmapsLive, getProcessedRealm } = useApi();

    useEffect(() => {
        (async () => {
            setIsDownloading(true);
            try {
                const beatmaps = await getBeatmapsLive(true);
                setAllBeatmaps(beatmaps);

                //group beatmaps by [.mode][.ranked_raw] => [beatmaps]
                const grouped = {};
                beatmaps.forEach(beatmap => {
                    if (!grouped[beatmap.mode]) {
                        grouped[beatmap.mode] = {};
                    }
                    if (!grouped[beatmap.mode][beatmap.ranked_raw]) {
                        grouped[beatmap.mode][beatmap.ranked_raw] = [];
                    }
                    grouped[beatmap.mode][beatmap.ranked_raw].push(beatmap);
                }
                );

                setSortedBeatmaps(grouped);
            }
            catch (error) {
                console.error('Error fetching beatmaps:', error);
            }
            setIsDownloading(false);
        })();
    }, []);

    const [clientData, setClientData] = useState(null);

    const processBeatmaps = (clientBeatmaps, clientData) => {
        //assume clientBeatmaps is an array of { ID, Hash, Status }

        const allBeatmapsMap = {};
        allBeatmaps.forEach(beatmap => {
            allBeatmapsMap[beatmap.beatmap_id] = beatmap;
        });

        const clientBeatmapsMap = {};
        clientBeatmaps.forEach(beatmap => {
            clientBeatmapsMap[beatmap.ID] = beatmap;
        });

        //compare with allBeatmaps, find missing beatmaps by hash, and mismatched status
        const failedMatches = []; // { beatmap, reason, client, server }
        allBeatmaps.forEach(beatmap => {
            const clientBeatmap = clientBeatmapsMap[beatmap.beatmap_id];
            if (!clientBeatmap) {
                failedMatches.push({ beatmap, reason: 'missing', client: null, server: null });
            } else if (clientBeatmap.Hash !== beatmap.checksum) {
                failedMatches.push({ beatmap, reason: 'hash', client: clientBeatmap.Hash, server: beatmap.checksum });
            } else if (clientBeatmap.Status !== beatmap.ranked_raw) {
                failedMatches.push({ beatmap, reason: 'status', client: clientBeatmap.Status, server: beatmap.ranked_raw });
            }
        })

        console.log('Failed matches (osu!lazer):', failedMatches);

        setClientData({
            client: clientData,
            failedMatches: failedMatches,
            missingMapsCount: failedMatches.filter(m => m.reason === 'missing').length,
            hashMismatchesCount: failedMatches.filter(m => m.reason === 'hash').length,
            statusMismatchesCount: failedMatches.filter(m => m.reason === 'status').length,
        });
    }

    const processLazerRealm = (jsonData) => {
        if (!jsonData?.beatmapSets) {
            ShowNotification('No beatmap sets found in realm file', 'error');
            return;
        }

        //get all beatmaps
        const clientBeatmaps = jsonData.beatmapSets.flatMap(set => set.Beatmaps.map(beatmap => ({
            //only things we care about to match
            ID: beatmap.OnlineID,
            Hash: beatmap.MD5Hash,
            Status: beatmap.Status
        })));

        console.log(jsonData);

        processBeatmaps(clientBeatmaps, {
            name: 'osu!lazer',
            version: jsonData.version,
        });
    }

    const getProcessedOsuDb = async (file) => {
        const osuDbData = await readFileAsync(file);

        const db = new OsuDb(osuDbData);
        // console.log('Parsed osu!.db:', db);

        if(!db.Beatmaps || db.Beatmaps.length === 0) {
            ShowNotification('No beatmaps found in osu!.db file', 'error');
            return;
        }

        console.log(db);

        const clientBeatmaps = db.Beatmaps.map(beatmap => ({
            ID: beatmap.beatmapID,
            Hash: beatmap.MD5Hash,
            Status: beatmap.RankedStatus //db stores only positive integers, but unranked maps are below 0, so offset is 3
        }));

        processBeatmaps(clientBeatmaps, {
            name: 'osu!stable',
            version: db.OsuVersion,
        });
    }

    const _requestFileUpload = (type) => {
        //open file dialog and wait for user to select file, then read the file as array buffer and send to server
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'osu' ? '.db' : '.realm';
        input.onchange = async (event: any) => {
            setIsWorking(true);
            const file = event.target.files[0];
            if (file) {
                if (type === 'realm') {
                    try {
                        const response = await getProcessedRealm(file);
                        if (response?.beatmapSets) {
                            processLazerRealm(response);
                            ShowNotification(`Extracted ${response.beatmapSets.length} beatmap sets`, 'success');
                        }
                    } catch (error) {
                        console.error('Error processing realm file:', error);
                        ShowNotification(error?.response?.data?.error || 'Error processing realm file', 'error');
                    }
                } else {
                    try {
                        const response = await getProcessedOsuDb(file);
                    }catch(error) {
                        console.error('Error processing osu!.db file:', error);
                        ShowNotification(error?.response?.data?.error || 'Error processing osu!.db file', 'error');
                    }
                }
            }
            setIsWorking(false);
        };
        input.click();
    }

    if (isDownloading || !sortedBeatmaps || !beatmapStats) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={48} />
                <Typography variant="h6" sx={{ ml: 2 }}>Fetching beatmaps...</Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Box>
                <Typography variant="body2" gutterBottom>Fetched {FormatNumber(allBeatmaps.length)} beatmaps</Typography>
            </Box>
            {/* equal width items */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="outlined" color="primary" fullWidth onClick={() => _requestFileUpload('osu')} disabled={isWorking}>
                    (osu!stable) Upload osu!.db
                </Button>
                <Button variant="outlined" color="primary" fullWidth onClick={() => _requestFileUpload('realm')} disabled={isWorking}>
                    (osu!lazer) Upload client.realm
                </Button>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Either of the files can be found in the root directory of the game. The osu!lazer realm file is sent to the server, as processing cannot be done locally. No data is stored.
                </Typography>
            </Box>
            <Collapse in={clientData !== null && !isWorking} sx={{ mt: 2 }}>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom>Results for {clientData?.client?.name} <Chip label={`v${clientData?.client?.version}`} size="small" /></Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <Typography variant="subtitle1">Missing Beatmaps</Typography>
                                <Typography variant="h5">{FormatNumber(clientData?.missingMapsCount || 0)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <Typography variant="subtitle1">Hash Mismatches</Typography>
                                <Typography variant="h5">{FormatNumber(clientData?.hashMismatchesCount || 0)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <Typography variant="subtitle1">Status Mismatches</Typography>
                                <Typography variant="h5">{FormatNumber(clientData?.statusMismatchesCount || 0)}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <MissingMapVirtualTable data={clientData?.failedMatches || []} />
                    </Box>
                </Box>
            </Collapse>
            <Collapse in={isWorking} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                    <CircularProgress size={48} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Processing...</Typography>
                </Box>
            </Collapse>
        </Box>
    );
}

const missingLabelMap = {
    'missing': 'Missing',
    'hash': 'Hash Mismatch',
    'status': 'Status Mismatch',
}

const columns = [
    {
        field: 'id',
        headerName: 'ID',
        valueGetter: (value, row) => row.beatmap.beatmap_id,
    },
    {
        field: 'name',
        headerName: 'Name',
        valueGetter: (value, row) => `${row.beatmap.artist} - ${row.beatmap.title} [${row.beatmap.version}]`,
        flex: 1
    },
    {
        field: 'ruleset',
        headerName: 'Ruleset',
        valueGetter: (value, row) => GetRulesetPrettyNameFromId(row.beatmap.mode),
    },
    {
        field: 'status',
        headerName: 'Status',
        valueGetter: (value, row) => GetStatusLabelFromInt(row.beatmap.ranked_raw),
    },
    {
        field: 'reason',
        headerName: 'Reason',
        valueGetter: (value, row) => missingLabelMap[row.reason] || row.reason,
        width: 150
    },
    {
        field: 'clientValue',
        headerName: 'Client Value',
        valueGetter: (value, row) => row.client || '-',
    },
    {
        field: 'serverValue',
        headerName: 'Server Value',
        valueGetter: (value, row) => row.server || '-',
    },
    {
        field: 'link',
        headerName: 'Link',
        renderCell: (params) => (
            <React.Fragment>
                <Button variant="outlined" size="small" href={`https://osu.ppy.sh/beatmaps/${params.row.beatmap.beatmap_id}`} target="_blank">
                    osu!
                </Button>
                <Button variant="outlined" size="small" href={`osu://b/${params.row.beatmap.beatmap_id}`} sx={{ ml: 1 }}>
                    osu!direct
                </Button>
            </React.Fragment>
        ),
        width: 200
    },
]

function MissingMapVirtualTable({ data }) {
    return (
        <DataGrid
            rows={data.map((item, index) => ({ id: index, ...item }))}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 25,
                    },
                },
            }}
            pageSizeOptions={[25]}
            disableRowSelectionOnClick
        />
    )
}

export default ToolMissingBeatmaps;