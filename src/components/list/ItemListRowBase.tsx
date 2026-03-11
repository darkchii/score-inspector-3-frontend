import { TableCell, TableRow, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { FormatNumber, FormatNumberWithPrecision } from "../../util/Helper";
import { memo } from "react";
import type { MouseEventHandler, ReactNode } from "react";

export type LeaderboardFormatter = (value: unknown) => ReactNode;

export interface ItemListRowBaseProps<TItem extends object = object> {
    item?: TItem | null;
    cover_url?: string | null;
    index: number;
    showIndex?: boolean;
    showIndexDifference?: boolean;
    indexDifferencePosition?: string | null;
    indexFromItem?: string | null;
    startIndex?: number;
    leaderboardField?: string | null;
    secondaryLeaderboardField?: string | null;
    secondaryFieldColor?: string | null;
    leaderboardFormat?: LeaderboardFormatter | null;
    onClick?: MouseEventHandler<HTMLTableRowElement> | null;
    isCompact?: boolean;
    children?: ReactNode;
}

const getGainColor = (value: number, theme: Theme) => {
    if (value > 0) {
        return theme.palette.success.main;
    } else if (value < 0) {
        return theme.palette.error.main;
    }
    return theme.palette.text.primary;
};

const getValueByPath = (obj: object, path: string | null | undefined): unknown => {
    if (!path) {
        return null;
    }

    return path.split('.').reduce<unknown>((current, key) => {
        if (current && typeof current === 'object' && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return null;
    }, obj);
};

const ItemListRowBase = memo(function ItemListRowBase<TItem extends object>({
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
    isCompact = false,
    children
}: ItemListRowBaseProps<TItem>) {
    const theme = useTheme();

    if (!item) {
        return null;
    }

    const indexValue = indexFromItem ? getValueByPath(item, indexFromItem) : startIndex + index + 1;
    const indexDiffValueRaw = getValueByPath(item, indexDifferencePosition);
    const indexDiffValue = Number(indexDiffValueRaw ?? 0);
    const leaderboardValue = getValueByPath(item, leaderboardField);
    const secondaryLeaderboardValue = getValueByPath(item, secondaryLeaderboardField);

    const itemWithId = item as { id?: string | number };

    return (
        <TableRow
            key={String(itemWithId.id ?? index)}
            data-id={itemWithId.id}
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
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>#{FormatNumber(Number(indexValue ?? 0))}</Typography>
                    {
                        showIndexDifference && indexDifferencePosition &&
                        <Typography sx={{ fontSize: '0.75rem', color: getGainColor(indexDiffValue, theme) }}>
                            {indexDiffValue > 0 && `+${FormatNumber(indexDiffValue)}`}
                            {indexDiffValue < 0 && `${FormatNumber(indexDiffValue)}`}
                        </Typography>
                    }
                </TableCell>
            }
            {children}
            {
                leaderboardField &&
                <TableCell align="right" sx={{ pr: 3 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {leaderboardFormat ? leaderboardFormat(leaderboardValue) : FormatNumberWithPrecision(Number(leaderboardValue ?? 0), 2)}
                    </Typography>
                    {
                        secondaryLeaderboardField &&
                        <Typography sx={{ fontSize: '0.75rem', color: secondaryFieldColor || getGainColor(Number(secondaryLeaderboardValue ?? 0), theme) }}>
                            {leaderboardFormat ? leaderboardFormat(secondaryLeaderboardValue) : FormatNumberWithPrecision(Number(secondaryLeaderboardValue ?? 0), 2)}
                        </Typography>
                    }
                </TableCell>
            }
        </TableRow>
    )
});

export default ItemListRowBase;