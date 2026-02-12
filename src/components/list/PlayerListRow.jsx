import { Avatar, Box, TableCell, TableRow, Typography, useTheme } from "@mui/material";
import { getContrastColor } from "../../util/Helper";
import ItemListRowBase from "./ItemListRowBase";
import { useNavigate } from "react-router";
import PlayerLink from "../PlayerLink";

function PlayerListRow({ item, index, isCompact = false, showIndex = true, startIndex = 0, leaderboardField = null, leaderboardFormat = null }) {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <ItemListRowBase
            cover_url={item?.osuApi?.cover?.custom_url || item?.osuApi?.cover?.url || ''}
            index={index}
            isCompact={isCompact}
            showIndex={showIndex}
            startIndex={startIndex}
            leaderboardField={leaderboardField}
            leaderboardFormat={leaderboardFormat}
            item={item}
            onClick={() => navigate(`/user/${item?.osuAlternative?.user_id || item?.osuApi?.id}`)}
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
                    {/* <Avatar
                        src={item?.osuApi?.avatar_url || ''}
                        alt={item?.osuApi?.username || 'Avatar'}
                        sx={{ width: isCompact ? 32 : 40, height: isCompact ? 32 : 40, borderRadius: '4px', mr: 1 }}
                    />
                    {
                        item.team &&
                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: item.team.color || '#000000', p: 0.3, mr: 1, borderRadius: `${theme.shape.borderRadius}px` }}>
                            <Typography sx={{ fontSize: '0.85rem', color: getContrastColor(item?.team.color || '#000000') }} >{item.team.short_name}</Typography>
                        </Box>
                    }
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item?.osuApi?.username || 'Unknown'}</Typography> */}
                    <PlayerLink data={item} size={32} />
                </div>
            </TableCell>
        </ItemListRowBase>
    )
}

export default PlayerListRow;