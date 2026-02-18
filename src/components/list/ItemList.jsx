import { Box, Table, TableBody, tableCellClasses, TableContainer, tableRowClasses, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const truncateStep = 10;
function ItemList({
    startIndex = 0,
    showIndex = false,
    items,
    isCompact = false,
    truncate = false,
    truncateStartStep = truncateStep,
    leaderboardField = null,
    leaderboardFormat = null,
    passthroughProps = {},
    ItemListRowType
}) {

    const theme = useTheme();
    const [displayCount, setDisplayCount] = useState(truncate ? truncateStartStep : items?.length || 0);

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [isMobile, setIsMobile] = useState(windowDimensions.width < theme.breakpoints.values.md);

    useEffect(() => {
        function handleResize() {
            const newDimensions = getWindowDimensions();
            setWindowDimensions(newDimensions);
            setIsMobile(newDimensions.width < theme.breakpoints.values.md);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (truncate) {
            setDisplayCount(truncateStartStep);
        } else {
            setDisplayCount(items?.length || 0);
        }
    }, [truncate, items?.length]);

    return (
        <>
            <TableContainer>
                <Table size="small" sx={{
                    [`& .${tableCellClasses.root}`]: {
                        borderBottom: "none",
                        color: 'white !important',
                        //reduce all padding
                        paddingLeft: theme.spacing(1),
                        paddingRight: theme.spacing(1),
                    },
                    [`& .${tableRowClasses.root}`]: {
                        borderBottom: "none",
                    },
                    borderCollapse: 'separate',
                    borderSpacing: '0 8px',
                }}>
                    <TableBody sx={{
                        position: 'relative',
                        ['& .MuiTableRow-root']: {
                            borderRadius: theme.shape.borderRadius,
                        },
                    }}>
                        {items?.slice(0, displayCount).map((item, index) => (
                            <ItemListRowType
                                key={item?.id || index}
                                item={item}
                                index={index}
                                showIndex={showIndex}
                                startIndex={startIndex}
                                isCompact={isCompact}
                                leaderboardField={leaderboardField}
                                leaderboardFormat={leaderboardFormat}
                                isMobile={isMobile}
                                {...passthroughProps}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {
                truncate && displayCount < (items?.length || 0) ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Typography sx={{ cursor: 'pointer', color: theme.palette.primary.main }} onClick={() => setDisplayCount(prev => Math.min(prev + truncateStep, items.length))}>
                            Show more...
                        </Typography>
                    </Box>
                ) : null
            }
        </>
    )
}

export default ItemList;