import { Avatar, TableCell, TableRow, Typography, useTheme } from "@mui/material";
import { FormatNumber, getContrastColor } from "../../util/Helper";

function ItemListRowBase({
    item,
    cover_url,
    index,
    showIndex = true,
    startIndex = 0,
    leaderboardField = null,
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
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>#{FormatNumber(startIndex + index + 1)}</Typography>
                </TableCell>
            }
            {children}
            {
                leaderboardField &&
                <TableCell align="right" sx={{ pr: 3 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {leaderboardFormat ? leaderboardFormat(leaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item)) : FormatNumberWithPrecision(leaderboardField.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : null, item), 2)}
                    </Typography>
                </TableCell>
            }
        </TableRow>
    )
}

export default ItemListRowBase;