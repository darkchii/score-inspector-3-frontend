import React, { memo, useEffect, useMemo, useState } from "react";
import BetterTooltip from "../../tooltips/BetterTooltip";
import dateGridStyles from '../../../styles/date-grid.module.less';
import { useProfile } from "../../../providers/ProfileProvider";
import { FormatNumber, HexToRgb } from "../../../util/Helper";
import { Box, Fade, Modal, Paper, useTheme } from "@mui/material";
import { BeatmapList } from "../../BeatmapList";

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
        // if (pack.is_completed) {
        //     return '#4caf50'; //green
        // } else if (pack.completed > 0) {
        //     return '#ff9800'; //orange
        // } else {
        //     return '#f44336'; //red
        // }
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
                <div><strong>Pack:</strong> {pack.name}</div>
                <div><strong>Date:</strong> {new Date(pack.pack_date).toLocaleDateString()}</div>
                <div><strong>Tag:</strong> {pack.tag}</div>
                <div><strong>Completed:</strong> {FormatNumber(pack.completed)} / {FormatNumber(pack.total)}</div>
            </React.Fragment>
        }>
            <div
                className={`${dateGridStyles['date-grid__square']} ${dateGridStyles['date-grid__square--clickable']}`}
                style={{ backgroundColor: color }}
                onClick={onClick}
            />
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
                        <Paper style={{ padding: '16px', maxWidth: '90vw', minWidth: '40vw' }}>
                            <Box>
                                <h2>{pack.name}</h2>
                                <div style={{
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                }}>
                                    <BeatmapList beatmaps={beatmaps} showPlayed={true} />
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
            if (a.tag < b.tag) return -1;
            if (a.tag > b.tag) return 1;
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
                    total_beatmaps: 0,
                    total_scores: 0,
                }
            }
            categorized[typeFullName].packs.push(pack);
            categorized[typeFullName].total += 1;
            categorized[typeFullName].total_beatmaps += pack.total;
            categorized[typeFullName].total_scores += pack.completed;
        }

        //calculate completion per category
        for (const type in categorized) {
            const category = categorized[type];
            category.completion = category.total_beatmaps > 0 ? (category.total_scores / category.total_beatmaps) : 0;
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
                            <h3>{type}</h3>
                            <div style={{
                                display: 'inline-flex',
                                flexWrap: 'wrap',
                                '--square-size': '15px',
                                '--square-gap': '2px',
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
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default ProfilePagePacks;