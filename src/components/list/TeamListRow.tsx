import { Avatar, Box, TableCell, TableRow, Typography, useTheme } from "@mui/material";
import { getContrastColor } from "../../util/Helper";
import ItemListRowBase from "./ItemListRowBase";
import type { ItemListRowBaseProps } from "./ItemListRowBase";
import { useNavigate } from "react-router";
import PlayerLink from "../PlayerLink";
import { memo, useCallback } from "react";

type TeamListItem = {
    id: number | string;
    name: string;
    short_name?: string;
    color?: string;
    header_url?: string;
    flag_url?: string;
} & Record<string, unknown>;

interface TeamListRowProps extends Omit<ItemListRowBaseProps<TeamListItem>, "cover_url" | "children" | "onClick"> {
    isCompact?: boolean;
}

const TeamListRow = memo(function TeamListRow({
    item,
    index,
    isCompact = false,
    showIndex = true,
    showIndexDifference = false,
    indexDifferencePosition = null,
    indexFromItem = null,
    startIndex = 0,
    leaderboardField = null,
    secondaryLeaderboardField = null,
    secondaryFieldColor = null,
    leaderboardFormat = null,
    ...props
}: TeamListRowProps) {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        if (item?.id) {
            window.open(`https://osu.ppy.sh/teams/${item.id}`, '_blank');
        }
    }, [navigate, item?.id]);

    return (
        <ItemListRowBase
            // cover_url={item?.osuApi?.cover?.custom_url || item?.osuApi?.cover?.url || ''}
            cover_url={item?.header_url || ''}
            index={index}
            isCompact={isCompact}
            showIndex={showIndex}
            showIndexDifference={showIndexDifference}
            indexDifferencePosition={indexDifferencePosition}
            startIndex={startIndex}
            indexFromItem={indexFromItem}
            leaderboardField={leaderboardField}
            secondaryLeaderboardField={secondaryLeaderboardField}
            secondaryFieldColor={secondaryFieldColor}
            leaderboardFormat={leaderboardFormat}

            item={item}
            onClick={handleClick}
            {...props}
        >
            <TableCell sx={{ maxWidth: '100px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    gap: 1
                }}>
                    <img
                        src={item?.flag_url || ''}
                        height={24}
                        style={{
                            borderRadius: '4px',
                            paddingRight: item?.flag_url ? '4px' : 0
                        }}
                    />
                    <Typography variant="body2">
                        <span style={{ color: item?.color, fontWeight: 'bold' }}>[{item?.short_name}] </span>
                        {item?.name}
                    </Typography>
                </div>
            </TableCell>
        </ItemListRowBase>
    )
});

export default TeamListRow;