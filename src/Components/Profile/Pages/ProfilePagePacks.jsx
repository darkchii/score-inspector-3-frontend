import React, { memo, useEffect, useMemo, useState } from "react";
import BetterTooltip from "../../tooltips/BetterTooltip";
import dateGridStyles from '../../../styles/date-grid.module.less';
import { useProfile } from "../../../providers/ProfileProvider";
import { FormatNumber, HexToRgb } from "../../../util/Helper";
import { Alert, Box, Button, Fade, Modal, Paper, Typography, useTheme } from "@mui/material";
import NumberFlow from "@number-flow/react";
import StarIcon from '@mui/icons-material/Star';
import ItemList from "../../list/ItemList";
import BeatmapListRow from "../../list/BeatmapListRow";

//Tag -> Full Name
const BeatmappackTypes = {
    "S": "Standard",
    "F": "Featured Artist",
    "P": "Tournament",
    "L": "Project Loved",
    "R": "Spotlights",
    "T": "Theme",
    "A": "Artist/Album"
}

const PackSquare = memo(function PackSquare({ pack, onClick }) {
    const theme = useTheme();
    const startSquareColor = HexToRgb('#1a1a1a');
    const endSquareColor = HexToRgb(theme.palette.primary.main);

    const color = useMemo(() => {
        if (pack.is_completed) {
            return 'gold';
        }
        let progress = pack.completion * 0.01;
        let color = `rgb(${Math.round(startSquareColor[0] + (endSquareColor[0] - startSquareColor[0]) * progress)}, ${Math.round(startSquareColor[1] + (endSquareColor[1] - startSquareColor[1]) * progress)}, ${Math.round(startSquareColor[2] + (endSquareColor[2] - startSquareColor[2]) * progress)})`;
        return color;
    }, [pack.completion]);

    return (
        <BetterTooltip title={
            <React.Fragment>
                <div><strong>Pack:</strong> ({pack.tag}) {pack.name}</div>
                <div><strong>Date:</strong> {new Date(pack.pack_date).toLocaleDateString()}</div>
                <div><strong>Completed:</strong> {FormatNumber(pack.completed)} / {FormatNumber(pack.total)}</div>
            </React.Fragment>
        }>
            <div
                className={`${dateGridStyles['date-grid__square']} ${dateGridStyles['date-grid__square--clickable']}`}
                style={{ backgroundColor: color }}
                onClick={onClick}
            >
                {
                    pack.completed_fc === pack.total ? (
                        <div style={{
                            position: 'absolute',
                            top: '45%',
                            left: '50%',
                            transform: 'translate(-50%, -55%)',
                        }}>
                            <StarIcon style={{ color: 'black', fontSize: '0.8rem' }} />
                        </div>
                    ) : null
                }
            </div>
        </BetterTooltip>
    )
});

function PackModal({ pack, onClose }) {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [enabled, setEnabled] = useState(false);
    const [beatmaps, setBeatmaps] = useState([]);

    useEffect(() => {
        //get beatmaps
        if (pack) {
            const stats = getRulesetStatistics(activeRuleset);
            const beatmapsMap = stats.getBeatmapsMap();
            const bms = [];
            for (const beatmapId of pack.beatmap_ids) {
                const bm = beatmapsMap[beatmapId];
                if (bm) {
                    bms.push(bm);
                }
            }

            //resort by star rating, but keep grouped by beatmapset_id
            bms.sort((a, b) => {
                let bma = beatmapsMap[a.beatmap_id];
                let bmb = beatmapsMap[b.beatmap_id];

                if (bma.beatmapset_id === bmb.beatmapset_id) {
                    return bma.stars - bmb.stars;
                }
                return bma.beatmapset_id - bmb.beatmapset_id;
            });

            setBeatmaps(bms);
            setEnabled(true);
        } else {
            setEnabled(false);
            setBeatmaps([]);
        }
    }, [pack]);

    if (!pack) {
        return null;
    }

    return (
        <>
            <Modal
                open={enabled}
                onClose={onClose}
                closeAfterTransition
                style={{
                    //prevent blue outline on focus
                    '&:focus': {
                        outline: 'none',
                    },
                }}
            >
                <Fade in={enabled}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        outline: 0,
                    }}>
                        <Paper style={{ padding: '16px', maxWidth: '90vw', minWidth: '50vw' }}>
                            <Box sx={{
                                position: 'relative'
                            }}>
                                {/* downloading button in top-right corner */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        href={pack.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Download Pack
                                    </Button>
                                </Box>
                                <Typography variant="h6">({pack.tag}) {pack.name}</Typography>
                                <div>
                                    by <strong>{pack.author}</strong>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>Date:</strong> {new Date(pack.pack_date).toLocaleDateString()} &nbsp; | &nbsp;
                                    <strong>Completed:</strong> <NumberFlow value={pack.completed} /> / <NumberFlow value={pack.total} /> &nbsp; | &nbsp;
                                    <strong>Completion:</strong> <NumberFlow format={{ maximumFractionDigits: 2 }} value={pack.completion} suffix="%" />
                                </div>
                                <div style={{
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                }}>
                                    <ItemList
                                        items={beatmaps}
                                        // showPlayed={true}
                                        passthroughProps={{
                                            showPlayed: true
                                        }}
                                        ItemListRowType={BeatmapListRow}
                                    />
                                </div>
                            </Box>
                        </Paper>
                    </div>
                </Fade>
            </Modal>
        </>
    );
}

