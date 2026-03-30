import { Box, Chip } from "@mui/material";
import type { IUserTag } from "../types/types";
import BetterTooltip from "./tooltips/BetterTooltip";

function BeatmapUserTag({ tag }: { tag: IUserTag }) {
    return (
        // <Chip label={tag.name} size="small" sx={{ margin: 0.5 }} />
        // tag.name is a two section string, split by "/". First is category, second is value
        // Both need to be shown in a single chip, with category bold and darker background, and value normal and lighter background, as one chip
        <BetterTooltip title={tag.description} placement="top">
            <Box sx={{
                display: 'inline-flex',
                margin: 0.5,
                borderRadius: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                fontSize: '0.75rem',
                fontWeight: 'normal',
                '& .category': {
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: '2px 4px',
                    borderRadius: '12px 0 0 12px',
                },
                '& .value': {
                    padding: '2px 4px',
                    borderRadius: '0 12px 12px 0',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
            }}>
                <span className="category">{tag.name.split('/')[0]}</span>
                <span className="value">{tag.name.split('/')[1]}</span>
            </Box>
        </BetterTooltip>
    )
}

export default BeatmapUserTag;