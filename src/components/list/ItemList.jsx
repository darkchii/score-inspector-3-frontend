import { Box, Table, TableBody, tableCellClasses, TableContainer, tableRowClasses, Typography, useTheme } from "@mui/material";
import { useEffect, useState, useMemo, useCallback, memo } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const truncateStep = 10;
const ItemList = memo(function ItemList({
    startIndex = 0,
    showIndex = false,
    showIndexDifference = false,
    indexDifferencePosition = null,
    indexFromItem = null,
    items,
    isCompact = false,
    truncate = false,
    truncateStartStep = truncateStep,
    leaderboardField = null,
    secondaryLeaderboardField = null,
    leaderboardFormat = null,
    passthroughProps = {},
    ItemListRowType
}) {

    const theme = useTheme();
    const [displayCount, setDisplayCount] = useState(truncate ? truncateStartStep : items?.length || 0);

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    
    // Memoize isMobile calculation
    const isMobile = useMemo(() => {
        return windowDimensions.width < theme.breakpoints.values.md;
    }, [windowDimensions.width, theme.breakpoints.values.md]);

    // Debounced resize handler
    useEffect(() => {
        let timeoutId;
        function handleResize() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const newDimensions = getWindowDimensions();
                setWindowDimensions(newDimensions);
            }, 150); // Debounce by 150ms
        }

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (truncate) {
            setDisplayCount(truncateStartStep);
        } else {
            setDisplayCount(items?.length || 0);
        }
    }, [truncate, truncateStartStep, items?.length]);
    
    // Memoize sliced items to avoid recalculating on every render
    const displayedItems = useMemo(() => {
        return items?.slice(0, displayCount) || [];
    }, [items, displayCount]);
    
    // Memoize show more handler
    const handleShowMore = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + truncateStep, items.length));
    }, [items]);

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
                        {displayedItems.map((item, index) => (
                            <ItemListRowType
                                key={item?.id || index}
                                item={item}
                                index={index}
                                showIndex={showIndex}
                                showIndexDifference={showIndexDifference}
                                indexDifferencePosition={indexDifferencePosition}
                                indexFromItem={indexFromItem}
                                startIndex={startIndex}
                                isCompact={isCompact}
                                leaderboardField={leaderboardField}
                                secondaryLeaderboardField={secondaryLeaderboardField}
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
                        <Typography sx={{ cursor: 'pointer', color: theme.palette.primary.main }} onClick={handleShowMore}>
                            Show more...
                        </Typography>
                    </Box>
                ) : null
            }
        </>
    )
});

export default ItemList;