function ProfilePagePacks() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [categorizedPacks, setCategorizedPacks] = useState(null);
    const [selectedPack, setSelectedPack] = useState(null);

    useEffect(() => {
        if (!activeRuleset) return;
        setSelectedPack(null);

        const packs = getRulesetStatistics(activeRuleset)?.pack_statistics.packs || [];

        //sort by tag ascending
        packs.sort((a, b) => {
            // if (a.tag < b.tag) return -1;
            // if (a.tag > b.tag) return 1;
            // return 0;

            //need it smarter, split letters from numbers and sort by both of them separately
            const tagA = a.tag;
            const tagB = b.tag;

            const regex = /([a-zA-Z]+)(\d+)/;

            const matchA = tagA.match(regex);
            const matchB = tagB.match(regex);

            if (matchA && matchB) {
                const letterA = matchA[1];
                const numberA = parseInt(matchA[2]);
                const letterB = matchB[1];
                const numberB = parseInt(matchB[2]);
                if (letterA < letterB) return -1;
                if (letterA > letterB) return 1;
                return numberA - numberB;
            }
            return 0;
        });

        const categorized = {};

        for (const pack of packs) {
            //get first letter of pack.tag
            const packType = pack.tag.charAt(0);
            const typeFullName = BeatmappackTypes[packType] || "Other";
            if (!categorized[typeFullName]) {
                categorized[typeFullName] = {
                    type: typeFullName,
                    packs: [],
                    total_packs: 0,
                    total_completed: 0,
                    total_completed_fc: 0,
                    total_beatmaps: 0,
                    total_scores: 0,
                    total_scores_fc: 0,
                }
            }
            categorized[typeFullName].packs.push(pack);
            categorized[typeFullName].total_packs += 1;
            categorized[typeFullName].total_completed += pack.is_completed ? 1 : 0;
            categorized[typeFullName].total_completed_fc += pack.is_completed_fc ? 1 : 0;
            categorized[typeFullName].total_beatmaps += pack.total;
            categorized[typeFullName].total_scores += pack.completed;
            categorized[typeFullName].total_scores_fc += pack.completed_fc;
        }

        //calculate completion per category
        for (const type in categorized) {
            const category = categorized[type];
            category.completion = category.total_beatmaps > 0 ? (category.total_scores / category.total_beatmaps) : 0;
            category.completion_fc = category.total_beatmaps > 0 ? (category.total_scores_fc / category.total_beatmaps) : 0;
        }

        setCategorizedPacks(categorized);

        console.log(categorized);
    }, [activeRuleset]);

    if (!categorizedPacks) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <PackModal pack={selectedPack} onClose={() => setSelectedPack(null)} />
            <div style={{
                padding: '8px',
            }}>
                {
                    Object.entries(categorizedPacks).map(([type, packs]) => (
                        <div key={type} style={{ marginBottom: '16px' }}>
                            <Typography variant="h6" gutterBottom>{type}</Typography>
                            {/* show stats here in-line */}
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Packs:</strong> <NumberFlow value={packs.total_packs} /> &nbsp; | &nbsp;
                                <strong>Completed:</strong> <NumberFlow value={packs.total_completed} /> (<NumberFlow value={packs.total_completed_fc} /> full combo'd) &nbsp; | &nbsp;
                                <BetterTooltip title="By pack count, not beatmap count">
                                    <strong>Completion:</strong> <NumberFlow format={{ maximumFractionDigits: 2 }} value={packs.total_packs > 0 ? (packs.total_completed / packs.total_packs * 100) : 0} suffix="%" />
                                </BetterTooltip>
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                flexWrap: 'wrap',
                                '--square-size': '14px',
                                '--square-gap': '1px',
                            }}>
                                {
                                    packs.packs.map(pack => (
                                        <PackSquare
                                            key={pack.id}
                                            pack={pack}
                                            onClick={() => setSelectedPack(pack)}
                                        />
                                    ))
                                }
                            </div>
                            <Alert severity="info" style={{ marginTop: '8px' }}>
                                All packs shown here have beatmaps for the currently selected ruleset ({activeRuleset}). Even if the pack was designed for another ruleset, some sets may include beatmaps for multiple rulesets.<br />
                                Unless if you are viewing the "All"/combined ruleset, the non-{activeRuleset} beatmaps in these packs are filtered out.
                            </Alert>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default ProfilePagePacks;