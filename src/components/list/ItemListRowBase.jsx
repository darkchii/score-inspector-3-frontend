import { Avatar, TableCell, TableRow, Typography, useTheme } from "@mui/material";
import { FormatNumber, FormatNumberWithPrecision, getContrastColor } from "../../util/Helper";
import { memo } from "react";

const getGainColor = (value, theme) => {
    if(value > 0) {
        return theme.palette.success.main;
    } else if(value < 0) {
        return theme.palette.error.main;
    }
    return theme.palette.text.primary;
}

const ItemListRowBase = memo(function ItemListRowBase({
    item,
    cover_url,
    index,
    showIndex = true,
    showIndexDifference = false,
    indexDifferencePosition = null,
    indexFromItem = null,
    startIndex = 0,
    leaderboardField = null,
    secondaryLeaderboardField = null,
    secondaryFieldColor = null,
    leaderboardFormat = null,
    onClick = null,
    children
}) {
    const theme = useTheme();

    if(!item) {
        return null;
    }

    return (
        <TableRow
            key={item.id}
            data-id={item.id}
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                //content should be vertically centered and horizontally aligned to the left
                '& > *': {
                    zIndex: 2,
                    alignItems: 'center',
                    verticalAlign: 'middle',
                },
                backgroundImage: `url(${cover_url || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    transform: 'scale(0.98)',
                    boxShadow: theme.shadows[4],
                },
                position: 'relative',
            }}
        >
            {showIndex &&
                <TableCell width={40}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>#{FormatNumber(indexFromItem ? indexFromItem.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item) : startIndex + index + 1)}</Typography>
                    {
                        showIndexDifference && indexDifferencePosition &&
                        <Typography sx={{ fontSize: '0.75rem', color: getGainColor(item?.[indexDifferencePosition.split('.')[0]]?.[indexDifferencePosition.split('.')[1]], theme) }}>
                            {/* make sure to check separator (.) */}
                            {item?.[indexDifferencePosition.split('.')[0]]?.[indexDifferencePosition.split('.')[1]] > 0 && `+${FormatNumber(item[indexDifferencePosition.split('.')[0]][indexDifferencePosition.split('.')[1]])}`}
                            {item?.[indexDifferencePosition.split('.')[0]]?.[indexDifferencePosition.split('.')[1]] < 0 && `${FormatNumber(item[indexDifferencePosition.split('.')[0]][indexDifferencePosition.split('.')[1]])}`}
                        </Typography>
                    }
                </TableCell>
            }
            {children}
            {
                leaderboardField &&
                <TableCell align="right" sx={{ pr: 3 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {leaderboardFormat ? leaderboardFormat(leaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item)) : FormatNumberWithPrecision(leaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item), 2)}
                    </Typography>
                    {
                        secondaryLeaderboardField &&
                        <Typography sx={{ fontSize: '0.75rem', color: secondaryFieldColor || getGainColor(secondaryLeaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item), theme) }}>
                            {leaderboardFormat ? leaderboardFormat(secondaryLeaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item)) : FormatNumberWithPrecision(secondaryLeaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item), 2)}
                        </Typography>
                    }
                </TableCell>
            }
        </TableRow>
    )
});

export default ItemListRowBase;